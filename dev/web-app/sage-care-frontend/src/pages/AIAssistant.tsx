import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Flex,
  Icon,
  Divider,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import {
  FiCpu,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiHeart,
  FiActivity,
  FiStar,
  FiMessageSquare,
  FiCalendar,
  FiArrowRight,
} from "react-icons/fi";
import { useAnalyzeSymptoms, useGetAvailableSpecialties, useCreateDiagnosis, useGetDoctorsBySpecialty } from "../api/ai-diagnosis";
import { useGetUserDetails } from "../api/user";
import BookDoctorModal from "../components/modals/BookDoctorModal";

interface SymptomFormData {
  symptoms: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  onset: string;
  triggers: string[];
  associatedSymptoms: string[];
}

const AIAssistant = () => {
  const [formData, setFormData] = useState<SymptomFormData>({
    symptoms: "",
    severity: "moderate",
    duration: "",
    onset: "",
    triggers: [],
    associatedSymptoms: [],
  });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  const toast = useToast();
  const { isOpen: isBookModalOpen, onOpen: onBookModalOpen, onClose: onBookModalClose } = useDisclosure();

  const { data: userData } = useGetUserDetails();
  const analyzeSymptoms = useAnalyzeSymptoms();
  const createDiagnosis = useCreateDiagnosis();
  const { data: specialties } = useGetAvailableSpecialties();
  const { data: doctorsData } = useGetDoctorsBySpecialty(selectedSpecialty);

  const handleAnalyzeSymptoms = async () => {
    if (!formData.symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please describe your symptoms",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const patientInfo = {
        age: userData?.age,
        gender: userData?.gender,
        medical_history: "None", // Could be enhanced with actual medical history
        current_medications: [],
        allergies: [],
      };

      const result = await analyzeSymptoms.mutateAsync({
        symptoms: formData.symptoms,
        patient_info: patientInfo,
      });

      setAnalysisResult(result);
      setSelectedSpecialty(result.recommendations.primary_specialty);

      // Save to diagnosis history
      const diagnosisData = {
        symptoms: {
          description: formData.symptoms,
          severity: formData.severity,
          duration: formData.duration,
          onset: formData.onset,
          triggers: formData.triggers,
          associatedSymptoms: formData.associatedSymptoms,
        },
        patientContext: {
          age: userData?.age,
          gender: userData?.gender,
          medicalHistory: "None",
          currentMedications: [],
          allergies: [],
        },
        aiDiagnosis: {
          preliminaryDiagnosis: result.diagnosis.preliminary_diagnosis,
          confidence: result.diagnosis.confidence,
          possibleConditions: result.diagnosis.possible_conditions,
          urgencyLevel: result.diagnosis.urgency_level,
          aiModel: result.analysis_metadata.model_used,
          processingTime: result.analysis_metadata.processing_time,
          modelVersion: "v1.0",
        },
        recommendations: {
          primarySpecialty: result.recommendations.primary_specialty,
          secondarySpecialties: result.recommendations.secondary_specialties,
          immediateActions: result.recommendations.immediate_actions,
          generalAdvice: result.recommendations.general_advice,
          followUpTimeline: result.recommendations.follow_up_timeline,
        },
        status: "active",
      };

      await createDiagnosis.mutateAsync(diagnosisData);

      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return FiAlertTriangle;
      case "high":
        return FiActivity;
      case "medium":
        return FiClock;
      case "low":
        return FiCheckCircle;
      default:
        return FiClock;
    }
  };

  return (
    <Box w="full">
      <Heading fontSize={{ base: "20px", md: "24px" }} lineHeight={"32px"} fontWeight={700} color="gray.800" fontFamily="heading">
        AI Health Assistant
      </Heading>
      <Text
        fontSize={{ base: "14px", md: "16px" }}
        fontWeight={400}
        lineHeight={"24px"}
        letterSpacing={"-2%"}
        color="gray.500"
        mt="4px"
        fontFamily="body"
      >
        Describe your symptoms and get AI-powered preliminary diagnosis and recommendations.
      </Text>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={6}>
        {/* Symptom Input */}
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="gray.800">
                  <Icon as={FiCpu} mr={2} />
                  Describe Your Symptoms
                </Heading>
                
                <FormControl>
                  <FormLabel>Primary Symptoms</FormLabel>
                  <Textarea
                    placeholder="Describe your symptoms in detail (e.g., 'I have been experiencing chest pain for the past 2 days')"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows={4}
                    resize="vertical"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Severity</FormLabel>
                  <Select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Duration</FormLabel>
                  <Input
                    placeholder="e.g., 2 days, 1 week"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Onset</FormLabel>
                  <Select
                    value={formData.onset}
                    onChange={(e) => setFormData({ ...formData, onset: e.target.value })}
                  >
                    <option value="">Select onset</option>
                    <option value="sudden">Sudden</option>
                    <option value="gradual">Gradual</option>
                    <option value="intermittent">Intermittent</option>
                  </Select>
                </FormControl>

                <Button
                  colorScheme="brand"
                  onClick={handleAnalyzeSymptoms}
                  isLoading={isAnalyzing}
                  loadingText="Analyzing..."
                  leftIcon={<FiCpu />}
                  size="lg"
                >
                  Analyze Symptoms
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Analysis Results */}
        <GridItem>
          {isAnalyzing ? (
            <Card>
              <CardBody>
                <VStack spacing={4} align="center" py={8}>
                  <Spinner size="xl" color="brand.500" />
                  <Text fontSize="lg" fontWeight={600} color="gray.700">
                    Analyzing your symptoms...
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Our AI is processing your symptoms and medical information to provide a preliminary assessment.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : analysisResult ? (
            <VStack spacing={4} align="stretch">
              {/* Diagnosis Card */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md" color="gray.800">
                        Preliminary Diagnosis
                      </Heading>
                      <Badge
                        colorScheme={getUrgencyColor(analysisResult.diagnosis.urgency_level)}
                        fontSize="sm"
                        px={3}
                        py={1}
                      >
                        <Icon as={getUrgencyIcon(analysisResult.diagnosis.urgency_level)} mr={1} />
                        {analysisResult.diagnosis.urgency_level.toUpperCase()}
                      </Badge>
                    </HStack>

                    <Text fontSize="lg" fontWeight={600} color="gray.700">
                      {analysisResult.diagnosis.preliminary_diagnosis}
                    </Text>

                    <HStack>
                      <Badge colorScheme="blue" variant="subtle">
                        Confidence: {(analysisResult.diagnosis.confidence * 100).toFixed(0)}%
                      </Badge>
                    </HStack>

                    {analysisResult.diagnosis.possible_conditions.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight={600} color="gray.600" mb={2}>
                          Possible Conditions:
                        </Text>
                        <Flex wrap="wrap" gap={2}>
                          {analysisResult.diagnosis.possible_conditions.map((condition: string, index: number) => (
                            <Badge key={index} colorScheme="purple" variant="outline">
                              {condition}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                    )}

                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Medical Disclaimer</AlertTitle>
                        <AlertDescription>
                          {analysisResult.diagnosis.disclaimer}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>

              {/* Recommendations Card */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="gray.800">
                      Recommendations
                    </Heading>

                    <Box>
                      <Text fontSize="sm" fontWeight={600} color="gray.600" mb={2}>
                        Primary Specialty:
                      </Text>
                      <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                        {analysisResult.recommendations.primary_specialty.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </Box>

                    {analysisResult.recommendations.immediate_actions.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight={600} color="gray.600" mb={2}>
                          Immediate Actions:
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          {analysisResult.recommendations.immediate_actions.map((action: string, index: number) => (
                            <HStack key={index}>
                              <Icon as={FiArrowRight} color="brand.500" />
                              <Text fontSize="sm">{action}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    <Box>
                      <Text fontSize="sm" fontWeight={600} color="gray.600" mb={2}>
                        General Advice:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {analysisResult.recommendations.general_advice}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight={600} color="gray.600" mb={2}>
                        Follow-up Timeline:
                      </Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {analysisResult.recommendations.follow_up_timeline}
                      </Badge>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Available Doctors */}
              {doctorsData && doctorsData.doctors.length > 0 ? (
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.800">
                        Available Doctors
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {doctorsData.doctors.slice(0, 3).map((doctor: any) => (
                          <HStack key={doctor._id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight={600} color="gray.800">
                                Dr. {doctor.first_name} {doctor.last_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {doctor.specialty}
                              </Text>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              onClick={onBookModalOpen}
                            >
                              Book Appointment
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ) : selectedSpecialty && (
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="center" py={4}>
                      <Icon as={FiUser} size="lg" color="gray.400" />
                      <Text fontSize="lg" fontWeight={600} color="gray.700">
                        No Doctors Available
                      </Text>
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        We don't have any doctors available for {selectedSpecialty.replace(/_/g, ' ')} at the moment.
                        Please check back later or contact our support team.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          ) : (
            <Card>
              <CardBody>
                <VStack spacing={4} align="center" py={8}>
                                     <Icon as={FiCpu} boxSize="lg" color="gray.400" />
                  <Text fontSize="lg" fontWeight={600} color="gray.700">
                    Ready to Analyze
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Describe your symptoms in the form to get AI-powered preliminary diagnosis and recommendations.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </GridItem>
      </Grid>

      {/* Book Doctor Modal */}
      <BookDoctorModal 
        isOpen={isBookModalOpen} 
        onClose={onBookModalClose}
        onAppointmentCreated={() => {
          onBookModalClose();
          toast({
            title: "Appointment Booked",
            description: "Your appointment has been scheduled successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }}
      />
    </Box>
  );
};

export default AIAssistant; 