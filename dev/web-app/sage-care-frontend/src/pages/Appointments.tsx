import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Flex,
  Icon,
  Divider,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiUser, FiMessageSquare, FiVideo, FiCheckCircle, FiXCircle, FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import BookDoctorModal from "../components/modals/BookDoctorModal";
import EditAppointmentModal from "../components/modals/EditAppointmentModal";
import ViewAppointmentModal from "../components/modals/ViewAppointmentModal";

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

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  email: string;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: Doctor }>({});
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [appointmentToView, setAppointmentToView] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isBookModalOpen, onOpen: onBookModalOpen, onClose: onBookModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
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
      toast({
        title: "Error",
        description: "Failed to load appointments",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const joinConsultation = async (appointmentId: string) => {
    try {
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
        await fetchAppointments();
      } else {
        console.error('Failed to track patient join');
      }

      const appointment = appointments.find(a => a._id === appointmentId);
      setSelectedAppointment(appointment || null);
      setModalOpen(true);
    } catch (error) {
      console.error('Error tracking consultation join:', error);
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

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    onEditModalOpen();
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setAppointmentToView(appointment);
    onViewModalOpen();
  };

  const handleAppointmentUpdated = () => {
    setRefreshKey(prev => prev + 1);
    setAppointmentToEdit(null);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentToDelete._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully. All participants have been notified.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setRefreshKey(prev => prev + 1);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to cancel appointment",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onDeleteAlertClose();
      setAppointmentToDelete(null);
    }
  };

  const handleAppointmentCreated = () => {
    setRefreshKey(prev => prev + 1);
    onBookModalClose();
  };

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

  // Separate appointments into different categories
  const upcomingAppointments = appointments.filter(appointment => 
    new Date(appointment.startTime) > new Date() && appointment.status !== "cancelled"
  );
  
  const completedAppointments = appointments.filter(appointment => 
    appointment.status === "completed"
  );
  
  const cancelledAppointments = appointments.filter(appointment => 
    appointment.status === "cancelled"
  );
  
  const pastAppointments = appointments.filter(appointment => 
    new Date(appointment.startTime) <= new Date() && 
    appointment.status !== "completed" && 
    appointment.status !== "cancelled"
  );

  const renderAppointmentCard = (appointment: Appointment) => {
    const doctor = doctors[appointment.doctor];
    const { date, time, fullDate } = formatDateTime(appointment.date, appointment.startTime);
    const participationStatus = getParticipationStatus(appointment);
    const statusColor = getStatusColor(appointment);
    const statusText = getStatusText(appointment);
    const isUpcoming = statusText === "Upcoming";
    
    return (
      <Box
        key={appointment._id}
        p={6}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        bg="white"
        boxShadow="sm"
        _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
        transition="all 0.2s"
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="start">
            <Box flex={1}>
              <HStack spacing={3} mb={3}>
                <Icon as={FiUser} color="brand.500" />
                <Text fontWeight="bold" fontSize="lg">
                  {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}
                </Text>
                <Badge colorScheme={statusColor} variant="subtle">
                  {statusText}
                </Badge>
                {participationStatus && (
                  <Badge colorScheme={participationStatus.color as any} variant="outline">
                    <HStack spacing={1}>
                      <Icon as={participationStatus.icon} size="xs" />
                      <Text>{participationStatus.status}</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
              
              {doctor && (
                <Text color="gray.600" fontSize="sm" mb={3}>
                  {doctor.specialty}
                </Text>
              )}
              
              <HStack spacing={4} color="gray.600" fontSize="sm">
                <HStack spacing={1}>
                  <Icon as={FiCalendar} />
                  <Text>{fullDate}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={FiClock} />
                  <Text>{time}</Text>
                </HStack>
              </HStack>
              
              {appointment.notes && (
                <Box mt={3} p={3} bg="blue.50" borderRadius="md">
                  <HStack spacing={2} mb={1}>
                    <Icon as={FiMessageSquare} color="blue.500" />
                    <Text fontWeight="semibold" fontSize="sm" color="blue.700">Notes</Text>
                  </HStack>
                  <Text fontSize="sm" color="blue.600">{appointment.notes}</Text>
                </Box>
              )}

              {appointment.participation?.meetingDuration && (
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Duration: {appointment.participation.meetingDuration} minutes
                </Text>
              )}

              {appointment.meetingOutcome && appointment.meetingOutcome !== "missed" && (
                <Text fontSize="sm" color="green.600" mt={1}>
                  Outcome: {appointment.meetingOutcome}
                </Text>
              )}
            </Box>
            
            <VStack spacing={2}>
              {isUpcoming && (
                <Button
                  colorScheme="brand"
                  size="md"
                  leftIcon={<Icon as={FiVideo} />}
                  onClick={() => joinConsultation(appointment._id)}
                >
                  Join Consultation
                </Button>
              )}
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={FiEye} />}
                  onClick={() => handleViewAppointment(appointment)}
                >
                  View
                </Button>
                {isUpcoming && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FiEdit} />}
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<Icon as={FiTrash2} />}
                      onClick={() => {
                        setAppointmentToDelete(appointment);
                        onDeleteAlertOpen();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box py={8}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.600">Loading your appointments...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="full">
      <VStack spacing={8} align="stretch">
        {/* Header with Actions */}
        <Box>
          <HStack justify="space-between" align="start">
            <Box>
              <Heading fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                My Appointments
              </Heading>
              <Text color="gray.600">
                Manage your upcoming consultations and view past appointments
              </Text>
            </Box>
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={FiPlus} />}
              onClick={onBookModalOpen}
            >
              Book Appointment
            </Button>
          </HStack>
        </Box>

        {/* Quick Stats */}
        <HStack spacing={6} justify="center">
          <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg" minW="120px">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {upcomingAppointments.length}
            </Text>
            <Text fontSize="sm" color="blue.600">Upcoming</Text>
          </Box>
          <Box textAlign="center" p={4} bg="green.50" borderRadius="lg" minW="120px">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {completedAppointments.length}
            </Text>
            <Text fontSize="sm" color="green.600">Completed</Text>
          </Box>
          <Box textAlign="center" p={4} bg="red.50" borderRadius="lg" minW="120px">
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {cancelledAppointments.length}
            </Text>
            <Text fontSize="sm" color="red.600">Cancelled</Text>
          </Box>
          <Box textAlign="center" p={4} bg="gray.50" borderRadius="lg" minW="120px">
            <Text fontSize="2xl" fontWeight="bold" color="gray.600">
              {pastAppointments.length}
            </Text>
            <Text fontSize="sm" color="gray.600">Past</Text>
          </Box>
        </HStack>

        {/* Appointment Tabs */}
        <Tabs variant="enclosed" colorScheme="brand" index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Upcoming ({upcomingAppointments.length})</Tab>
            <Tab>Completed ({completedAppointments.length})</Tab>
            <Tab>Cancelled ({cancelledAppointments.length})</Tab>
            <Tab>Past ({pastAppointments.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {upcomingAppointments.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FiCalendar} size="48px" color="gray.400" mb={4} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                    No upcoming appointments
                  </Text>
                  <Text color="gray.500" mb={6}>
                    You don't have any scheduled consultations.
                  </Text>
                  <Button colorScheme="brand" onClick={onBookModalOpen}>
                    Book an Appointment
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {upcomingAppointments.map((appointment) => 
                    renderAppointmentCard(appointment)
                  )}
                </VStack>
              )}
            </TabPanel>

            <TabPanel>
              {completedAppointments.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FiCheckCircle} size="48px" color="gray.400" mb={4} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                    No completed appointments
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {completedAppointments.map((appointment) => 
                    renderAppointmentCard(appointment)
                  )}
                </VStack>
              )}
            </TabPanel>

            <TabPanel>
              {cancelledAppointments.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FiXCircle} size="48px" color="gray.400" mb={4} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                    No cancelled appointments
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {cancelledAppointments.map((appointment) => 
                    renderAppointmentCard(appointment)
                  )}
                </VStack>
              )}
            </TabPanel>

            <TabPanel>
              {pastAppointments.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FiClock} size="48px" color="gray.400" mb={4} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                    No past appointments
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {pastAppointments.map((appointment) => 
                    renderAppointmentCard(appointment)
                  )}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Consultation Details Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p="0">
          <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold" fontSize="xl">
            <HStack spacing={3}>
              <Icon as={FiVideo} />
              <Text>Consultation Details</Text>
            </HStack>
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
                <Divider />
                <HStack spacing={4}>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="brand.500" />
                    <Text fontSize="sm" color="gray.600">
                      {new Date(selectedAppointment.date).toLocaleDateString()}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="brand.500" />
                    <Text fontSize="sm" color="gray.600">
                      {new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </HStack>
                </HStack>
                {selectedAppointment.notes && (
                  <Box bg="yellow.50" p={4} borderRadius="md">
                    <HStack spacing={2} mb={2}>
                      <Icon as={FiMessageSquare} color="yellow.600" />
                      <Text fontWeight="semibold" color="yellow.800">Notes</Text>
                    </HStack>
                    <Text color="yellow.800">{selectedAppointment.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleStartConsultation} leftIcon={<Icon as={FiVideo} />}>
              Start Video Consultation
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Book Appointment Modal */}
      <BookDoctorModal 
        isOpen={isBookModalOpen} 
        onClose={onBookModalClose} 
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        appointment={appointmentToEdit}
        doctor={appointmentToEdit ? doctors[appointmentToEdit.doctor] : null}
        onAppointmentUpdated={handleAppointmentUpdated}
      />

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isViewModalOpen}
        onClose={onViewModalClose}
        appointment={appointmentToView}
        doctor={appointmentToView ? doctors[appointmentToView.doctor] : null}
        onJoinConsultation={() => {
          if (appointmentToView) {
            joinConsultation(appointmentToView._id);
            onViewModalClose();
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Appointment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to cancel this appointment? This action cannot be undone and all participants will be notified.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                No, Keep It
              </Button>
              <Button colorScheme="red" onClick={handleCancelAppointment} ml={3}>
                Yes, Cancel It
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Appointments; 