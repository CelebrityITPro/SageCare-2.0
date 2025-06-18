import React from "react";
import CardTemplate from "./CardTemplate";
import { Box, Image, Text } from "@chakra-ui/react";
import { Colors } from "../Colors";

const Appointments = () => {
  return (
    <CardTemplate cardTitle={"Upcoming appointments "}>
      <Image
        src={"/no-appointment-icon.svg"}
        alt="no-appointment-icon"
        w="91px"
        h="88px"
      />
      <Box mt="16px" textAlign={"center"}>
        <Text
          fontSize={"16px"}
          fontWeight={600}
          lineHeight={"24px"}
          letterSpacing={"-2%"}
        >
          No Upcoming appointments
        </Text>
        <Text
          fontSize={"14px"}
          fontWeight={400}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
          color={Colors.textGray}
          mt="4px"
        >
          You haven’t booked any consultations yet.
          <br /> Let’s find the right doctor for you.
        </Text>
      </Box>
    </CardTemplate>
  );
};

export default Appointments;
