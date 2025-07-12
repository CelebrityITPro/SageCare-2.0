import { Box, Select, Text, Input, FormControl, FormLabel } from "@chakra-ui/react";
import React from "react";

const OtherDetails = ({ formik }) => {
  return (
    <>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Age
        </FormLabel>
        <Input
          type="number"
          placeholder="Age"
          id="age"
          name="age"
          value={formik.values.age}
          onChange={formik.handleChange}
          isInvalid={formik.touched.age && Boolean(formik.errors.age)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Phone number
        </FormLabel>
        <Input
          type="tel"
          placeholder="Phone number"
          id="phoneNumber"
          name="phoneNumber"
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
          isInvalid={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Gender
        </FormLabel>
        <Select
          placeholder="Sex assigned at birth"
          bg="gray.50"
          border={formik.errors.gender ? "2px solid" : "1px solid"}
          borderColor={formik.errors.gender ? "red.500" : "gray.200"}
          _focusVisible={{
            border: "2px solid",
            borderColor: "brand.500",
            bgColor: "white",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          }}
          _hover={{
            borderColor: formik.errors.gender ? "red.500" : "gray.300",
          }}
          borderRadius={"12px"}
          height={"48px"}
          id="gender"
          name="gender"
          onChange={formik.handleChange}
          fontSize="16px"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Select>
      </FormControl>
    </>
  );
};

export default OtherDetails;
