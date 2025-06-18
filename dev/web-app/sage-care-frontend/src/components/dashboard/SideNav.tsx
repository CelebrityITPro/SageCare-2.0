import { Box, Image, Text } from "@chakra-ui/react";
import { Colors } from "../Colors";
import React from "react";

const NavItems = [
  { title: "Home", iconSrc: "", id: "home" },
  { title: "Appointments", iconSrc: "", id: "appointments" },
  { title: "Your Nutrition", iconSrc: "", id: "nutrition" },
  { title: "Messages", iconSrc: "", id: "messages" },
];

const SideNav = () => {
  return (
    <Box
      h="100vh"
      w="full"
      maxW={"280px"}
      bg={"white"}
      borderRight={"1px solid #F0F0F0"}
      p="16px"
    >
      <Box px="12px" pt="20px" pb="12px">
        <Image
          src={"/sagecare-logo-dark.svg"}
          alt="logo"
          w={"111px"}
          h={"24px"}
        />
      </Box>
      <Box mt="16px">
        {NavItems.map((item) => (
          <Box
            key={item.id}
            display="flex"
            alignItems="center"
            p="12px"
            mb="8px"
            borderRadius="8px"
            _hover={{ bg: "#F7F7F7", cursor: "pointer" }}
          >
            {/* <Image src={item.iconSrc} alt={item.title} w="24px" h="24px" /> */}
            <Box ml="12px" fontSize="16px" fontWeight="500">
              <Text
                fontSize={"16px"}
                fontWeight={500}
                lineHeight={"20px"}
                letterSpacing={"-2%"}
                color={Colors.navGray}
              >
                {item.title}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SideNav;
