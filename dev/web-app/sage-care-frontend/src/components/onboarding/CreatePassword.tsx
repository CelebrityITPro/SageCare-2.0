import { Stack } from "@chakra-ui/react";
import Input from "../Input";
import React from "react";
import CustomButton from "../CustomButton";

const CreatePassword = () => {
  return (
    <>
      <Stack spacing={"16px"}>
        <Input label="Create password" type="password" />
        <Input label="Confirm password" type="password" />
      </Stack>
      <CustomButton label="Next" variant="primary" size="lg" mt="32px" />
    </>
  );
};

export default CreatePassword;
