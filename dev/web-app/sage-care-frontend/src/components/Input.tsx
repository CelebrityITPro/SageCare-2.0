/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputGroup, Text, Input as ChakraInput } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";

interface InputProps {
  label?: string;
  type: "text" | "number" | "password" | "email";
  value?: any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placholder?: string;
}

const Input = ({
  label,
  type,
  value,
  onChange,
  placholder,
  ...props
}: InputProps) => {
  return (
    <>
      <Text fontSize={"14px"} lineHeight={"20px"} fontWeight={500}>
        {label}
      </Text>
      <InputGroup mt="8px">
        <ChakraInput
          type={type}
          onChange={(e) => onChange(e)}
          value={value}
          placeholder={placholder}
          {...props}
        />
      </InputGroup>
    </>
  );
};

export default Input;
