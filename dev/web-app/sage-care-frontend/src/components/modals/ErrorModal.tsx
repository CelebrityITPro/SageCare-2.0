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
  Box,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FiAlertCircle, FiMail, FiUserX } from "react-icons/fi";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  errorType?: "email_exists" | "general" | "network";
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  errorType = "general",
}) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case "email_exists":
        return <FiMail />;
      case "network":
        return <FiAlertCircle />;
      default:
        return <FiUserX />;
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case "email_exists":
        return "Account Already Exists";
      case "network":
        return "Connection Error";
      default:
        return "Account Creation Failed";
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case "email_exists":
        return "orange";
      case "network":
        return "red";
      default:
        return "red";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Box display="flex" alignItems="center" gap={2}>
            {getErrorIcon()}
            <Text fontSize="lg" fontWeight="bold" color={`${getErrorColor()}.500`}>
              {getErrorTitle()}
            </Text>
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status={errorType === "email_exists" ? "warning" : "error"} borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {error}
              </Text>
            </Alert>

            {errorType === "email_exists" && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  It looks like an account with this email address already exists. You can:
                </Text>
                <VStack spacing={2} align="stretch">
                  <Text fontSize="sm" color="gray.600">
                    • Try signing in with your existing account
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Use a different email address to create a new account
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Reset your password if you've forgotten it
                  </Text>
                </VStack>
              </Box>
            )}

            {errorType === "network" && (
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Please check your internet connection and try again. If the problem persists, please contact our support team.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme={getErrorColor()}
            onClick={onClose}
            w="full"
          >
            {errorType === "email_exists" ? "Go to Login" : "Try Again"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ErrorModal; 