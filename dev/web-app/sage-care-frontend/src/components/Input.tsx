/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputGroup,
  Text,
  Input as ChakraInput,
  Box,
  InputProps,
} from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import { Colors } from "./Colors";

interface IInputProps extends InputProps {
  label?: string;
  type: "text" | "number" | "password" | "email" | "date" | "tel";
  value?: any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placholder?: string;
  id: string;
  name?: string;
  error?: boolean;
}

const Input = ({
  label,
  type,
  id,
  name,
  value,
  onChange,
  placholder,
  error = false,
  ...props
}: IInputProps) => {
  return (
    <Box w="full">
      <Text fontSize={"14px"} lineHeight={"20px"} fontWeight={500}>
        {label}
      </Text>
      <InputGroup mt="8px">
        <ChakraInput
          type={type}
          onChange={(e) => onChange(e)}
          value={value}
          placeholder={placholder}
          bg={"#F7F7F7"}
          border={error ? "2px solid red" : "none"}
          _focusVisible={{
            border: `2px solid ${Colors.primaryBlue}`,
            bgColor: "#ffffff",
          }}
          borderRadius={"12px"}
          height={"48px"}
          id={id}
          name={name}
          {...props}
        />
      </InputGroup>
    </Box>
  );
};

export default Input;
