import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";
import { Colors } from "./Colors";

interface CustomButtonProps extends ButtonProps {
  variant: "primary" | "secondary";
  label: string;
  size: "xs" | "sm" | "md" | "lg";
}

const ButtonColors = {
  primary: { bg: Colors.primaryBlue },
};

const CustomButton = ({
  variant,
  label,
  size,
  ...props
}: CustomButtonProps) => {
  return (
    <Button
      bgColor={ButtonColors[variant].bg}
      size={size}
      borderRadius={"12px"}
      fontFamily={"Inter"}
      {...props}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
