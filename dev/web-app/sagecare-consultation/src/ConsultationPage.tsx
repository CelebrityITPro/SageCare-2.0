import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import WavEncoder from 'wav-encoder';

// Dynamic URL configuration for network access
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSecure = protocol === 'https:';
  
  // Use environment variables if available (for Docker), otherwise fall back to localhost
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const sttBase = process.env.REACT_APP_STT_URL || 'ws://localhost:8001';
  
  // If we're on localhost, use localhost for backend too
  if (isLocalhost) {
    return {
      signaling: `${apiBase}/signaling`,
      stt: `${sttBase}/ws`,
      api: apiBase
    };
  }
  
  // For network access, use the same hostname but different ports
  // Use HTTPS for signaling and API if the frontend is HTTPS, otherwise HTTP
  const backendProtocol = isSecure ? 'https:' : 'http:';
  const wsProtocol = isSecure ? 'wss:' : 'ws:';
  
  return {
    signaling: `${backendProtocol}//${hostname}:5000/signaling`,
    stt: `${wsProtocol}//${hostname}:8001/ws`,
    api: `${backendProtocol}//${hostname}:5000`
  };
};

const { signaling: SIGNALING_SERVER_URL, stt: STT_WS_URL, api: API_BASE_URL } = getBaseUrl();

function ConsultationPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [transcriptEntries, setTranscriptEntries] = useState<Array<{speaker: string, text: string, timestamp: number}>>([]);
  const [error, setError] = useState('');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
     const audioMixingRef = useRef<{
     ctx: AudioContext | null;
     dest: MediaStreamAudioDestinationNode | null;
     ws: WebSocket | null;
     interval: number;
     audioSources: MediaStreamAudioSourceNode[];
   } | null>(null);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [nameModalOpen, setNameModalOpen] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantNames, setParticipantNames] = useState<{[key: string]: string}>({});
  const [notifications, setNotifications] = useState<{ type: string; name: string }[]>([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [whisperConnected, setWhisperConnected] = useState(false);
  const [isIntentionalClosure, setIsIntentionalClosure] = useState(false);

  // Function to remove duplicate phrases from transcript
  const removeDuplicates = (text: string) => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const uniqueSentences: string[] = [];
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed && !uniqueSentences.includes(trimmed)) {
        uniqueSentences.push(trimmed);
      }
    }
    
    return uniqueSentences.join(' ');
  };

  // Function to clean up all media resources
  const cleanupMediaResources = () => {
    console.log('Cleaning up all media resources...');
    setIsCleaningUp(true); // Set cleanup flag to stop audio processing
    setIsIntentionalClosure(true); // Set intentional closure flag to prevent error messages
    
    // Stop all media tracks
    if (localStreamRef.current) {
      console.log('Stopping local media tracks...');
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (remoteStreamRef.current) {
      console.log('Stopping remote media tracks...');
      remoteStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping remote track:', track.kind);
        track.stop();
      });
      remoteStreamRef.current = null;
    }
    
    // Close peer connection
    if (pcRef.current) {
      console.log('Closing peer connection...');
      pcRef.current.close();
      pcRef.current = null;
    }
    
    // Disconnect socket
    if (socketRef.current) {
      console.log('Disconnecting socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Stop audio mixing and transcription - CRITICAL FIX
    if (audioMixingRef.current) {
      console.log('Stopping audio mixing and transcription...');
      
      // Clear the interval first
      if (audioMixingRef.current.interval) {
        console.log('Clearing audio processing interval...');
        clearInterval(audioMixingRef.current.interval);
        audioMixingRef.current.interval = 0;
      }
      
      // Clear remote stream check interval
      if ((audioMixingRef.current as any).remoteStreamCheckInterval) {
        console.log('Clearing remote stream check interval...');
        clearInterval((audioMixingRef.current as any).remoteStreamCheckInterval);
      }
      
      // Close WebSocket connection
      if (audioMixingRef.current.ws) {
        console.log('Closing WebSocket connection...');
        audioMixingRef.current.ws.close();
        audioMixingRef.current.ws = null;
      }
      
      // CRITICAL: Disconnect all audio nodes to stop audio capture
      if (audioMixingRef.current && audioMixingRef.current.ctx) {
        console.log('Disconnecting audio nodes and closing AudioContext...');
        
        // Disconnect all audio sources first
        if (audioMixingRef.current.audioSources) {
          console.log('Disconnecting audio sources...');
          audioMixingRef.current.audioSources.forEach(source => {
            try {
              source.disconnect();
              console.log('Audio source disconnected');
            } catch (err) {
              console.error('Error disconnecting audio source:', err);
            }
          });
        }
        
        // Suspend the audio context immediately to stop all audio processing
        audioMixingRef.current.ctx.suspend().then(() => {
          console.log('AudioContext suspended successfully');
          // Close the audio context
          return audioMixingRef.current?.ctx?.close();
        }).then(() => {
          console.log('AudioContext closed successfully');
        }).catch(err => {
          console.error('Error closing AudioContext:', err);
        });
        
        audioMixingRef.current.ctx = null;
      }
      
      // Clear the reference
      console.log('Clearing audioMixingRef.current to null');
      audioMixingRef.current = null;
      console.log('Audio mixing cleanup completed');
    }
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    console.log('All media resources cleaned up');
    
    // Reset intentional closure flag after a short delay
    setTimeout(() => {
      setIsIntentionalClosure(false);
    }, 1000);
  };

  // Function to start audio mixing for STT
  const startAudioMixing = (captionsEnabledParam?: boolean) => {
    // Don't start if cleanup is in progress
    if (isCleaningUp) {
      console.log('Audio mixing not started - cleanup in progress');
      return;
    }
    
    const isEnabled = captionsEnabledParam !== undefined ? captionsEnabledParam : captionsEnabled;
    console.log('startAudioMixing called, captionsEnabled:', isEnabled);
    if (!isEnabled) {
      console.log('Captions not enabled, returning early');
      return;
    }
    
    // Prevent multiple audio mixing sessions
    if (audioMixingRef.current) {
      console.log('Audio mixing already active, stopping previous session');
      if (audioMixingRef.current.interval) clearInterval(audioMixingRef.current.interval);
      if (audioMixingRef.current.ctx) audioMixingRef.current.ctx.close();
      if (audioMixingRef.current.ws) {
        audioMixingRef.current.ws.close();
      }
      audioMixingRef.current = null;
    }
    
    try {
      console.log('Creating AudioContext...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      console.log('AudioContext created:', ctx);
      
      console.log('AudioContext setup complete');
       
      if (!localStreamRef.current) {
        console.error('No local stream available');
        return;
      }
      
      // Connect to Whisper API WebSocket
      console.log('Creating WebSocket connection to:', STT_WS_URL);
      const ws = new WebSocket(STT_WS_URL);
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't set error for normal WebSocket errors during connection
        // Only set error if the connection actually fails
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection to Whisper API closed:', event.code, event.reason);
        setWhisperConnected(false);
        // Don't set error for normal closures or intentional closures
        if (event.code !== 1000 && event.code !== 1001 && event.code !== 1006 && !isIntentionalClosure) {
          setError('Whisper API connection closed.');
        }
        // Don't clear audioMixingRef here - let the cleanup function handle it
        console.log('WebSocket closed, but audio mixing ref preserved for cleanup');
      };
      
      ws.onopen = () => {
        console.log('Connected to Whisper API WebSocket');
        setWhisperConnected(true);
        // Send initial configuration message
        console.log('Sending config message to Whisper API');
        ws.send(JSON.stringify({ type: 'config' }));
      };
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('Received from Whisper API:', msg);
          
          if (msg.type === 'transcription' && msg.text) {
            // Handle different types of transcription results
            if (msg.final) {
              // Final transcription - add to transcript
              // Since we're mixing both local and remote audio, we can't reliably determine speaker
              const newEntry = {
                speaker: 'Meeting', // Generic label for mixed audio
                text: msg.text.trim(),
                timestamp: Date.now()
              };
              
              setTranscriptEntries(prev => {
                const updated = [...prev, newEntry];
                // Keep only last 50 entries to prevent memory issues
                return updated.slice(-50);
              });
              
              // Update plain transcript for saving
              setTranscript(prev => {
                const timestamp = new Date().toLocaleTimeString();
                const newTranscript = prev.trim() + (prev.trim() ? '\n' : '') + `[${timestamp}] ${msg.text.trim()}`;
                const deduplicated = removeDuplicates(newTranscript);
                console.log('Final transcription added:', msg.text);
                return deduplicated;
              });
            } else {
              // Interim transcription - always add as new entry
              const newEntry = {
                speaker: 'Meeting', // Generic label for mixed audio
                text: msg.text.trim(),
                timestamp: Date.now()
              };
              
              setTranscriptEntries(prev => {
                const updated = [...prev, newEntry];
                // Keep only last 50 entries to prevent memory issues
                return updated.slice(-50);
              });
            }
            
            // Log additional metadata if available
            if (msg.confidence !== undefined) {
              console.log('Transcription confidence:', msg.confidence);
            }
            if (msg.speech_detected !== undefined) {
              console.log('Speech detected:', msg.speech_detected);
            }
            if (msg.energy !== undefined) {
              console.log('Audio energy:', msg.energy);
            }
          } else if (msg.type === 'error') {
            console.error('Whisper API error:', msg.message);
            setError('Transcription error: ' + msg.message);
          } else if (msg.type === 'config_ack') {
            console.log('Whisper API configured successfully with features:', msg.features);
          } else if (msg.type === 'keepalive_ack') {
            console.log('Whisper API keep-alive acknowledged, connection maintained');
          }
        } catch (e) {
          console.error('Error parsing Whisper API message:', e);
        }
      };
      
      // Create audio processor for real-time audio capture with optimized buffer size
      const bufferSize = 4096; // Optimized for 16kHz
      const recorder = ctx.createScriptProcessor(bufferSize, 1, 1);
      const audioBufferQueue: Float32Array[] = [];
      
      // Ensure AudioContext is running
      if (ctx.state === 'suspended') {
        console.log('Resuming AudioContext...');
        ctx.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch(err => {
          console.error('Error resuming AudioContext:', err);
        });
      }
      
      recorder.onaudioprocess = (e) => {
        // Stop processing if cleanup is in progress
        if (isCleaningUp) {
          console.log('Audio processing stopped due to cleanup');
          return;
        }
        
        // Additional check: if audioMixingRef is null, stop processing
        if (!audioMixingRef.current) {
          console.log('Audio processing stopped - audio mixing ref is null');
          return;
        }
        
        const audioData = new Float32Array(e.inputBuffer.getChannelData(0));
        audioBufferQueue.push(audioData);
        console.log('Audio captured, buffer length:', audioData.length, 'queue length:', audioBufferQueue.length);
      };
      
      // Store audio sources for proper cleanup
      const audioSources: MediaStreamAudioSourceNode[] = [];
      
      // Connect audio sources to the recorder
      if (localStreamRef.current) {
        const localSource = ctx.createMediaStreamSource(localStreamRef.current);
        localSource.connect(recorder);
        audioSources.push(localSource);
        console.log('Connected local audio source');
      }

      if (remoteStreamRef.current) {
        const remoteSource = ctx.createMediaStreamSource(remoteStreamRef.current);
        remoteSource.connect(recorder);
        audioSources.push(remoteSource);
        console.log('Connected remote audio source');
      }

      // If no remote stream yet, set up a listener for when it becomes available
      if (!remoteStreamRef.current) {
        console.log('No remote stream available yet, will connect when available');
        const checkRemoteStream = () => {
          if (remoteStreamRef.current && audioMixingRef.current) {
            console.log('Remote stream now available, connecting to audio mixer');
            const remoteSource = ctx.createMediaStreamSource(remoteStreamRef.current);
            remoteSource.connect(recorder);
            audioSources.push(remoteSource);
            console.log('Connected remote audio source (delayed)');
            // Stop checking once connected
            clearInterval(remoteStreamCheckInterval);
          }
        };
        const remoteStreamCheckInterval = setInterval(checkRemoteStream, 1000);
        // Store the interval for cleanup
        if (audioMixingRef.current) {
          (audioMixingRef.current as any).remoteStreamCheckInterval = remoteStreamCheckInterval;
        }
      }

      // Connect recorder to a MediaStreamDestination to complete the audio graph
      // This allows audio processing without playing through speakers
      const dest = ctx.createMediaStreamDestination();
      recorder.connect(dest);
      console.log('Connected recorder to destination');

      // Send audio data to Whisper API every 3 seconds with 0.5s overlap
      const interval = window.setInterval(async () => {
        // Stop processing if cleanup is in progress
        if (isCleaningUp) {
          console.log('Audio processing interval stopped due to cleanup');
          return;
        }
        
        console.log('Audio processing interval - queue length:', audioBufferQueue.length, 'ws readyState:', ws?.readyState, 'audioMixingRef:', !!audioMixingRef.current);

        if (ws && ws.readyState === 1) {
          const startTime = Date.now();
          const totalLength = audioBufferQueue.reduce((acc: number, arr: Float32Array) => acc + arr.length, 0);
          console.log('Processing audio chunk, total length:', totalLength);

          // If we have audio data, process it
          if (audioBufferQueue.length > 0) {
            // Calculate overlap: keep last 0.5 seconds (8000 samples at 16kHz) for context
            const overlapSamples = 8000; // 0.5 seconds at 16kHz
            const samplesToProcess = Math.min(totalLength, 48000); // 3 seconds at 16kHz
            const samplesToKeep = Math.min(overlapSamples, totalLength - samplesToProcess);

            const mixed = new Float32Array(samplesToProcess);
            let offset = 0;
            let samplesProcessed = 0;

            // Process audio chunks with error handling
            try {
              for (const arr of audioBufferQueue) {
                if (samplesProcessed >= samplesToProcess) break;
                const samplesToTake = Math.min(arr.length, samplesToProcess - samplesProcessed);
                mixed.set(arr.slice(0, samplesToTake), offset);
                offset += samplesToTake;
                samplesProcessed += samplesToTake;
              }

              // Keep overlap for next iteration
              if (samplesToKeep > 0) {
                const overlapData = new Float32Array(samplesToKeep);
                let overlapOffset = 0;
                let samplesFromOverlap = 0;

                for (const arr of audioBufferQueue) {
                  if (samplesFromOverlap >= samplesToKeep) break;
                  const samplesToTake = Math.min(arr.length, samplesToKeep - samplesFromOverlap);
                  const startIndex = Math.max(0, arr.length - samplesToTake);
                  overlapData.set(arr.slice(startIndex), overlapOffset);
                  overlapOffset += samplesToTake;
                  samplesFromOverlap += samplesToTake;
                }

                // Replace queue with overlap data
                audioBufferQueue.length = 0;
                audioBufferQueue.push(overlapData);
              } else {
                audioBufferQueue.length = 0;
              }

              // Convert Float32Array to 16-bit PCM for Whisper API with error handling
              const pcmData = new Int16Array(mixed.length);
              for (let i = 0; i < mixed.length; i++) {
                // Convert float to 16-bit integer with clipping
                const sample = Math.max(-1, Math.min(1, mixed[i]));
                pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
              }

              console.log('Sending PCM data to Whisper API, size:', pcmData.buffer.byteLength, 'samples:', mixed.length);
              // Send raw PCM data to Whisper API
              ws.send(pcmData.buffer);

            } catch (err) {
              console.error('Failed to process audio chunk:', err);
              // Clear the queue to prevent accumulation of bad data
              audioBufferQueue.length = 0;
            }
          } else {
            console.log('No audio data available, sending silence to maintain connection');
            // Send a small amount of silence to maintain the audio stream
            const silenceSamples = 16000; // 1 second of silence at 16kHz
            const silenceData = new Int16Array(silenceSamples);
            ws.send(silenceData.buffer);
          }
        }
      }, 3000); // Use fixed interval

      // Store audio sources in the ref for cleanup
      audioMixingRef.current = { ctx, dest, ws, interval, audioSources };
      console.log('Audio mixing ref set successfully:', !!audioMixingRef.current);
    } catch (err) {
      console.error('Error initializing audio mixing:', err);
      setError('Error initializing audio mixing: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    if (!meetingId || nameModalOpen) return;

    // Reset cleanup flag
    setIsCleaningUp(false);

    // 1. Connect to signaling server
    let socket: ReturnType<typeof io>;
    try {
      console.log('🔌 Attempting to connect to signaling server:', SIGNALING_SERVER_URL);
      socket = io(SIGNALING_SERVER_URL);
      socketRef.current = socket;
      
      // Add connection event handlers for debugging
      socket.on('connect', () => {
        console.log('✅ Socket.io connected successfully');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.io connection failed:', error);
        setError('Failed to connect to signaling server: ' + error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.io disconnected:', reason);
      });

      socket.on('error', (error) => {
        console.error('❌ Socket.io error:', error);
      });
      
    } catch (err) {
      console.error('❌ Failed to create Socket.io connection:', err);
      setError('Failed to connect to signaling server.');
      return;
    }

    // 2. Join the signaling room
    console.log('📡 Joining signaling room:', meetingId, 'as:', displayName);
    socket.emit('join', { meetingId, name: displayName });

    // 3. Set up peer connection
    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;
    } catch (err) {
      setError('Failed to create WebRTC peer connection.');
      return;
    }

    // 4. Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📡 Sending ICE candidate...');
        console.log('📡 ICE candidate:', event.candidate);
        socket.emit('signal', {
          meetingId,
          data: { type: 'ice-candidate', candidate: event.candidate },
        });
      } else {
        console.log('📡 ICE candidate gathering complete');
      }
    };

    // 5. Handle remote stream
    pc.ontrack = (event) => {
      console.log('📹 Remote stream received!');
      console.log('📹 Remote video ref exists:', !!remoteVideoRef.current);
      console.log('📹 Remote stream tracks:', event.streams[0].getTracks().map(t => t.kind));
      console.log('📹 Participants count:', participants.length);
      console.log('📹 Remote video element:', remoteVideoRef.current);
      console.log('📹 Remote stream:', event.streams[0]);
      
      if (remoteVideoRef.current) {
        (remoteVideoRef.current).srcObject = event.streams[0];
        console.log('📹 Remote video stream set');
        
        // Force the remote video container to be visible immediately
        const remoteVideoContainer = remoteVideoRef.current.parentElement;
        if (remoteVideoContainer) {
          remoteVideoContainer.style.display = 'block';
          console.log('📹 Forced remote video container visible on stream receive');
        }
        
        // Force the remote video to load and play
        (remoteVideoRef.current).load();
        (remoteVideoRef.current).play().then(() => {
          console.log('📹 Remote video play successful');
        }).catch(e => {
          console.error('📹 Remote video play error:', e);
        });
      } else {
        console.error('📹 Remote video ref is null!');
        console.log('📹 DOM structure check:', document.querySelector('video[ref="remoteVideoRef"]'));
        console.log('📹 All video elements:', document.querySelectorAll('video'));
      }
      remoteStreamRef.current = event.streams[0];
      console.log('📹 Remote stream saved to ref');
    };

    // Add peer connection state change debugging
    pc.onconnectionstatechange = () => {
      console.log('🔗 Peer connection state changed:', pc.connectionState);
      
      // Clear remote stream when connection is lost
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('🔗 Peer connection lost, clearing remote stream');
        if (remoteStreamRef.current) {
          remoteStreamRef.current = null;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state changed:', pc.iceConnectionState);
      
      // Clear remote stream when ICE connection is lost
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        console.log('🧊 ICE connection lost, clearing remote stream');
        if (remoteStreamRef.current) {
          remoteStreamRef.current = null;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        }
      }
    };

    // 6. Get local media
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback for older browsers
      const getUserMedia = (navigator as any).getUserMedia || 
                          (navigator as any).webkitGetUserMedia || 
                          (navigator as any).mozGetUserMedia || 
                          (navigator as any).msGetUserMedia;
      
      if (!getUserMedia) {
        setError('Media devices not supported. Please use a modern browser with camera/microphone support.');
        setLoading(false);
        return;
      }
      
      // Use legacy getUserMedia
      getUserMedia.call(navigator, { video: true, audio: true }, 
        (stream: MediaStream) => {
          console.log('Media stream obtained (legacy):', stream);
          localStreamRef.current = stream;
          setLoading(false);
        },
        (err: any) => {
          setError('Error accessing media devices: ' + err.message);
          setLoading(false);
        }
      );
      return;
    }

    // Check if we're on HTTPS or localhost (required for media access on non-localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';
    const isSecure = window.location.protocol === 'https:';
    
    if (!isSecure && !isLocalhost) {
      console.warn('Camera and microphone access may be limited on non-HTTPS connections');
      // For development/testing, allow HTTP access with a warning
      console.warn('Allowing HTTP access for development. In production, use HTTPS.');
      // Don't block the request, just warn
    }

    // Try to get media with better error handling
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }, 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
      .then((stream) => {
        console.log('Media stream obtained:', stream);
        localStreamRef.current = stream;
        
        // Function to set video stream
        const setVideoStream = () => {
          if (localVideoRef.current) {
            console.log('Setting video srcObject');
            console.log('Video element:', localVideoRef.current);
            console.log('Stream tracks:', stream.getTracks());
            
            // Set the stream to the video element
            (localVideoRef.current).srcObject = stream;
            console.log('srcObject set, attempting to play...');
            
            // Force the video to load and play
            (localVideoRef.current).load();
            
            // Try to play immediately
            (localVideoRef.current).play().then(() => {
              console.log('Video play successful');
            }).catch(e => {
              console.error('Video play error:', e);
              // Try alternative approach with delay
              setTimeout(() => {
                if (localVideoRef.current) {
                  console.log('Retrying video play...');
                  (localVideoRef.current).play().then(() => {
                    console.log('Retry video play successful');
                  }).catch(e2 => console.error('Retry play error:', e2));
                }
              }, 500);
            });
            
            return true;
          } else {
            console.log('localVideoRef.current is null, will retry...');
            return false;
          }
        };
        
        // Try to set video stream immediately
        if (!setVideoStream()) {
          // If video element doesn't exist yet, retry after a short delay
          setTimeout(() => {
            if (!setVideoStream()) {
              // If still doesn't exist, retry again
              setTimeout(() => {
                setVideoStream();
              }, 100);
            }
          }, 50);
        }
        
        // Add tracks to peer connection
        stream.getTracks().forEach((track: MediaStreamTrack) => {
          console.log('Adding track to peer connection:', track.kind);
          pc.addTrack(track, stream);
        });

        // Signal that we're ready to start WebRTC negotiation
        console.log('📡 Signaling ready for WebRTC negotiation...');
        socket.emit('signal', {
          meetingId,
          data: { type: 'ready' },
        });

        // 7. Handle signaling
        socket.on('signal', async (data: any) => {
          console.log('📡 Received signal:', data.type);
          console.log('📡 Signal data:', data);
          console.log('📡 Current participants:', participants);
          console.log('📡 Remote video ref exists:', !!remoteVideoRef.current);
          
          try {
            if (data.type === 'offer') {
              console.log('📡 Processing offer...');
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              console.log('📡 Remote description set successfully');
              const answer = await pc.createAnswer();
              console.log('📡 Answer created:', answer);
              await pc.setLocalDescription(answer);
              console.log('📡 Local description set, sending answer...');
              socket.emit('signal', {
                meetingId,
                data: { type: 'answer', answer },
              });
            } else if (data.type === 'answer') {
              console.log('📡 Processing answer...');
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
              console.log('📡 Answer processed successfully');
            } else if (data.type === 'ice-candidate') {
              console.log('📡 Processing ICE candidate...');
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log('📡 ICE candidate added successfully');
              } catch (e) {
                console.error('❌ Error adding ICE candidate:', e);
                setError('Error adding received ICE candidate.');
              }
            }
          } catch (err) {
            console.error('❌ WebRTC signaling error:', err);
            console.error('❌ Error details:', err instanceof Error ? err.message : String(err));
            setError('WebRTC signaling error: ' + (err instanceof Error ? err.message : String(err)));
          }
        });

        // 8. If caller, create offer
        socket.once('ready', async () => {
          console.log('📡 Received ready signal, creating offer...');
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('📡 Sending offer...');
            socket.emit('signal', {
              meetingId,
              data: { type: 'offer', offer },
            });
          } catch (err) {
            console.error('❌ Failed to create offer:', err);
            setError('Failed to create offer: ' + (err instanceof Error ? err.message : String(err)));
          }
        });

        // 9. Handle participant updates
        socket.on('participants', (participants: string[]) => {
          console.log('📡 Participants updated:', participants);
          console.log('📡 Previous participants count:', participants.length);
          console.log('📡 Remote video ref exists:', !!remoteVideoRef.current);
          console.log('📡 Remote video element display:', remoteVideoRef.current?.style.display);
          console.log('📡 Remote stream ref exists:', !!remoteStreamRef.current);
          console.log('📡 Display condition check - participants.length > 1:', participants.length > 1);
          console.log('📡 Display condition check - remoteStreamRef.current:', !!remoteStreamRef.current);
          console.log('📡 Final display condition:', (participants.length > 1 || !!remoteStreamRef.current));
          
          setParticipants(participants);
          
          // Create a mapping of participant names
          const namesMap: {[key: string]: string} = {};
          participants.forEach(name => {
            if (name !== displayName) {
              namesMap[name] = name;
            }
          });
          setParticipantNames(namesMap);
          
          // Check if remote video should be visible
          if (participants.length > 1 || remoteStreamRef.current) {
            console.log('📡 Multiple participants or remote stream detected, remote video should be visible');
            // Force a re-render to ensure remote video is shown
            setTimeout(() => {
              console.log('📡 Remote video ref after timeout:', !!remoteVideoRef.current);
              console.log('📡 Remote video display after timeout:', remoteVideoRef.current?.style.display);
              console.log('📡 Remote stream ref after timeout:', !!remoteStreamRef.current);
            }, 100);
          }
        });

        // 10. Fallback: Request participants list if not received within 5 seconds
        setTimeout(() => {
          if (participants.length === 0) {
            console.log('📡 No participants received, requesting participants list...');
            socket.emit('signal', { 
              meetingId, 
              data: { type: 'get-participants' } 
            });
          }
        }, 5000);

        socket.on('user-joined', (name: string) => {
          setNotifications(prev => [...prev, { type: 'join', name }]);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => !(n.type === 'join' && n.name === name)));
          }, 3000);
        });

        socket.on('user-left', (name: string) => {
          console.log('📡 User left:', name);
          setNotifications(prev => [...prev, { type: 'leave', name }]);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => !(n.type === 'leave' && n.name === name)));
          }, 3000);
          
          // Clear remote stream when user leaves
          if (remoteStreamRef.current) {
            console.log('📡 Clearing remote stream due to user leaving');
            remoteStreamRef.current = null;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          }
          
          // Force re-render to hide remote video completely
          setParticipants(prev => prev.filter(p => p !== name));
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Media access error:', err);
        let errorMessage = 'Error accessing media devices.';
        
        // Provide specific error messages based on error type
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow access and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a camera and microphone.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera or microphone is already in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera or microphone does not meet the required specifications.';
        } else if (err.name === 'TypeError') {
          errorMessage = 'Invalid media constraints. Please try refreshing the page.';
        } else if (err.name === 'AbortError') {
          errorMessage = 'Media access was aborted. Please try again.';
        } else if (err.name === 'SecurityError') {
          errorMessage = 'Media access blocked due to security restrictions. Please use HTTPS or localhost.';
        }
        
        setError(errorMessage);
        setLoading(false);
      });

    // Cleanup function - CRITICAL for privacy and security
    return () => {
      console.log('Component unmounting - cleaning up all resources...');
      cleanupMediaResources();
    };
  }, [meetingId, nameModalOpen, displayName]);

  // Effect to set video stream when video element becomes available
  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current && !loading) {
      console.log('Video element available, setting stream...');
      const video = localVideoRef.current;
      const stream = localStreamRef.current;
      
      // Only set if not already set and video is not already playing
      if (!video.srcObject && video.readyState === 0) {
        video.srcObject = stream;
        video.load();
        video.play().then(() => {
          console.log('Video play successful from useEffect');
        }).catch(e => {
          console.error('Video play error from useEffect:', e);
        });
      }
    }
  }, [loading]);

  // Effect to ensure remote video element is properly set up
  useEffect(() => {
    if (remoteStreamRef.current && remoteVideoRef.current) {
      console.log('Remote stream available, ensuring video element is set up...');
      const video = remoteVideoRef.current;
      const stream = remoteStreamRef.current;
      
      if (!video.srcObject) {
        video.srcObject = stream;
        video.load();
        video.play().then(() => {
          console.log('Remote video play successful from useEffect');
        }).catch(e => {
          console.error('Remote video play error from useEffect:', e);
        });
      }
    }
  }, [remoteStreamRef.current]);

  useEffect(() => {
    if (!meetingId) return;
    let saveInterval: number | null = null;
    
    async function saveTranscript() {
      if (!transcriptEntries.length) return;
      
      try {
        setIsSaving(true);
        setSaveError('');
        
        // Format transcript with speaker names for saving
        const formattedTranscript = transcriptEntries
          .map(entry => `${entry.speaker}: ${entry.text}`)
          .join('\n');
        
        const response = await fetch(`${API_BASE_URL}/api/appointments/${meetingId}/transcript`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: formattedTranscript }),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Appointment not found - this is expected for test meetings');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Transcript saved successfully');
      } catch (error) {
        console.error('Error saving transcript:', error);
        setSaveError('Failed to save transcript: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsSaving(false);
      }
    }
    
    saveInterval = window.setInterval(saveTranscript, 10000);
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [meetingId, transcriptEntries]);

  // Handle window beforeunload to clean up media resources
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('Window beforeunload detected - cleaning up media resources...');
      cleanupMediaResources();
      
      // Show a warning to the user
      const message = 'You are leaving the meeting. All media streams will be stopped.';
      event.returnValue = message;
      return message;
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Effect to monitor remote video element rendering
  useEffect(() => {
    console.log('🔍 Remote video ref changed:', !!remoteVideoRef.current);
    console.log('🔍 Participants count:', participants.length);
    console.log('🔍 Remote video should be visible:', participants.length > 1);
    console.log('🔍 Remote stream ref exists:', !!remoteStreamRef.current);
    
    if (remoteVideoRef.current) {
      console.log('🔍 Remote video element found');
      console.log('🔍 Remote video display style:', remoteVideoRef.current.style.display);
      console.log('🔍 Remote video srcObject:', remoteVideoRef.current.srcObject);
    } else {
      console.log('🔍 Remote video ref is null');
      // Check DOM structure
      const allVideos = document.querySelectorAll('video');
      console.log('🔍 All video elements in DOM:', allVideos.length);
      allVideos.forEach((video, index) => {
        console.log(`🔍 Video ${index}:`, video);
      });
    }
  }, [participants.length]);

  // Effect to force remote video visibility when we have a remote stream
  useEffect(() => {
    if (remoteStreamRef.current && remoteVideoRef.current) {
      console.log('🔍 Remote stream available, ensuring video element is set up...');
      // Force the remote video to be visible
      const remoteVideoContainer = remoteVideoRef.current.parentElement;
      if (remoteVideoContainer) {
        remoteVideoContainer.style.display = 'block';
        console.log('🔍 Forced remote video container to be visible');
      }
    }
  }, [remoteStreamRef.current]);

  // Monitor participants list changes and ensure remote video is visible when needed
  useEffect(() => {
    console.log('🔍 Participants list changed:', participants);
    console.log('🔍 Remote stream exists:', !!remoteStreamRef.current);
    console.log('🔍 Should show remote video:', (participants.length > 1 || !!remoteStreamRef.current));
    
    if ((participants.length > 1 || remoteStreamRef.current) && remoteVideoRef.current) {
      const remoteVideoElement = remoteVideoRef.current;
      if (remoteVideoElement.parentElement) {
        remoteVideoElement.parentElement.style.display = 'block';
        console.log('🔍 Forced remote video container visible due to participants/stream change');
      }
    }
  }, [participants, remoteStreamRef.current]);

  // UI Controls
  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled((prev) => !prev);
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled((prev) => !prev);
    }
  };

    const handleToggleCaptions = () => {
    console.log('handleToggleCaptions called, current state:', captionsEnabled);
    setCaptionsEnabled(prev => {
      const newState = !prev;
      console.log('Setting captions to:', newState);
      
      if (newState) {
        // Start audio mixing when captions are enabled
        console.log('Starting audio mixing...');
        if (localStreamRef.current) {
          console.log('Local stream available, calling startAudioMixing');
          startAudioMixing(newState);
        } else {
          console.error('No local stream available for audio mixing');
        }
      } else {
        // Stop audio mixing when captions are disabled
        console.log('Stopping audio mixing and closing Whisper API connection...');
        
        // Set intentional closure flag to prevent error message
        setIsIntentionalClosure(true);
        
        if (audioMixingRef.current) {
          // Clear the interval first
          if (audioMixingRef.current.interval) {
            console.log('Clearing audio processing interval...');
            clearInterval(audioMixingRef.current.interval);
            audioMixingRef.current.interval = 0;
          }
          
          // Close WebSocket connection to Whisper API
          if (audioMixingRef.current.ws) {
            console.log('Closing WebSocket connection to Whisper API...');
            audioMixingRef.current.ws.close();
            audioMixingRef.current.ws = null;
          }
          
          // CRITICAL: Disconnect audio nodes and close AudioContext
          if (audioMixingRef.current.ctx) {
            console.log('Disconnecting audio nodes and closing AudioContext...');
            
            // Suspend the audio context immediately to stop all audio processing
            audioMixingRef.current.ctx.suspend().then(() => {
              console.log('AudioContext suspended successfully');
              // Close the audio context
              return audioMixingRef.current?.ctx?.close();
            }).then(() => {
              console.log('AudioContext closed successfully');
            }).catch(err => {
              console.error('Error closing AudioContext:', err);
            });
            
            audioMixingRef.current.ctx = null;
          }
          
          // Clear the reference
          audioMixingRef.current = null;
          console.log('Audio mixing and Whisper API connection stopped');
        }
        
        setTranscript(''); // Clear transcript when disabled
        setTranscriptEntries([]); // Clear transcript entries when disabled
        
        // Reset intentional closure flag after a short delay
        setTimeout(() => {
          setIsIntentionalClosure(false);
        }, 1000);
      }
      return newState;
    });
  };

     const handleLeave = () => {
    console.log('User leaving meeting - cleaning up all resources...');
    
    // Use the centralized cleanup function
    cleanupMediaResources();
    
    console.log('All resources cleaned up, navigating away...');
    navigate('/');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: 280, 
        background: 'rgba(255,255,255,0.95)', 
        borderRight: '1px solid rgba(255,255,255,0.2)', 
        padding: 24, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        minHeight: '100vh',
        backdropFilter: 'blur(10px)',
        boxShadow: '2px 0 20px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333', fontWeight: 600 }}>Participants</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
          {participants.map((p, i) => (
            <li key={i} style={{ 
              padding: '12px 16px', 
              margin: '8px 0', 
              background: 'rgba(52, 152, 219, 0.1)', 
              borderRadius: 8, 
              fontSize: 14,
              border: '1px solid rgba(52, 152, 219, 0.2)',
              color: '#2c3e50',
              fontWeight: 500
            }}>
              👤 {p}
            </li>
          ))}
        </ul>
        
        {/* Live Captions in Sidebar */}
        {captionsEnabled && (
          <div style={{ marginTop: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#388e3c' }}>
              Live Captions
              <span style={{ 
                marginLeft: 8, 
                fontSize: 12, 
                padding: '2px 6px', 
                borderRadius: 4, 
                background: whisperConnected ? '#e8f5e9' : '#ffebee', 
                color: whisperConnected ? '#388e3c' : '#c62828' 
              }}>
                {whisperConnected ? 'Connected' : 'Disconnected'}
              </span>
            </h4>
            <div style={{ 
              flex: 1, 
              background: '#f8f9fa', 
              border: '1px solid #e9ecef', 
              borderRadius: 8, 
              padding: 12, 
              fontSize: 14, 
              lineHeight: 1.4, 
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 300px)',
              color: '#333'
            }}>
              {transcriptEntries.length > 0 ? (
                <div>
                  {transcriptEntries.map((entry, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: '#2c3e50',
                        marginRight: 8
                      }}>
                        Meeting [{new Date(entry.timestamp).toLocaleTimeString()}]:
                      </span>
                      <span>{entry.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                '[Transcription will appear here]'
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Main meeting area */}
      <div style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Notifications */}
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ 
              background: n.type === 'join' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)', 
              color: '#fff', 
              padding: '12px 20px', 
              borderRadius: 12, 
              marginBottom: 8, 
              fontWeight: 600, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)', 
              minWidth: 200, 
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {n.type === 'join' ? `👋 ${n.name} joined` : `👋 ${n.name} left`}
            </div>
          ))}
        </div>
        
        {/* Main meeting UI */}
        <div style={{ 
          padding: 24, 
          maxWidth: 1200, 
          margin: '0 auto', 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {nameModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 32, boxShadow: '0 4px 24px #0003', minWidth: 320, textAlign: 'center' }}>
                <h3 style={{ marginBottom: 16 }}>Enter your name to join the meeting</h3>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  style={{ padding: 10, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', width: '80%', marginBottom: 16 }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && displayName.trim()) setNameModalOpen(false); }}
                />
                <br />
                <button
                  style={{ padding: '10px 24px', borderRadius: 6, background: '#3498db', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16, cursor: displayName.trim() ? 'pointer' : 'not-allowed', opacity: displayName.trim() ? 1 : 0.6 }}
                  disabled={!displayName.trim()}
                  onClick={() => setNameModalOpen(false)}
                >
                  Join Meeting
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ 
              background: 'rgba(244, 67, 54, 0.1)', 
              color: '#d32f2f', 
              padding: 16, 
              borderRadius: 12, 
              marginBottom: 24, 
              fontWeight: 'bold',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          {isSaving && <div style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>💾 Saving transcript...</div>}
          {saveError && <div style={{ color: '#d32f2f', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>❌ {saveError}</div>}
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              marginBottom: 8, 
              color: '#fff',
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              📹 Consultation Meeting
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              marginBottom: 0, 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500
            }}>
              <strong>Meeting ID:</strong> {meetingId}
            </p>
          </div>
          
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: 400,
              gap: 24
            }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                border: '4px solid rgba(255,255,255,0.3)', 
                borderTop: '4px solid #fff', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }} />
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.1rem',
                fontWeight: 500,
                margin: 0
              }}>
                🔄 Connecting to meeting...
              </p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', margin: '32px 0', maxWidth: '100%' }}>
               {/* Video Container with side-by-side layout */}
               <div style={{ 
                 display: 'flex', 
                 gap: 16, 
                 justifyContent: 'center', 
                 alignItems: 'center',
                 flexDirection: participants.length > 1 ? 'row' : 'column',
                 maxWidth: '100%'
               }}>
                 {/* Local Video */}
                 <div style={{ 
                   width: participants.length > 1 ? 'min(480px, 40vw)' : 'min(640px, 45vw)', 
                   aspectRatio: '16/9',
                   position: 'relative',
                   borderRadius: 12,
                   overflow: 'hidden',
                   boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                   background: '#000'
                 }}>
                   <video
                     ref={localVideoRef}
                     autoPlay
                     playsInline
                     muted
                     style={{ 
                       width: '100%', 
                       height: '100%', 
                       objectFit: 'cover',
                       borderRadius: 12
                     }}
                     onLoadedMetadata={() => console.log('Video metadata loaded')}
                     onCanPlay={() => console.log('Video can play')}
                     onError={(e) => console.error('Video error:', e)}
                     onLoadStart={() => console.log('Video load started')}
                     onLoadedData={() => console.log('Video data loaded')}
                     onPlay={() => console.log('Video started playing')}
                     onPause={() => console.log('Video paused')}
                     onWaiting={() => console.log('Video waiting')}
                     onStalled={() => console.log('Video stalled')}
                   />
                   <span style={{ 
                     position: 'absolute', 
                     left: 16, 
                     bottom: 16, 
                     color: '#fff', 
                     fontWeight: 600, 
                     background: 'rgba(0,0,0,0.7)', 
                     padding: '6px 12px', 
                     borderRadius: 6, 
                     fontSize: 14, 
                     backdropFilter: 'blur(4px)' 
                   }}>
                     {displayName}
                   </span>
                   

                 </div>
                 
                 {/* Remote Video */}
                 <div style={{ 
                   width: 'min(480px, 40vw)', 
                   aspectRatio: '16/9',
                   position: 'relative',
                   borderRadius: 12,
                   overflow: 'hidden',
                   boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                   background: '#000',
                   display: (participants.length > 1 || remoteStreamRef.current) ? 'block' : 'none'
                 }}>
                   <video
                     ref={remoteVideoRef}
                     autoPlay
                     playsInline
                     style={{ 
                       width: '100%', 
                       height: '100%', 
                       objectFit: 'cover',
                       borderRadius: 12
                     }}
                   />
                   <span style={{ 
                     position: 'absolute', 
                     left: 16, 
                     bottom: 16, 
                     color: '#fff', 
                     fontWeight: 600, 
                     background: 'rgba(0,0,0,0.7)', 
                     padding: '6px 12px', 
                     borderRadius: 6, 
                     fontSize: 14, 
                     backdropFilter: 'blur(4px)' 
                   }}>
                     {participants.find(p => p !== displayName) || 'Remote User'}
                   </span>
                   

                 </div>
               </div>
             </div>
           )}
          
          {/* Captions Section - Below Videos */}
          {captionsEnabled && (
            <div style={{ 
              width: '100%',
              maxWidth: '1200px',
              margin: '24px auto',
              background: 'rgba(0,0,0,0.9)',
              borderRadius: 12,
              padding: '20px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 16,
                gap: 8
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V6h14v12z"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">CC</text>
                </svg>
                <h3 style={{ 
                  margin: 0, 
                  color: '#fff', 
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Live Transcription
                </h3>
              </div>
              
              <div style={{ 
                minHeight: '60px',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {transcriptEntries.length === 0 ? (
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    🎤 Start speaking to see live captions...
                  </p>
                ) : (
                  <div style={{ 
                    width: '100%',
                    textAlign: 'center'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#fff', 
                      fontSize: '1.1rem',
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      {transcriptEntries[transcriptEntries.length - 1]?.text || ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
                     {/* Controls */}
           <div style={{ 
             display: 'flex', 
             gap: 12, 
             margin: '24px 0', 
             justifyContent: 'center', 
             flexWrap: 'wrap',
             padding: '16px 24px',
             background: 'rgba(0,0,0,0.8)',
             borderRadius: 50,
             backdropFilter: 'blur(10px)',
             boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
           }}>
             {/* Audio Toggle */}
             <button 
               onClick={handleToggleAudio} 
               style={{ 
                 width: 48, 
                 height: 48, 
                 borderRadius: '50%', 
                 border: 'none', 
                 background: audioEnabled ? '#424242' : '#e74c3c', 
                 color: '#fff', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 fontSize: 20
               }} 
               title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'scale(1.1)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'scale(1)';
                 e.currentTarget.style.boxShadow = 'none';
               }}
             >
               {audioEnabled ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                 </svg>
               ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                 </svg>
               )}
             </button>
             
             {/* Video Toggle */}
             <button 
               onClick={handleToggleVideo} 
               style={{ 
                 width: 48, 
                 height: 48, 
                 borderRadius: '50%', 
                 border: 'none', 
                 background: videoEnabled ? '#424242' : '#e74c3c', 
                 color: '#fff', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 fontSize: 20
               }} 
               title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'scale(1.1)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'scale(1)';
                 e.currentTarget.style.boxShadow = 'none';
               }}
             >
               {videoEnabled ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                 </svg>
               ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM12 8l-2 2-2-2-2 2v4l2-2 2 2 2-2 2 2v-4l-2-2z"/>
                 </svg>
               )}
             </button>
             
             {/* Captions Toggle */}
             <button 
               onClick={handleToggleCaptions} 
               style={{ 
                 width: 48, 
                 height: 48, 
                 borderRadius: '50%', 
                 border: 'none', 
                 background: captionsEnabled ? '#424242' : '#424242', 
                 color: '#fff', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 fontSize: 20
               }} 
               title={captionsEnabled ? 'Turn off captions' : 'Turn on captions'}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'scale(1.1)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'scale(1)';
                 e.currentTarget.style.boxShadow = 'none';
               }}
             >
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V6h14v12z"/>
                  <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">CC</text>
                </svg>
             </button>
             
             {/* Leave Meeting */}
             <button 
               onClick={handleLeave} 
               style={{ 
                 width: 56, 
                 height: 48, 
                 borderRadius: '24px', 
                 border: 'none', 
                 background: '#e74c3c', 
                 color: '#fff', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 fontSize: 20
               }} 
               title="Leave meeting"
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'scale(1.1)';
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'scale(1)';
                 e.currentTarget.style.boxShadow = 'none';
               }}
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
               </svg>
             </button>
           </div>
          
          <style>{`
            @media (max-width: 700px) {
              .video-area { flex-direction: column; gap: 16px; }
              .video-box { width: 100% !important; height: 180px !important; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default ConsultationPage; 