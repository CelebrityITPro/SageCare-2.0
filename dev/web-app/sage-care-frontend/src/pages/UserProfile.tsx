import React, { useState, useEffect } from "react";
import { Box, Avatar, Button, Input, FormControl, FormLabel, Stack, Heading, Spinner, useToast, VStack, HStack, Text } from "@chakra-ui/react";
import { useGetUserDetails, useUpdateUserProfile } from "../api/user";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { data: user, isLoading } = useGetUserDetails();
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();
  const toast = useToast();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
      });
      setProfilePic(user.profilePic || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("first_name", form.firstName);
    formData.append("last_name", form.lastName);
    formData.append("phone_number", form.phoneNumber);
    formData.append("age", form.age);
    formData.append("gender", form.gender);
    if (selectedFile) {
      formData.append("profilePic", selectedFile);
    }
    updateProfile(formData, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully!", status: "success", duration: 3000, isClosable: true });
      },
      onError: (error: any) => {
        toast({ title: "Failed to update profile", description: error?.message || "", status: "error", duration: 3000, isClosable: true });
      },
    });
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="50vh">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  const userId = localStorage.getItem("userId");

  return (
    <Box maxW="600px" mx="auto" mt={8} p={6} bg="white" borderRadius="xl" boxShadow="lg">
      <Heading mb={8} fontSize="28px" fontWeight={700} color="gray.800" fontFamily="heading">
        Profile Settings
      </Heading>
      <VStack spacing={6} align="stretch">
        <Box display="flex" flexDirection="column" alignItems="center" py={6}>
          <Box
            w="120px"
            h="120px"
            borderRadius="full"
            bg={userId ? "transparent" : "brand.500"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            border="4px solid"
            borderColor="gray.200"
            mb={4}
          >
            {userId ? (
              <Box
                as="img"
                src={`/users/${userId}/profile-pic`}
                alt="Profile"
                w="100%"
                h="100%"
                objectFit="cover"
                onError={(e) => {
                  // If image fails to load, show initials
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = 'var(--chakra-colors-brand-500)';
                    parent.innerHTML = `<span style="font-size: 24px; font-weight: 600; color: white; text-align: center;">${(form.firstName.charAt(0) + form.lastName.charAt(0)).toUpperCase()}</span>`;
                  }
                }}
              />
            ) : (
              <Text
                fontSize="24px"
                fontWeight={600}
                color="white"
                textAlign="center"
              >
                {(form.firstName.charAt(0) + form.lastName.charAt(0)).toUpperCase()}
              </Text>
            )}
          </Box>
          <FormControl maxW="300px">
            <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
              Change Profile Picture
            </FormLabel>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              placeholder=""
              id="profile-pic"
            />
          </FormControl>
        </Box>
        
        <HStack spacing={4} direction={{ base: "column", md: "row" }}>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
              First Name
            </FormLabel>
            <Input 
              type="text"
              name="firstName" 
              value={form.firstName} 
              onChange={handleChange}
              placeholder="Enter first name"
              id="firstName"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
              Last Name
            </FormLabel>
            <Input 
              type="text"
              name="lastName" 
              value={form.lastName} 
              onChange={handleChange}
              placeholder="Enter last name"
              id="lastName"
            />
          </FormControl>
        </HStack>
        
        <FormControl>
          <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
            Email
          </FormLabel>
          <Input 
            type="email"
            name="email" 
            value={form.email} 
            onChange={handleChange}
            placeholder="Enter email"
            id="email"
            isDisabled
          />
        </FormControl>
        
        <HStack spacing={4} direction={{ base: "column", md: "row" }}>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
              Phone Number
            </FormLabel>
            <Input 
              type="tel"
              name="phoneNumber" 
              value={form.phoneNumber} 
              onChange={handleChange}
              placeholder="Enter phone number"
              id="phoneNumber"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
              Age
            </FormLabel>
            <Input 
              type="number"
              name="age" 
              value={form.age} 
              onChange={handleChange}
              placeholder="Enter age"
              id="age"
            />
          </FormControl>
        </HStack>
        
        <FormControl>
          <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
            Gender
          </FormLabel>
          <Input 
            type="text"
            name="gender" 
            value={form.gender} 
            onChange={handleChange}
            placeholder="Enter gender"
            id="gender"
          />
        </FormControl>
        
        <HStack spacing={4} mt={6}>
          <CustomButton
            label="Cancel"
            variant="secondary"
            size="lg"
            onClick={handleCancel}
            flex={1}
          />
          <CustomButton
            label="Save Changes"
            variant="primary"
            size="lg"
            onClick={handleSave}
            isLoading={isPending}
            flex={1}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default UserProfile; 