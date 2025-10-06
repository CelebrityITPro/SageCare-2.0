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
  Text,
  Checkbox,
  Box,
  Heading,
  Divider,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FiShield, FiUserCheck, FiFileText } from "react-icons/fi";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isLoading?: boolean;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isLoading = false,
}) => {
  const [hasAccepted, setHasAccepted] = React.useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader>
          <Box display="flex" alignItems="center" gap={2}>
            <FiShield color="#3182CE" />
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              Terms and Conditions
            </Text>
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody maxH="400px" overflowY="auto">
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                <strong>Important:</strong> This is a healthcare application that will handle your personal health information. Please read the following terms carefully.
              </Text>
            </Alert>

            <Box>
              <Heading size="sm" mb={3} color="brand.500" display="flex" alignItems="center" gap={2}>
                <FiFileText />
                Privacy and Data Protection
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                By creating an account with SageCare, you acknowledge and consent to the collection, use, and disclosure of your personal health information in accordance with applicable privacy laws and regulations.
              </Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                We are committed to protecting your privacy and maintaining the confidentiality of your health information. Your data will be stored securely and used only for the purposes of providing healthcare services.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3} color="brand.500" display="flex" alignItems="center" gap={2}>
                <FiUserCheck />
                Consent for Healthcare Services
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                You consent to receive healthcare services through our platform, including virtual consultations, appointment scheduling, and health monitoring features.
              </Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                You understand that while we strive to provide quality healthcare services, virtual consultations may have limitations and should not replace emergency medical care.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3} color="brand.500">
                Data Usage and Sharing
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Your health information may be shared with healthcare providers involved in your care, as required by law, or with your explicit consent.
              </Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                We may use anonymized data for research and improvement of our services, but your personal information will never be used for these purposes without your consent.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3} color="brand.500">
                Your Rights
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                You have the right to access, correct, or delete your personal health information. You may also withdraw your consent at any time by contacting our support team.
              </Text>
              <Text fontSize="sm" color="gray.600">
                For questions about your privacy rights or to exercise them, please contact our privacy officer at privacy@sagecare.com
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack spacing={3} w="full">
            <Checkbox
              isChecked={hasAccepted}
              onChange={(e) => setHasAccepted(e.target.checked)}
              colorScheme="brand"
              size="lg"
            >
              <Text fontSize="sm">
                I have read, understood, and agree to the Terms and Conditions and consent to the collection and use of my personal health information as described above.
              </Text>
            </Checkbox>
            
            <Box display="flex" gap={3} w="full">
              <Button
                variant="outline"
                onClick={onClose}
                flex={1}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleAccept}
                flex={1}
                isDisabled={!hasAccepted || isLoading}
                isLoading={isLoading}
                loadingText="Creating Account..."
              >
                Accept & Create Account
              </Button>
            </Box>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TermsAndConditionsModal; 