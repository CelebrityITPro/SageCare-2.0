import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { Colors } from "../components/Colors";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex w="full" h="100vh" align="center" justify="center">
      <Box w="45%" h="100vh" bg="gray">
        <Box
          w="full"
          bgColor={Colors.primaryBlue}
          px="32px"
          pt="32px"
          pb="56px"
        >
          <Box
            borderRadius={"12px"}
            bg={"rgba(255, 255, 255, 0.08)"}
            p="8px"
            w="fit-content"
          >
            <Image
              src={"/sagecare-logo-white.svg"}
              alt="logo"
              w={"111px"}
              h={"24px"}
            />
          </Box>
          <Text
            fontSize={"32px"}
            fontWeight={500}
            lineHeight={"40px"}
            letterSpacing={"-2px"}
            mt="16px"
            maxW={"363px"}
            color={"white"}
          >
            Smarter health for every body.
          </Text>
        </Box>
        <Box
          h="calc(100vh - 220px)"
          bg={"url(/auth-layout-img.png)"}
          bgRepeat={"no-repeat"}
          bgPos={"center"}
          bgSize={"cover"}
        ></Box>
      </Box>
      <Box w="55%" bg="white" p="20px">
        {children}
      </Box>
    </Flex>
  );
};

export default AuthLayout;
