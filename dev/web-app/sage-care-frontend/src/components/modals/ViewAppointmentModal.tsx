import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiUser, FiMessageSquare, FiMail, FiVideo, FiCheckCircle, FiXCircle } from "react-icons/fi";

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  email: string;
}

interface Appointment {
  _id: string;
  doctor: string;
  patient: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  jitsiLink: string;
  thirdParty?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  timezone?: string;
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

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  doctor: Doctor | null;
  onJoinConsultation?: () => void;
}

const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  doctor,
  onJoinConsultation,
}) => {
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(time);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  const getStatusColor = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    
    if (appointment.status === "completed") return "green";
    if (appointment.status === "cancelled") return "red";
    if (appointment.status === "missed") return "orange";
    if (appointmentTime < now) return "gray";
    return "blue";
  };

  const getStatusText = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    
    if (appointment.status === "completed") return "Completed";
    if (appointment.status === "cancelled") return "Cancelled";
    if (appointment.status === "missed") return "Missed";
    if (appointmentTime < now) return "Past";
    return "Upcoming";
  };

  const getParticipationStatus = (appointment: Appointment) => {
    if (!appointment.participation) return null;
    
    const { patientJoined, doctorJoined, meetingDuration } = appointment.participation;
    
    if (patientJoined && doctorJoined) {
      return { status: "Both joined", color: "green", icon: FiCheckCircle };
    } else if (patientJoined) {
      return { status: "You joined", color: "blue", icon: FiUser };
    } else if (doctorJoined) {
      return { status: "Doctor joined", color: "orange", icon: FiUser };
    } else {
      return { status: "No participants", color: "gray", icon: FiXCircle };
    }
  };

  if (!appointment || !doctor) {
    return null;
  }

  const { date, time, fullDate } = formatDateTime(appointment.date, appointment.startTime);
  const participationStatus = getParticipationStatus(appointment);
  const statusColor = getStatusColor(appointment);
  const statusText = getStatusText(appointment);
  const isUpcoming = statusText === "Upcoming";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" p="0">
        <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold" fontSize="xl">
          <HStack spacing={3}>
            <Icon as={FiCalendar} />
            <Text>Consultation Details</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Doctor Info */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <HStack spacing={3} mb={2}>
                <Icon as={FiUser} color="brand.500" />
                <Text fontWeight="semibold" fontSize="lg">
                  Dr. {doctor.first_name} {doctor.last_name}
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  {doctor.specialty}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {doctor.email}
              </Text>
            </Box>

            <Divider />

            {/* Status */}
            <Box>
              <HStack justify="space-between" align="center">
                <Text fontWeight="500" color="gray.700">Status</Text>
                <Badge colorScheme={statusColor} variant="subtle">
                  {statusText}
                </Badge>
              </HStack>
              {participationStatus && (
                <HStack justify="space-between" align="center" mt={2}>
                  <Text fontWeight="500" color="gray.700">Participation</Text>
                  <Badge colorScheme={participationStatus.color as any} variant="outline">
                    <HStack spacing={1}>
                      <Icon as={participationStatus.icon} size="xs" />
                      <Text>{participationStatus.status}</Text>
                    </HStack>
                  </Badge>
                </HStack>
              )}
            </Box>

            {/* Date and Time */}
            <Box>
              <Text fontWeight="500" mb={3} color="gray.700">Date & Time</Text>
              <VStack spacing={2} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FiCalendar} color="brand.500" />
                  <Text>{fullDate}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiClock} color="brand.500" />
                  <Text>{time}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Notes */}
            {appointment.notes && (
              <Box>
                <Text fontWeight="500" mb={3} color="gray.700">
                  <HStack spacing={2}>
                    <Icon as={FiMessageSquare} />
                    <Text>Notes</Text>
                  </HStack>
                </Text>
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text color="blue.800">{appointment.notes}</Text>
                </Box>
              </Box>
            )}

            {/* Third Party */}
            {appointment.thirdParty && (
              <Box>
                <Text fontWeight="500" mb={3} color="gray.700">
                  <HStack spacing={2}>
                    <Icon as={FiMail} />
                    <Text>Third Party</Text>
                  </HStack>
                </Text>
                <Box p={3} bg="green.50" borderRadius="md">
                  <Text color="green.800">
                    {appointment.thirdParty.firstName && appointment.thirdParty.lastName 
                      ? `${appointment.thirdParty.firstName} ${appointment.thirdParty.lastName}`
                      : 'No name provided'
                    }
                  </Text>
                  <Text color="green.700" fontSize="sm">{appointment.thirdParty.email}</Text>
                </Box>
              </Box>
            )}

            {/* Meeting Details */}
            {appointment.participation?.meetingDuration && (
              <Box>
                <Text fontWeight="500" mb={3} color="gray.700">Meeting Duration</Text>
                <Text>{appointment.participation.meetingDuration} minutes</Text>
              </Box>
            )}

            {/* Meeting Outcome */}
            {appointment.meetingOutcome && appointment.meetingOutcome !== "missed" && (
              <Box>
                <Text fontWeight="500" mb={3} color="gray.700">Meeting Outcome</Text>
                <Text color="green.600">{appointment.meetingOutcome}</Text>
              </Box>
            )}

            {/* Meeting Notes */}
            {appointment.meetingNotes && (
              <Box>
                <Text fontWeight="500" mb={3} color="gray.700">Meeting Notes</Text>
                <Box p={3} bg="yellow.50" borderRadius="md">
                  <Text color="yellow.800">{appointment.meetingNotes}</Text>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          {isUpcoming && onJoinConsultation && (
            <Button 
              colorScheme="brand" 
              mr={3} 
              onClick={onJoinConsultation}
              leftIcon={<Icon as={FiVideo} />}
            >
              Join Consultation
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ViewAppointmentModal; 