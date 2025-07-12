import { Stack, Input, FormControl, FormLabel } from "@chakra-ui/react";
import React from "react";

const CreatePassword = ({ formik }) => {
  return (
    <>
      <Stack spacing={"16px"}>
        <FormControl>
          <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
            Create password
          </FormLabel>
          <Input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            isInvalid={formik.touched.password && Boolean(formik.errors.password)}
            placeholder="Create a password"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
            Confirm password
          </FormLabel>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            isInvalid={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            placeholder="Confirm your password"
          />
        </FormControl>
      </Stack>
    </>
  );
};

export default CreatePassword;
