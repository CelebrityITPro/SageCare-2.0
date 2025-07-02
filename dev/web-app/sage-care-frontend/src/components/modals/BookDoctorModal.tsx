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
} from "@chakra-ui/react";
import { Colors } from "../Colors";
import React from "react";

const BookDoctorModal = ({ isOpen, onClose }) => {
  const steps = [
    { step: "Find a doctor" },
    { step: "Select a date" },
    { step: "Confirm appointment" },
  ];

  const DoctorsList = [
    { name: "Dr. John Doe", specialty: "Cardiologist" },
    { name: "Dr. Jane Smith", specialty: "Dermatologist" },
    { name: "Dr. Emily Johnson", specialty: "Pediatrician" },
    { name: "Dr. Michael Brown", specialty: "Orthopedic Surgeon" },
    { name: "Dr. Sarah Davis", specialty: "Neurologist" },
  ];

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
            <Stack spacing={"8px"}>
              {steps.map((item, index) => (
                <Text
                  key={index}
                  fontWeight={500}
                  fontSize={"14px"}
                  lineHeight={"20px"}
                  p="10px"
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
                Find a Doctor
              </Text>
            </Box>
            <Box py="16px" px="24px">
              <Stack spacing={"8px"}>
                {DoctorsList.map((doctor, index) => (
                  <Flex
                    key={index}
                    p="16px"
                    gap={"16px"}
                    alignItems={"center"}
                    borderRadius={"12px"}
                    borderBottom={`1px solid #F0F0F0`}
                    _hover={{ bg: Colors.cardGray, cursor: "pointer" }}
                  >
                    <Avatar />
                    <Box>
                      <Text fontWeight={600} fontSize={"14px"}>
                        {doctor.name}
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
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookDoctorModal;
