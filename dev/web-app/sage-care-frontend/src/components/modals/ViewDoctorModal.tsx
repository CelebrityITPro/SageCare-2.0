import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Divider,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMail, FiMapPin, FiAward, FiBookOpen, FiCalendar } from "react-icons/fi";

interface Doctor {
  _id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  email: string;
  qualifications?: string[];
  experience?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  location?: string;
}

interface ViewDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const ViewDoctorModal: React.FC<ViewDoctorModalProps> = ({ 
  isOpen, 
  onClose, 
  doctor 
}) => {
  if (!doctor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" p="0">
        <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold" fontSize="xl">
          <HStack spacing={3}>
            <Avatar size="sm" name={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
            <Text>Dr. {doctor.first_name} {doctor.last_name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Basic Info */}
            <Box>
              <HStack spacing={4} mb={4}>
                <Avatar size="lg" name={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
                <Box flex={1}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </Text>
                  <Badge colorScheme="brand" variant="subtle" mt={1}>
                    {doctor.specialty}
                  </Badge>
                </Box>
              </HStack>
              
              <HStack spacing={4} color="gray.600" fontSize="sm">
                <HStack spacing={1}>
                  <Icon as={FiMail} />
                  <Text>{doctor.email}</Text>
                </HStack>
                {doctor.location && (
                  <HStack spacing={1}>
                    <Icon as={FiMapPin} />
                    <Text>{doctor.location}</Text>
                  </HStack>
                )}
              </HStack>
            </Box>

            <Divider />

            {/* Experience */}
            {doctor.experience && (
              <Box>
                <HStack spacing={2} mb={3}>
                  <Icon as={FiCalendar} color="brand.500" />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.800">
                    Experience
                  </Text>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  {doctor.experience}
                </Text>
              </Box>
            )}

            {/* Education */}
            {doctor.education && doctor.education.length > 0 && (
              <Box>
                <HStack spacing={2} mb={3}>
                  <Icon as={FiBookOpen} color="brand.500" />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.800">
                    Education
                  </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {doctor.education.map((edu, index) => (
                    <Text key={index} color="gray.600" fontSize="sm">
                      • {edu}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Qualifications */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <Box>
                <HStack spacing={2} mb={3}>
                  <Icon as={FiAward} color="brand.500" />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.800">
                    Qualifications
                  </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {doctor.qualifications.map((qual, index) => (
                    <Text key={index} color="gray.600" fontSize="sm">
                      • {qual}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Certifications */}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <Box>
                <HStack spacing={2} mb={3}>
                  <Icon as={FiAward} color="brand.500" />
                  <Text fontWeight="semibold" fontSize="lg" color="gray.800">
                    Certifications
                  </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {doctor.certifications.map((cert, index) => (
                    <Text key={index} color="gray.600" fontSize="sm">
                      • {cert}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <Box>
                <Text fontWeight="semibold" fontSize="lg" color="gray.800" mb={3}>
                  Languages Spoken
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {doctor.languages.map((lang, index) => (
                    <Badge key={index} colorScheme="gray" variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewDoctorModal; 