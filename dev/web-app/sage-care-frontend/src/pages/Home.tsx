import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import React from "react";
import Appointments from "../components/home/Appointments";
import NutritionSummary from "../components/home/NutritionSummary";
import { QuickActionTemplate } from "../components/home/CardTemplate";
import BookDoctorModal from "../components/modals/BookDoctorModal";
import { useGetUserDetails } from "../api/user";

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading } = useGetUserDetails();

  const [refreshKey, setRefreshKey] = useState(0);

  const handleAppointmentCreated = () => {
    // Trigger a refresh of the appointments list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box w="full">
      {isLoading ? (
        <Flex w="full" h="80vh" justify="center" align="center">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : (
        <>
          <Heading fontSize={{ base: "20px", md: "24px" }} lineHeight={"32px"} fontWeight={700} color="gray.800" fontFamily="heading">
            Welcome, {data?.fullname}
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
            Let's take care of your health today.
          </Text>
          <Flex mt="24px" gap="12px" direction={{ base: "column", lg: "row" }}>
            <Box flex={{ base: "1", lg: "2" }}>
              <Appointments refreshKey={refreshKey} />
            </Box>
            <Box flex={{ base: "1", lg: "1" }}>
              <NutritionSummary />
            </Box>
          </Flex>

          <Text
            fontSize={{ base: "16px", md: "18px" }}
            fontWeight={600}
            lineHeight={"24px"}
            mt="32px"
            color="gray.800"
            fontFamily="heading"
          >
            Quick actions
          </Text>
          <Flex mt="16px" gap="12px" direction={{ base: "column", md: "row" }}>
            <Box flex="1">
              <QuickActionTemplate
                title="Book appointments"
                subtitle="Find a doctor and schedule a consultation."
                action={onOpen}
              />
            </Box>
            <Box flex="1">
              <QuickActionTemplate
                title="Upload a meal"
                subtitle="Get nutrition insights from your food."
              />
            </Box>
          </Flex>

          <BookDoctorModal 
            isOpen={isOpen} 
            onClose={onClose} 
            onAppointmentCreated={handleAppointmentCreated}
          />
        </>
      )}
    </Box>
  );
};

export default Home;
