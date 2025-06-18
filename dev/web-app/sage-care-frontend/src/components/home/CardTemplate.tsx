import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { Colors } from "../Colors";
import React, { ReactNode } from "react";

interface QuickActionTemplateProps {
  title: string;
  subtitle: string;
}

export const QuickActionTemplate = ({
  title,
  subtitle,
}: QuickActionTemplateProps) => {
  return (
    <Flex
      alignItems={"center"}
      borderRadius={"12px"}
      bg="white"
      p="16px"
      gap="16px"
      cursor={"pointer"}
      _hover={{ bg: "#F0F0F0", transform: "translateY(-2px)" }}
      transition={"all .3s linear"}
    >
      <Center boxSize={"48px"} borderRadius={"8px"} bg="purple.100"></Center>
      <Box>
        <Text
          fontSize={"14px"}
          fontWeight={600}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
        >
          {title}
        </Text>
        <Text
          fontSize={"14px"}
          fontWeight={400}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
          color={Colors.textGray}
        >
          {subtitle}
        </Text>
      </Box>
    </Flex>
  );
};

interface CardTemplateProps {
  cardTitle: string;
  children: ReactNode;
}

const CardTemplate = ({ cardTitle, children }: CardTemplateProps) => {
  return (
    <Flex
      flexDirection={"column"}
      bg={"white"}
      border={"1px solid #F0F0F0"}
      borderRadius={"20px"}
      w="full"
      h="full"
    >
      <Box
        px="16px"
        pt="16px"
        pb="12px"
        borderBottom={`1px solid ${Colors.cardGray}`}
      >
        <Text
          fontSize={"14px"}
          lineHeight={"20px"}
          color={"#727171"}
          fontWeight={600}
        >
          {cardTitle}
        </Text>
      </Box>
      <Flex px="16px" pt="12px" pb="16px" flex={"1"}>
        <Center
          bgColor={Colors.cardGray}
          flexDirection={"column"}
          borderRadius={"12px"}
          w="full"
          p="32px"
        >
          {children}
        </Center>
      </Flex>
    </Flex>
  );
};

export default CardTemplate;
