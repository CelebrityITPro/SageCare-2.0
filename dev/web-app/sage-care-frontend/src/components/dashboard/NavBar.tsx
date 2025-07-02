import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

const NavBar = () => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate(ROUTES.LOGIN);
  };
  return (
    <Box w="100%" bg="white" borderBottom="1px solid #F0F0F0" p={4}>
      <Text ml={"auto"} cursor={"pointer"} onClick={logout}>
        Logout
      </Text>
    </Box>
  );
};

export default NavBar;
