import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

interface CustomButtonProps extends ButtonProps {
  variant: "primary" | "secondary";
  label: string;
  size: "xs" | "sm" | "md" | "lg";
}

const CustomButton = ({
  variant,
  label,
  size,
  ...props
}: CustomButtonProps) => {
  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "brand.500",
          color: "white",
          _hover: { bg: "brand.600" },
          _active: { bg: "brand.700" },
          _focus: { boxShadow: "0 0 0 3px var(--chakra-colors-brand-100)" },
        };
      case "secondary":
        return {
          bg: "transparent",
          color: "brand.500",
          border: "2px solid",
          borderColor: "brand.500",
          _hover: { bg: "brand.50" },
          _active: { bg: "brand.100" },
          _focus: { boxShadow: "0 0 0 3px var(--chakra-colors-brand-100)" },
        };
      default:
        return {};
    }
  };

  return (
    <Button
      size={size}
      borderRadius={"12px"}
      fontFamily={"Inter"}
      fontWeight={600}
      transition="all 0.2s"
      {...getButtonStyles()}
      {...props}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
