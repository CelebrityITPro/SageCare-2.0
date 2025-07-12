import { Box, Menu, MenuButton, MenuList, MenuItem, Avatar, HStack, Text, useToast, Icon } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { useGetUserDetails } from "../../api/user";
import { FiSettings, FiUser, FiLogOut } from "react-icons/fi";

const NavBar = () => {
  const navigate = useNavigate();
  const { data: user } = useGetUserDetails();
  const toast = useToast();
  const userId = localStorage.getItem("userId");

  const logout = () => {
    localStorage.clear();
    toast({
      title: "Logged out successfully",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    navigate(ROUTES.LOGIN);
  };

  // Generate initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getInitials(user?.fullname || "User");
  const profilePicUrl = userId ? `/users/${userId}/profile-pic` : undefined;

  return (
    <Box 
      w="100%" 
      bg="white" 
      borderBottom="1px solid" 
      borderColor="gray.200" 
      px={6} 
      py={4} 
      display="flex" 
      justifyContent="flex-end"
      alignItems="center"
      boxShadow="sm"
    >
      <HStack spacing={3}>
        <Text fontSize="14px" color="gray.600" fontWeight={500}>
          {user?.fullname || "User"}
        </Text>
        <Menu>
          <MenuButton
            as={Box}
            w="32px"
            h="32px"
            borderRadius="full"
            bg={profilePicUrl ? "transparent" : "brand.500"}
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
            transition="opacity 0.2s"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {profilePicUrl ? (
              <Box
                as="img"
                src={profilePicUrl}
                alt="Profile"
                w="100%"
                h="100%"
                objectFit="cover"
                onError={(e) => {
                  // If image fails to load, hide it and show initials
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = 'var(--chakra-colors-brand-500)';
                    parent.innerHTML = `<span style="font-size: 12px; font-weight: 600; color: white; text-align: center; line-height: 32px;">${userInitials}</span>`;
                  }
                }}
              />
            ) : (
              <Text
                fontSize="12px"
                fontWeight={600}
                color="white"
                textAlign="center"
                lineHeight="32px"
              >
                {userInitials}
              </Text>
            )}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate("/profile")} icon={<Icon as={FiUser} />}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate(ROUTES.SETTINGS)} icon={<Icon as={FiSettings} />}>
              Settings
            </MenuItem>
            <MenuItem onClick={logout} icon={<Icon as={FiLogOut} />}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
};

export default NavBar;
