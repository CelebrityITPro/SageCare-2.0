import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface Appointment {
  _id: string;
  doctor: string;
  patient: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  jitsiLink: string;
}

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
}

interface Patient {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const VideoConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch appointment details
      const appointmentResponse = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`);
      if (!appointmentResponse.ok) {
        throw new Error('Appointment not found');
      }
      
      const appointmentData = await appointmentResponse.json();
      setAppointment(appointmentData.appointment);

      // Fetch doctor details
      const doctorResponse = await fetch(`http://localhost:5000/api/doctors/${appointmentData.appointment.doctor}`);
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        setDoctor(doctorData);
      }

      // Fetch patient details using public endpoint
      const patientResponse = await fetch(`http://localhost:5000/api/users/public/${appointmentData.appointment.patient}`);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatient(patientData.user);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleApiReady = () => {
    console.log('Jitsi API is ready');
  };

  const handleReadyToClose = () => {
    console.log('Meeting is ready to close');
    navigate('/');
  };

  const handleParticipantJoined = (participant: any) => {
    console.log('Participant joined:', participant);
  };

  const handleParticipantLeft = (participant: any) => {
    console.log('Participant left:', participant);
  };

  const extractRoomName = (jitsiLink: string) => {
    const url = new URL(jitsiLink);
    return url.pathname.substring(1); // Remove leading slash
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Consultation Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested consultation could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const roomName = extractRoomName(appointment.jitsiLink);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Video Consultation</h1>
                <p className="text-sm text-gray-500">
                  {doctor && `Dr. ${doctor.first_name} ${doctor.last_name}`} • {patient && `${patient.first_name} ${patient.last_name}`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Details Panel */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Doctor</h3>
              <p className="text-blue-800">
                {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}
              </p>
              {doctor && <p className="text-sm text-blue-600">{doctor.specialty}</p>}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Patient</h3>
              <p className="text-green-800">
                {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
              </p>
              {patient && <p className="text-sm text-green-600">{patient.email}</p>}
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Appointment</h3>
              <p className="text-purple-800">
                {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-purple-600">
                {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Notes</h3>
              <p className="text-yellow-800">{appointment.notes}</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                window.open(appointment.jitsiLink, '_blank', 'noopener,noreferrer');
                setTimeout(() => navigate('/'), 300); // short delay to ensure tab opens
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg text-lg tracking-wide"
              style={{ minWidth: 260 }}
            >
              <span className="inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"></path></svg>
                Start Video Consultation
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation; 