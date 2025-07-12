import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Spinner, 
  VStack, 
  HStack, 
  Grid, 
  GridItem,
  Icon,
  useToast
} from '@chakra-ui/react';

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
  const toast = useToast();
  
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
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.600">Loading consultation...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !appointment) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} textAlign="center">
          <Text fontSize="6xl">⚠️</Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Consultation Not Found
          </Text>
          <Text color="gray.600" maxW="400px">
            {error || 'The requested consultation could not be found.'}
          </Text>
          <Button
            onClick={() => navigate('/')}
            colorScheme="brand"
            size="lg"
          >
            Return to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  const roomName = extractRoomName(appointment.jitsiLink);

  return (
    <Box minH="100vh" bg="gray.900">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px solid" borderColor="gray.200">
        <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex justify="space-between" align="center" py={4}>
            <Flex align="center" gap={4}>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                color="gray.600"
                _hover={{ color: "gray.800" }}
                leftIcon={<Text>←</Text>}
              >
                Back to Dashboard
              </Button>
              <Box h="6" w="1px" bg="gray.300" mx={4} />
              <Box>
                <Text fontSize="xl" fontWeight="semibold" color="gray.900">
                  Video Consultation
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {doctor && `Dr. ${doctor.first_name} ${doctor.last_name}`} • {patient && `${patient.first_name} ${patient.last_name}`}
                </Text>
              </Box>
            </Flex>
            
            <Box textAlign="right">
              <Text fontSize="sm" color="gray.500">
                {new Date(appointment.date).toLocaleDateString()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Consultation Details Panel */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={6}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            <GridItem>
              <Box bg="blue.50" p={4} borderRadius="lg">
                <Text fontWeight="semibold" color="blue.900" mb={2}>Doctor</Text>
                <Text color="blue.800">
                  {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}
                </Text>
                {doctor && <Text fontSize="sm" color="blue.600">{doctor.specialty}</Text>}
              </Box>
            </GridItem>
            
            <GridItem>
              <Box bg="green.50" p={4} borderRadius="lg">
                <Text fontWeight="semibold" color="green.900" mb={2}>Patient</Text>
                <Text color="green.800">
                  {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
                </Text>
                {patient && <Text fontSize="sm" color="green.600">{patient.email}</Text>}
              </Box>
            </GridItem>
            
            <GridItem>
              <Box bg="purple.50" p={4} borderRadius="lg">
                <Text fontWeight="semibold" color="purple.900" mb={2}>Appointment</Text>
                <Text color="purple.800">
                  {new Date(appointment.date).toLocaleDateString()}
                </Text>
                <Text fontSize="sm" color="purple.600">
                  {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
                </Text>
              </Box>
            </GridItem>
          </Grid>
          
          {appointment.notes && (
            <Box mt={4} p={4} bg="yellow.50" borderRadius="lg">
              <Text fontWeight="semibold" color="yellow.900" mb={2}>Notes</Text>
              <Text color="yellow.800">{appointment.notes}</Text>
            </Box>
          )}
          
          <Box mt={6} textAlign="center">
            <Button
              onClick={() => {
                window.open(appointment.jitsiLink, '_blank', 'noopener,noreferrer');
                setTimeout(() => navigate('/'), 300); // short delay to ensure tab opens
              }}
              colorScheme="green"
              size="lg"
              px={8}
              py={3}
              fontSize="lg"
              fontWeight="semibold"
              shadow="lg"
              minW="260px"
              leftIcon={<Box as="svg" w={5} h={5} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"></path></Box>}
            >
              Start Video Consultation
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoConsultation; 