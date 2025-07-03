import React, { useState, useEffect } from "react";
import CardTemplate from "./CardTemplate";
import { Box, Image, Text, Button, VStack, HStack, Badge, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from "@chakra-ui/react";
import { Colors } from "../Colors";
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
      
      console.log("Appointments - User data from localStorage:", user);
      console.log("Appointments - User ID:", userId);
      
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

  const joinConsultation = (appointmentId: string) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    setSelectedAppointment(appointment || null);
    setModalOpen(true);
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

  if (loading) {
    return (
      <CardTemplate cardTitle="Upcoming appointments">
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color={Colors.primaryBlue} />
          <Text mt={4} color={Colors.textGray}>Loading appointments...</Text>
        </Box>
      </CardTemplate>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <CardTemplate cardTitle="Upcoming appointments">
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
            No Upcoming appointments
          </Text>
          <Text
            fontSize={"14px"}
            fontWeight={400}
            lineHeight={"20px"}
            letterSpacing={"-2%"}
            color={Colors.textGray}
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
      <CardTemplate cardTitle="Upcoming appointments">
        <VStack spacing={4} align="stretch">
          {appointments.map((appointment) => {
            const doctor = doctors[appointment.doctor];
            const { date, time } = formatDateTime(appointment.date, appointment.startTime);
            const isUpcoming = new Date(appointment.startTime) > new Date();
            
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
                        {isUpcoming ? "Upcoming" : "Past"}
                      </Badge>
                    </HStack>
                    
                    {doctor && (
                      <Text color={Colors.textGray} fontSize="sm" mb={2}>
                        {doctor.specialty}
                      </Text>
                    )}
                    
                    <Text fontSize="sm" color={Colors.textGray}>
                      {date} at {time}
                    </Text>
                    
                    {appointment.notes && (
                      <Text fontSize="sm" color={Colors.textGray} mt={2}>
                        Notes: {appointment.notes}
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
          })}
        </VStack>
      </CardTemplate>
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
                <Text color={Colors.textGray} fontSize="sm">
                  {doctors[selectedAppointment.doctor]?.specialty}
                </Text>
                <Text fontSize="md" color={Colors.textGray}>
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
