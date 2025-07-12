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
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiSearch, FiEye } from "react-icons/fi";
import ViewDoctorModal from "./ViewDoctorModal";

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
  const [thirdPartyFirstName, setThirdPartyFirstName] = useState<string>("");
  const [thirdPartyLastName, setThirdPartyLastName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [timeError, setTimeError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewDoctorModal, setViewDoctorModal] = useState<{ isOpen: boolean; doctor: Doctor | null }>({
    isOpen: false,
    doctor: null
  });
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

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
    } else if (step === 2 && date && startTime && endTime && !timeError) {
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

    if (timeError) {
      toast({
        title: "Invalid Time Selection",
        description: timeError,
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;

      if (!userId) {
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
        thirdPartyFirstName: thirdPartyFirstName || undefined,
        thirdPartyLastName: thirdPartyLastName || undefined,
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
        setThirdPartyFirstName("");
        setThirdPartyLastName("");
        setStep(1);
        setTimeError("");
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

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    const specialty = doctor.specialty.toLowerCase();
    
    return fullName.includes(searchLower) || specialty.includes(searchLower);
  });

  const handleViewDoctor = (doctor: Doctor) => {
    setViewDoctorModal({ isOpen: true, doctor });
  };

  const closeViewDoctorModal = () => {
    setViewDoctorModal({ isOpen: false, doctor: null });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius={"20px"} p="0" bg="white">
        <ModalBody display={"flex"} borderRadius={"20px"} p="0">
          <Box w={"280px"} h="572px" borderRight="1px solid" borderColor="gray.200" p="20px" bg="gray.50">
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
                  color={item.completed ? "brand.500" : "gray.500"}
                  bg={item.completed ? "brand.50" : "transparent"}
                  borderRadius="8px"
                >
                  {item?.step}
                </Text>
              ))}
            </Stack>
          </Box>
          <Box w="full">
            <Box
              borderBottom="1px solid"
              borderColor="gray.200"
              w="full"
              px="24px"
              py="18px"
              bg="gray.50"
            >
              <Text fontSize={"18px"} fontWeight={600} lineHeight={"24px"} color="gray.800" fontFamily="heading">
                {step === 1 && "Find a Doctor"}
                {step === 2 && "Select Date & Time"}
                {step === 3 && "Confirm Appointment"}
              </Text>
            </Box>
            <Box py="24px" px="24px">
              {step === 1 && (
                <Stack spacing={"12px"}>
                  {/* Search Input */}
                  <Box>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search doctors by name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        borderColor="gray.200"
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                      />
                    </InputGroup>
                  </Box>

                  {/* Doctor List */}
                  {filteredDoctors.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="sm">
                        {searchQuery ? "No doctors found matching your search." : "No doctors available."}
                      </Text>
                    </Box>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <Flex
                        key={doctor._id}
                        p="16px"
                        gap={"16px"}
                        alignItems={"center"}
                        borderRadius={"12px"}
                        border="1px solid"
                        _hover={{ bg: "gray.50", cursor: "pointer", borderColor: "brand.200" }}
                        bg={selectedDoctor === doctor._id ? "brand.50" : "white"}
                        borderColor={selectedDoctor === doctor._id ? "brand.200" : "gray.200"}
                        transition="all 0.2s"
                      >
                        <Avatar size="md" name={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
                        <Box flex={1} onClick={() => setSelectedDoctor(doctor._id)}>
                          <Text fontWeight={600} fontSize={"16px"} color="gray.800">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </Text>
                          <Text
                            fontSize={"14px"}
                            fontWeight={400}
                            color={"gray.600"}
                            mt="4px"
                          >
                            {doctor.specialty}
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Icon as={FiEye} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDoctor(doctor);
                          }}
                        >
                          View
                        </Button>
                      </Flex>
                    ))
                  )}
                </Stack>
              )}

              {step === 2 && (
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight={500} mb={3} color="gray.700">Date</Text>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Box>
                  <HStack spacing={4}>
                    <Box flex={1}>
                      <Text fontWeight={500} mb={3} color="gray.700">Start Time</Text>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text fontWeight={500} mb={3} color="gray.700">End Time</Text>
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
                  <Box>
                    <Text fontWeight={500} mb={3} color="gray.700">Notes (Optional)</Text>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes for the doctor..."
                      rows={3}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight={500} mb={3} color="gray.700">Third Party Email (Optional)</Text>
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
                        <Text fontWeight={500} mb={3} color="gray.700">First Name (Optional)</Text>
                        <Input
                          type="text"
                          value={thirdPartyFirstName}
                          onChange={(e) => setThirdPartyFirstName(e.target.value)}
                          placeholder="First name"
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight={500} mb={3} color="gray.700">Last Name (Optional)</Text>
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
              )}

              {step === 3 && (
                <VStack spacing={6} align="stretch">
                  <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="lg" bg="gray.50">
                    <Text fontWeight={600} mb={4} fontSize="16px" color="gray.800">Appointment Details</Text>
                    <VStack spacing={3} align="stretch">
                      <Text><strong>Doctor:</strong> Dr. {selectedDoctorData?.first_name} {selectedDoctorData?.last_name}</Text>
                      <Text><strong>Specialty:</strong> {selectedDoctorData?.specialty}</Text>
                      <Text><strong>Date:</strong> {new Date(date).toLocaleDateString()}</Text>
                      <Text><strong>Time:</strong> {startTime} - {endTime}</Text>
                      {notes && <Text><strong>Notes:</strong> {notes}</Text>}
                      {thirdPartyEmail && (
                        <Text>
                          <strong>Third Party:</strong> {thirdPartyEmail}
                          {thirdPartyFirstName && ` (${thirdPartyFirstName} ${thirdPartyLastName || ''})`}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              )}

              <HStack spacing={4} mt={8} justify="flex-end">
                {step > 1 && (
                  <Button onClick={handleBack} variant="outline" colorScheme="gray">
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    onClick={handleNext}
                    colorScheme="brand"
                    isDisabled={
                      (step === 1 && !selectedDoctor) ||
                      (step === 2 && (!date || !startTime || !endTime || Boolean(timeError)))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    colorScheme="brand"
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

      {/* View Doctor Modal */}
      <ViewDoctorModal
        isOpen={viewDoctorModal.isOpen}
        onClose={closeViewDoctorModal}
        doctor={viewDoctorModal.doctor}
      />
    </Modal>
  );
};

export default BookDoctorModal;
