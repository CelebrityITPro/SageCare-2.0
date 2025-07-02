import { Box, Select, Text } from "@chakra-ui/react";
import Input from "../Input";
import React from "react";
import { Colors } from "../Colors";

const OtherDetails = ({ formik }) => {
  return (
    <>
      {/* <Input label="Date of birth" type="date" placholder="Date of birth" /> */}
      <Input
        label="Age"
        type="number"
        placholder="Age"
        id="age"
        name="age"
        value={formik.values.age}
        onChange={formik.handleChange}
        error={formik.touched.age && Boolean(formik.errors.age)}
      />
      <Input
        label="Phone number"
        type="tel"
        placholder="Phone number"
        id="phoneNumber"
        name="phoneNumber"
        value={formik.values.phoneNumber}
        onChange={formik.handleChange}
        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
      />
      <Box>
        <Text fontSize={"14px"} lineHeight={"20px"} fontWeight={500} mb="8px">
          Gender
        </Text>
        <Select
          placeholder="Sex assigned at birth"
          bg={"#F7F7F7"}
          border={formik.errors.gender ? "2px solid red" : "none"}
          _focusVisible={{
            border: `2px solid ${Colors.primaryBlue}`,
            bgColor: "#ffffff",
          }}
          borderRadius={"12px"}
          height={"48px"}
          id="gender"
          name="gender"
          onChange={formik.handleChange}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Select>
      </Box>
    </>
  );
};

export default OtherDetails;
