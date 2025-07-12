import React, { useState, useEffect } from "react";
import CardTemplate from "./CardTemplate";
import { 
  Box, 
  Image, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Badge, 
  Spinner, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface Appointment {
  _id: string;
  doctor: string;
  patient: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  jitsiLink: string;
  participation?: {
    patientJoined: boolean;
    doctorJoined: boolean;
    patientJoinTime?: string;
    doctorJoinTime?: string;
    meetingDuration?: number;
    lastActivity?: string;
  };
  meetingOutcome?: string;
  meetingNotes?: string;
  status?: string;
}

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
}

interface AppointmentsProps {
  refreshKey?: number;
}

const Appointments: React.FC<AppointmentsProps> = ({ refreshKey = 0 }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: Doctor }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get current user ID from localStorage (assuming it's stored there after login)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // Fetch appointments for the current user
      const response = await fetch(`http://localhost:5000/api/appointments?patient=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        
        // Fetch doctor details for each appointment
        const doctorIds = Array.from(new Set(data.appointments?.map((apt: Appointment) => apt.doctor) || []) as Set<string>);
        const doctorPromises = doctorIds.map(id => 
          fetch(`http://localhost:5000/api/doctors/${id}`).then(res => res.json())
        );
        
        const doctorResults = await Promise.all(doctorPromises);
        const doctorMap: { [key: string]: Doctor } = {};
        doctorResults.forEach(doctor => {
          if (doctor._id) {
            doctorMap[doctor._id] = doctor;
          }
        });
        setDoctors(doctorMap);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinConsultation = async (appointmentId: string) => {
    try {
      // Get current user ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Track that the patient joined the meeting
      const joinResponse = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantType: 'patient',
          userId: userId
        }),
      });

      if (joinResponse.ok) {
        console.log('Patient join tracked successfully');
        // Refresh appointments to get updated participation data
        await fetchAppointments();
      } else {
        console.error('Failed to track patient join');
      }

      // Open the consultation modal
      const appointment = appointments.find(a => a._id === appointmentId);
      setSelectedAppointment(appointment || null);
      setModalOpen(true);
    } catch (error) {
      console.error('Error tracking consultation join:', error);
      // Still open the modal even if tracking fails
      const appointment = appointments.find(a => a._id === appointmentId);
      setSelectedAppointment(appointment || null);
      setModalOpen(true);
    }
  };

  const handleStartConsultation = () => {
    if (selectedAppointment) {
      window.open(selectedAppointment.jitsiLink, '_blank', 'noopener,noreferrer');
      setModalOpen(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(time);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getParticipationStatus = (appointment: Appointment) => {
    if (!appointment.participation) return null;
    
    const { patientJoined, doctorJoined, meetingDuration } = appointment.participation;
    
    if (patientJoined && doctorJoined) {
      return { status: "Both joined", color: "green" };
    } else if (patientJoined) {
      return { status: "You joined", color: "blue" };
    } else if (doctorJoined) {
      return { status: "Doctor joined", color: "orange" };
    } else {
      return { status: "No participants", color: "gray" };
    }
  };

  // Separate appointments into upcoming only (exclude cancelled)
  const upcomingAppointments = appointments.filter(appointment => 
    new Date(appointment.startTime) > new Date() && appointment.status !== "cancelled"
  );

  const renderAppointmentCard = (appointment: Appointment, isUpcoming: boolean = true) => {
    const doctor = doctors[appointment.doctor];
    const { date, time } = formatDateTime(appointment.date, appointment.startTime);
    const participationStatus = getParticipationStatus(appointment);
    
    return (
      <Box
        key={appointment._id}
        p={4}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        bg="white"
      >
        <HStack justify="space-between" align="start">
          <Box flex={1}>
            <HStack spacing={2} mb={2}>
              <Text fontWeight="semibold" fontSize="lg">
                {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}
              </Text>
              <Badge colorScheme={isUpcoming ? "green" : "gray"}>
                {isUpcoming ? "Upcoming" : "Completed"}
              </Badge>
              {participationStatus && (
                <Badge colorScheme={participationStatus.color as any}>
                  {participationStatus.status}
                </Badge>
              )}
            </HStack>
            
            {doctor && (
              <Text color="gray.600" fontSize="sm" mb={2}>
                {doctor.specialty}
              </Text>
            )}
            
            <Text fontSize="sm" color="gray.600">
              {date} at {time}
            </Text>
            
            {appointment.notes && (
              <Text fontSize="sm" color="gray.600" mt={2}>
                Notes: {appointment.notes}
              </Text>
            )}

            {appointment.participation?.meetingDuration && (
              <Text fontSize="sm" color="gray.600" mt={1}>
                Duration: {appointment.participation.meetingDuration} minutes
              </Text>
            )}

            {appointment.meetingOutcome && appointment.meetingOutcome !== "missed" && (
              <Text fontSize="sm" color="green.600" mt={1}>
                Outcome: {appointment.meetingOutcome}
              </Text>
            )}
          </Box>
          
          {isUpcoming && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => joinConsultation(appointment._id)}
            >
              Join Consultation
            </Button>
          )}
        </HStack>
      </Box>
    );
  };

  if (loading) {
    return (
      <CardTemplate cardTitle="Appointments">
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} color="gray.600">Loading appointments...</Text>
        </Box>
      </CardTemplate>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <CardTemplate cardTitle="Appointments">
        <Image
          src={"/no-appointment-icon.svg"}
          alt="no-appointment-icon"
          w="91px"
          h="88px"
        />
        <Box mt="16px" textAlign={"center"}>
          <Text
            fontSize={"16px"}
            fontWeight={600}
            lineHeight={"24px"}
            letterSpacing={"-2%"}
          >
            No appointments
          </Text>
          <Text
            fontSize={"14px"}
            fontWeight={400}
            lineHeight={"20px"}
            letterSpacing={"-2%"}
            color="gray.600"
            mt="4px"
          >
            You haven't booked any consultations yet.
            <br /> Let's find the right doctor for you.
          </Text>
        </Box>
      </CardTemplate>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Upcoming Appointments Section */}
        <CardTemplate cardTitle="Upcoming appointments">
          {upcomingAppointments.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text fontSize="16px" fontWeight={600} color="gray.600">
                No upcoming appointments
              </Text>
              <Text fontSize="14px" color="gray.600" mt={2}>
                You don't have any scheduled consultations.
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {upcomingAppointments.map((appointment) => 
                renderAppointmentCard(appointment, true)
              )}
            </VStack>
          )}
        </CardTemplate>


      </VStack>

      {/* Consultation Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px" p="0">
          <ModalHeader borderTopRadius="20px" bg={"blue.50"} color={"blue.900"} fontWeight="bold" fontSize="xl">
            Consultation Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedAppointment && (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="lg">
                    {doctors[selectedAppointment.doctor] ? `Dr. ${doctors[selectedAppointment.doctor].first_name} ${doctors[selectedAppointment.doctor].last_name}` : 'Loading...'}
                  </Text>
                  <Badge colorScheme="green">Upcoming</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  {doctors[selectedAppointment.doctor]?.specialty}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {new Date(selectedAppointment.date).toLocaleDateString()} at {new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {selectedAppointment.notes && (
                  <Box bg="yellow.50" p={3} borderRadius="md">
                    <Text fontWeight="semibold" color={"yellow.900"} mb={1}>Notes</Text>
                    <Text color={"yellow.800"}>{selectedAppointment.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleStartConsultation}>
              Start Video Consultation
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Appointments;
