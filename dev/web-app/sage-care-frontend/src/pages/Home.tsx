import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Colors } from "../components/Colors";
import React from "react";
import Appointments from "../components/home/Appointments";
import NutritionSummary from "../components/home/NutritionSummary";
import { QuickActionTemplate } from "../components/home/CardTemplate";

const Home = () => {
  return (
    <Box w="full">
      <Heading fontSize={"24px"} lineHeight={"32px"} fontWeight={600}>
        Welcome, Edwin
      </Heading>
      <Text
        fontSize={"14px"}
        fontWeight={400}
        lineHeight={"20px"}
        letterSpacing={"-2%"}
        color={Colors.textGray}
        mt="4px"
      >
        Let’s take care of your health today.
      </Text>
      <Flex mt="24px" gap="12px">
        <Box flex="2">
          <Appointments />
        </Box>
        <Box flex="1">
          <NutritionSummary />
        </Box>
      </Flex>

      <Text fontSize={"14px"} fontWeight={500} lineHeight={"20px"} mt="24px">
        Quick actions
      </Text>
      <Flex mt="12px" gap="12px">
        <Box flex="1">
          <QuickActionTemplate
            title="Book appointments"
            subtitle="Find a doctor and schedule a consultation."
          />
        </Box>
        <Box flex="1">
          <QuickActionTemplate
            title="Upload a meal"
            subtitle="Get nutrition insights from your food."
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
