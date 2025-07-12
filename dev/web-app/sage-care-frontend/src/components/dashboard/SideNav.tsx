import { Box, Image, Text, VStack, HStack, Icon, Button, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes";
import { FiHome, FiCalendar, FiMessageSquare, FiUser, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";

const NavItems = [
  { title: "Home", icon: FiHome, path: ROUTES.HOME },
  { title: "Appointments", icon: FiCalendar, path: ROUTES.APPOINTMENTS },
  { title: "Your Nutrition", icon: FiHeart, path: ROUTES.NUTRITION },
  { title: "Messages", icon: FiMessageSquare, path: "/messages" },
];

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Box
      h="100vh"
      w="full"
      maxW={isMinimized ? "80px" : "280px"}
      bg={"white"}
      borderRight={"1px solid"}
      borderColor="gray.200"
      p={isMinimized ? "12px" : "20px"}
      boxShadow="sm"
      transition="all 0.3s ease"
      position="relative"
    >
      {/* Toggle Button */}
      <Button
        position="absolute"
        top="20px"
        right={isMinimized ? "-12px" : "-12px"}
        size="sm"
        borderRadius="full"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        onClick={toggleMinimize}
        _hover={{ bg: "gray.50" }}
        zIndex={10}
        minW="24px"
        h="24px"
        p={0}
      >
        <Icon 
          as={isMinimized ? FiChevronRight : FiChevronLeft} 
          color="gray.500"
          boxSize="12px"
        />
      </Button>

      {/* Logo */}
      <Box px={isMinimized ? "0px" : "12px"} pt="20px" pb="16px">
        <Box 
          textAlign="center" 
          cursor="pointer" 
          onClick={() => handleNavClick(ROUTES.HOME)}
          display="flex"
          justifyContent={isMinimized ? "center" : "flex-start"}
        >
          <Image
            src={"/sagecare-logo-dark.svg"}
            alt="logo"
            w={isMinimized ? "32px" : "111px"}
            h={isMinimized ? "32px" : "24px"}
            objectFit="contain"
          />
        </Box>
      </Box>

      {/* Navigation Items */}
      <VStack spacing={2} mt="24px" align="stretch">
        {NavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              label={isMinimized ? item.title : ""}
              placement="right"
              isDisabled={!isMinimized}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent={isMinimized ? "center" : "flex-start"}
                p={isMinimized ? "12px" : "12px"}
                borderRadius="12px"
                bg={isActive ? "brand.50" : "transparent"}
                border={isActive ? "1px solid" : "none"}
                borderColor={isActive ? "brand.200" : "transparent"}
                _hover={{ 
                  bg: isActive ? "brand.100" : "gray.50", 
                  cursor: "pointer",
                  transform: isMinimized ? "scale(1.1)" : "translateX(2px)",
                }}
                transition="all 0.2s"
                onClick={() => handleNavClick(item.path)}
                minH={isMinimized ? "40px" : "auto"}
              >
                <Icon 
                  as={item.icon}
                  color={isActive ? "brand.500" : "gray.400"}
                  mr={isMinimized ? "0" : "12px"}
                  boxSize="16px"
                />
                {!isMinimized && (
                  <Text
                    fontSize={"16px"}
                    fontWeight={isActive ? 600 : 500}
                    lineHeight={"20px"}
                    letterSpacing={"-2%"}
                    color={isActive ? "brand.500" : "gray.500"}
                    fontFamily="body"
                  >
                    {item.title}
                  </Text>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SideNav;
