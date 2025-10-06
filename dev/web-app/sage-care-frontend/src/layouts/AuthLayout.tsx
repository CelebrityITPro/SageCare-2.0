import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) navigate(ROUTES.HOME);
  }, []);

  return (
    <Flex w="full" h="100vh" align="center" justify="center">
      <Box w={{ base: "0%", md: "45%" }} h="100vh" bg="gray" display={{ base: "none", md: "block" }}>
        <Box
          w="full"
          bgColor="brand.500"
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
            fontFamily="heading"
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
      <Box w={{ base: "100%", md: "55%" }} bg="white" p={{ base: "20px", md: "20px" }} pl={{ base: "20px", md: "80px" }}>
        {children}
      </Box>
    </Flex>
  );
};

export default AuthLayout;
