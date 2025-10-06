import { Box, Center, Flex, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface QuickActionTemplateProps {
  title: string;
  subtitle: string;
  action?: () => void;
}

export const QuickActionTemplate = ({
  title,
  subtitle,
  action,
}: QuickActionTemplateProps) => {
  return (
    <Flex
      alignItems={"center"}
      borderRadius={"16px"}
      bg="white"
      p="20px"
      gap="16px"
      cursor={"pointer"}
      border="1px solid"
      borderColor="gray.200"
      _hover={{ 
        bg: "gray.50", 
        transform: "translateY(-2px)",
        boxShadow: "lg",
        borderColor: "brand.200"
      }}
      transition={"all 0.2s ease"}
      onClick={action}
    >
      <Center 
        boxSize={"48px"} 
        borderRadius={"12px"} 
        bg="brand.100"
        color="brand.500"
      >
        <Box w="6" h="6" bg="currentColor" borderRadius="full" />
      </Center>
      <Box flex="1">
        <Text
          fontSize={"16px"}
          fontWeight={600}
          lineHeight={"24px"}
          letterSpacing={"-2%"}
          color="gray.800"
          fontFamily="heading"
        >
          {title}
        </Text>
        <Text
          fontSize={"14px"}
          fontWeight={400}
          lineHeight={"20px"}
          letterSpacing={"-2%"}
          color="gray.500"
          mt="4px"
          fontFamily="body"
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
      border={"1px solid"}
      borderColor="gray.200"
      borderRadius={"20px"}
      w="full"
      h="full"
      boxShadow="sm"
      overflow="hidden"
    >
      <Box
        px="20px"
        pt="20px"
        pb="16px"
        borderBottom="1px solid"
        borderColor="gray.100"
        bg="gray.50"
      >
        <Text
          fontSize={"16px"}
          lineHeight={"24px"}
          color={"gray.700"}
          fontWeight={600}
          fontFamily="heading"
        >
          {cardTitle}
        </Text>
      </Box>
      <Flex px="20px" pt="16px" pb="20px" flex={"1"}>
        <Center
          bgColor="gray.50"
          flexDirection={"column"}
          borderRadius={"16px"}
          w="full"
          p="32px"
          border="1px solid"
          borderColor="gray.100"
        >
          {children}
        </Center>
      </Flex>
    </Flex>
  );
};

export default CardTemplate;
