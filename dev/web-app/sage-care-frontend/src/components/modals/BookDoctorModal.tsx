import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Colors } from "../Colors";

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  email: string;
}

interface BookDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated?: () => void;
}

const BookDoctorModal: React.FC<BookDoctorModalProps> = ({ 
  isOpen, 
  onClose, 
  onAppointmentCreated 
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [thirdPartyEmail, setThirdPartyEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedDoctor) {
      setStep(2);
    } else if (step === 2 && date && startTime && endTime) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;

      console.log("User data from localStorage:", user);
      console.log("User ID:", userId);

      if (!userId) {
        console.error("No user ID found in localStorage");
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Convert local date and time to UTC ISO strings
      const dateUtc = new Date(`${date}T00:00:00Z`).toISOString();
      const startTimeUtc = new Date(`${date}T${startTime}`).toISOString();
      const endTimeUtc = new Date(`${date}T${endTime}`).toISOString();

      const appointmentData = {
        doctor: selectedDoctor,
        patient: userId,
        date: dateUtc,
        startTime: startTimeUtc,
        endTime: endTimeUtc,
        notes: notes,
        thirdParty: thirdPartyEmail || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Appointment created successfully! Check your email for details.",
          status: "success",
          duration: 5000,
        });
        onAppointmentCreated?.();
        onClose();
        // Reset form
        setSelectedDoctor("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setNotes("");
        setThirdPartyEmail("");
        setStep(1);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create appointment",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { step: "Find a doctor", completed: step >= 1 },
    { step: "Select date & time", completed: step >= 2 },
    { step: "Confirm appointment", completed: step >= 3 },
  ];

  const selectedDoctorData = doctors.find(d => d._id === selectedDoctor);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius={"20px"} p="0">
        <ModalBody display={"flex"} borderRadius={"20px"} p="0">
          <Box w={"280px"} h="572px" borderRight={`1px solid #F0F0F0`} p="16px">
            <Box>
              <Image
                src={"/sagecare-logo-dark.svg"}
                alt="logo"
                w={"111px"}
                h={"24px"}
              />
            </Box>
            <Stack spacing={"8px"} mt={4}>
              {steps.map((item, index) => (
                <Text
                  key={index}
                  fontWeight={500}
                  fontSize={"14px"}
                  lineHeight={"20px"}
                  p="10px"
                  color={item.completed ? Colors.primaryBlue : Colors.textGray}
                >
                  {item?.step}
                </Text>
              ))}
            </Stack>
          </Box>
          <Box w="full">
            <Box
              borderBottom={`1px solid #F0F0F0`}
              w="full"
              px="24px"
              py="18px"
            >
              <Text fontSize={"16px"} fontWeight={600} lineHeight={"20px"}>
                {step === 1 && "Find a Doctor"}
                {step === 2 && "Select Date & Time"}
                {step === 3 && "Confirm Appointment"}
              </Text>
            </Box>
            <Box py="16px" px="24px">
              {step === 1 && (
                <Stack spacing={"8px"}>
                  {doctors.map((doctor) => (
                    <Flex
                      key={doctor._id}
                      p="16px"
                      gap={"16px"}
                      alignItems={"center"}
                      borderRadius={"12px"}
                      borderBottom={`1px solid #F0F0F0`}
                      _hover={{ bg: Colors.cardGray, cursor: "pointer" }}
                      bg={selectedDoctor === doctor._id ? Colors.cardGray : "white"}
                      onClick={() => setSelectedDoctor(doctor._id)}
                    >
                      <Avatar />
                      <Box flex={1}>
                        <Text fontWeight={600} fontSize={"14px"}>
                          Dr. {doctor.first_name} {doctor.last_name}
                        </Text>
                        <Text
                          fontSize={"14px"}
                          fontWeight={400}
                          color={Colors.textGray}
                        >
                          {doctor.specialty}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Stack>
              )}

              {step === 2 && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight={500} mb={2}>Date</Text>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Box>
                  <HStack spacing={4}>
                    <Box flex={1}>
                      <Text fontWeight={500} mb={2}>Start Time</Text>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text fontWeight={500} mb={2}>End Time</Text>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </Box>
                  </HStack>
                  <Box>
                    <Text fontWeight={500} mb={2}>Notes (Optional)</Text>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes for the doctor..."
                      rows={3}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight={500} mb={2}>Third Party Email (Optional)</Text>
                    <Input
                      type="email"
                      value={thirdPartyEmail}
                      onChange={(e) => setThirdPartyEmail(e.target.value)}
                      placeholder="Enter email to invite a third party (family member, caregiver, etc.)"
                    />
                  </Box>
                </VStack>
              )}

              {step === 3 && (
                <VStack spacing={4} align="stretch">
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                    <Text fontWeight={600} mb={2}>Appointment Details</Text>
                    <Text><strong>Doctor:</strong> Dr. {selectedDoctorData?.first_name} {selectedDoctorData?.last_name}</Text>
                    <Text><strong>Specialty:</strong> {selectedDoctorData?.specialty}</Text>
                    <Text><strong>Date:</strong> {new Date(date).toLocaleDateString()}</Text>
                    <Text><strong>Time:</strong> {startTime} - {endTime}</Text>
                    {notes && <Text><strong>Notes:</strong> {notes}</Text>}
                    {thirdPartyEmail && <Text><strong>Third Party:</strong> {thirdPartyEmail}</Text>}
                  </Box>
                </VStack>
              )}

              <HStack spacing={4} mt={6} justify="flex-end">
                {step > 1 && (
                  <Button onClick={handleBack} variant="outline">
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    onClick={handleNext}
                    colorScheme="blue"
                    isDisabled={
                      (step === 1 && !selectedDoctor) ||
                      (step === 2 && (!date || !startTime || !endTime))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Creating..."
                  >
                    Confirm Appointment
                  </Button>
                )}
              </HStack>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookDoctorModal;
