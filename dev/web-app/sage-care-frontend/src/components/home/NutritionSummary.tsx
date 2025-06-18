import React from "react";
import CardTemplate from "./CardTemplate";
import { Box, Image, Text } from "@chakra-ui/react";
import { Colors } from "../Colors";

const NutritionSummary = () => {
  return (
    <CardTemplate cardTitle={"Your Nutrition summary"}>
      <Image src={"/no-meal-icon.svg"} alt="no-meal-icon" w="91px" h="88px" />
      <Box mt="16px" textAlign={"center"}>
        <Text
          fontSize={"16px"}
          fontWeight={600}
          lineHeight={"24px"}
          letterSpacing={"-2%"}
        >
          No meals yet
        </Text>
        <Text
          fontSize={"14px"}
          fontWeight={400}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
          color={Colors.textGray}
          mt="4px"
        >
          Want to know what’s in your food?
        </Text>
      </Box>
    </CardTemplate>
  );
};

export default NutritionSummary;
