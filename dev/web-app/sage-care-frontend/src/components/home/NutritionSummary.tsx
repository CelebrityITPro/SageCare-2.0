import React from "react";
import CardTemplate from "./CardTemplate";
import { Box, Image, Text } from "@chakra-ui/react";

const NutritionSummary = () => {
  return (
    <CardTemplate cardTitle={"Your Nutrition summary"}>
      <Image src={"/no-meal-icon.svg"} alt="no-meal-icon" w="91px" h="88px" />
      <Box mt="16px" textAlign={"center"}>
        <Text
          fontSize={"18px"}
          fontWeight={600}
          lineHeight={"24px"}
          letterSpacing={"-2%"}
          color="gray.800"
          fontFamily="heading"
        >
          No meals yet
        </Text>
        <Text
          fontSize={"14px"}
          fontWeight={400}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
          color="gray.500"
          mt="8px"
          fontFamily="body"
        >
          Want to know what's in your food?
        </Text>
      </Box>
    </CardTemplate>
  );
};

export default NutritionSummary;
