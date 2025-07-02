import { Stack } from "@chakra-ui/react";
import Input from "../Input";
import React from "react";

const CreatePassword = ({ formik }) => {
  return (
    <>
      <Stack spacing={"16px"}>
        <Input
          label="Create password"
          type="password"
          id="password"
          name="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          error={formik.touched.password && Boolean(formik.errors.password)}
          placeholder="Create a password"
        />
        <Input
          label="Confirm password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          placeholder="Create a password"
        />
      </Stack>
    </>
  );
};

export default CreatePassword;
