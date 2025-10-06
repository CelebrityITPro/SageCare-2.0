import { Box, Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TemplateProps {
  title: string;
  subtitle?: string | ReactNode;
  form: ReactNode;
}
const FormTemplate = ({ title, subtitle, form }: TemplateProps) => {
  return (
    <Box maxW={"534px"} w={"full"} mx="auto">
      <Heading fontSize={"32px"} fontWeight={700} lineHeight={"40px"} color="gray.800" fontFamily="heading">
        {title}
      </Heading>
      <Text
        fontSize={"16px"}
        fontWeight={400}
        lineHeight={"24px"}
        letterSpacing={"-2%"}
        mt={"8px"}
        color="gray.500"
        fontFamily="body"
      >
        {subtitle}
      </Text>
      <Box mt="32px">
        {form}
      </Box>
    </Box>
  );
};

export default FormTemplate;
