import { Box, Flex, Stack } from "@chakra-ui/react";
import SideNav from "../components/dashboard/SideNav";
import React, { useEffect } from "react";
import NavBar from "../components/dashboard/NavBar";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const DashboardLayout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) navigate(ROUTES.LOGIN);
  }, []);

  return (
    <Flex h="100vh" w="100vw" bg="#F7F7F7">
      <SideNav />
      <Stack w="full">
        <NavBar />
        <Box py={"48px"} px="20px">
          <Box maxW={"964px"} w="full" mx="auto">
            {/* This is where the nested routes will be rendered */}
            <Outlet />
          </Box>
        </Box>
      </Stack>
    </Flex>
  );
};

export default DashboardLayout;
