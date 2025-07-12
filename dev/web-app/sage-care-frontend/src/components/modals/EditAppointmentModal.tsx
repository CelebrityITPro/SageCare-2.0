import React, { useState, useEffect } from "react";
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
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Divider,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiUser, FiMessageSquare, FiMail } from "react-icons/fi";

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

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  doctor: Doctor | null;
  onAppointmentUpdated: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  doctor,
  onAppointmentUpdated,
}) => {
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [thirdPartyEmail, setThirdPartyEmail] = useState<string>("");
  const [thirdPartyFirstName, setThirdPartyFirstName] = useState<string>("");
  const [thirdPartyLastName, setThirdPartyLastName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState<string>("");
  const toast = useToast();

  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.startTime);
      setDate(appointmentDate.toISOString().split('T')[0]);
      setStartTime(appointmentDate.toTimeString().slice(0, 5));
      
      const endDate = new Date(appointment.endTime);
      setEndTime(endDate.toTimeString().slice(0, 5));
      
      setNotes(appointment.notes || "");
      setThirdPartyEmail(appointment.thirdParty?.email || "");
      setThirdPartyFirstName(appointment.thirdParty?.firstName || "");
      setThirdPartyLastName(appointment.thirdParty?.lastName || "");
    }
  }, [appointment]);

  // Validation functions
  const validateTimeSlot = (start: string, end: string, selectedDate: string): string => {
    if (!start || !end) return "";

    const startDate = new Date(`${selectedDate}T${start}`);
    const endDate = new Date(`${selectedDate}T${end}`);
    const now = new Date();

    // Check if end time is less than start time
    if (endDate <= startDate) {
      return "End time must be after start time";
    }

    // Check if date is today and start time is in the past
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today && startDate <= now) {
      return "Start time cannot be in the past";
    }

    // Check if the time slot is exactly 30 minutes
    const timeDiff = endDate.getTime() - startDate.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff !== 30) {
      return "Appointment duration must be exactly 30 minutes";
    }

    return "";
  };

  // Update validation when time inputs change
  useEffect(() => {
    if (date && startTime && endTime) {
      const error = validateTimeSlot(startTime, endTime, date);
      setTimeError(error);
    } else {
      setTimeError("");
    }
  }, [date, startTime, endTime]);

  const handleSubmit = async () => {
    if (!appointment || !date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (timeError) {
      toast({
        title: "Invalid Time Selection",
        description: timeError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Convert local date and time to UTC ISO strings
      const dateUtc = new Date(`${date}T00:00:00Z`).toISOString();
      const startTimeUtc = new Date(`${date}T${startTime}`).toISOString();
      const endTimeUtc = new Date(`${date}T${endTime}`).toISOString();

      const updateData = {
        date: dateUtc,
        startTime: startTimeUtc,
        endTime: endTimeUtc,
        notes: notes,
        thirdParty: thirdPartyEmail || undefined,
        thirdPartyFirstName: thirdPartyFirstName || undefined,
        thirdPartyLastName: thirdPartyLastName || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch(`http://localhost:5000/api/appointments/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Appointment updated successfully! All participants have been notified.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onAppointmentUpdated();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update appointment",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!appointment || !doctor) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" p="0">
        <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold" fontSize="xl">
          Edit Appointment
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Doctor Info (Read-only) */}
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
                Doctor cannot be changed. To change doctor, please cancel this appointment and book a new one.
              </Text>
            </Box>

            <Divider />

            {/* Date and Time */}
            <Box>
              <Text fontWeight="500" mb={3} color="gray.700">Date</Text>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </Box>

            <HStack spacing={4}>
              <Box flex={1}>
                <Text fontWeight="500" mb={3} color="gray.700">Start Time</Text>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </Box>
              <Box flex={1}>
                <Text fontWeight="500" mb={3} color="gray.700">End Time</Text>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </Box>
            </HStack>

            {timeError && (
              <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
                <Text color="red.600" fontSize="14px" fontWeight={500}>
                  {timeError}
                </Text>
              </Box>
            )}

            {/* Notes */}
            <Box>
              <Text fontWeight="500" mb={3} color="gray.700">Notes (Optional)</Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for the doctor..."
                rows={3}
              />
            </Box>

            {/* Third Party Email */}
            <Box>
              <Text fontWeight="500" mb={3} color="gray.700">
                <HStack spacing={2}>
                  <Icon as={FiMail} />
                  <Text>Third Party Email (Optional)</Text>
                </HStack>
              </Text>
              <Input
                type="email"
                value={thirdPartyEmail}
                onChange={(e) => setThirdPartyEmail(e.target.value)}
                placeholder="Enter email to invite a third party (family member, caregiver, etc.)"
              />
            </Box>
            {thirdPartyEmail && (
              <HStack spacing={4}>
                <Box flex={1}>
                  <Text fontWeight="500" mb={3} color="gray.700">First Name (Optional)</Text>
                  <Input
                    type="text"
                    value={thirdPartyFirstName}
                    onChange={(e) => setThirdPartyFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontWeight="500" mb={3} color="gray.700">Last Name (Optional)</Text>
                  <Input
                    type="text"
                    value={thirdPartyLastName}
                    onChange={(e) => setThirdPartyLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </Box>
              </HStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Updating..."
            isDisabled={!!timeError}
          >
            Update Appointment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditAppointmentModal; 