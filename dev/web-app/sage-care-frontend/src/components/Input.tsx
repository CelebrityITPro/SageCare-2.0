/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputGroup,
  Text,
  Input as ChakraInput,
  Box,
  InputProps,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { ChangeEvent } from "react";

interface IInputProps extends InputProps {
  label?: string;
  type: "text" | "number" | "password" | "email" | "date" | "tel";
  value?: any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placholder?: string;
  id: string;
  name?: string;
  error?: boolean;
  errorMessage?: string;
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
  errorMessage,
  ...props
}: IInputProps) => {
  return (
    <Box w="full">
      <Text fontSize={"14px"} lineHeight={"20px"} fontWeight={500} color="gray.700" mb="8px">
        {label}
      </Text>
      <InputGroup>
        <ChakraInput
          type={type}
          onChange={(e) => onChange(e)}
          value={value}
          placeholder={placholder}
          bg="gray.50"
          border={error ? "2px solid" : "1px solid"}
          borderColor={error ? "red.500" : "gray.200"}
          _focusVisible={{
            border: "2px solid",
            borderColor: "brand.500",
            bgColor: "white",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          }}
          _hover={{
            borderColor: error ? "red.500" : "gray.300",
          }}
          borderRadius={"12px"}
          height={"48px"}
          id={id}
          name={name}
          fontSize="16px"
          {...props}
        />
      </InputGroup>
      {error && errorMessage && (
        <FormErrorMessage mt="4px" fontSize="12px">
          {errorMessage}
        </FormErrorMessage>
      )}
    </Box>
  );
};

export default Input;
