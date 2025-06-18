import { Box, Heading, Text } from "@chakra-ui/react";
import { Colors } from "../Colors";
import { ReactNode } from "react";

interface TemplateProps {
  title: string;
  subtitle?: string | ReactNode;
  form: ReactNode;
}
const FormTemplate = ({ title, subtitle, form }: TemplateProps) => {
  return (
    <Box maxW={"534px"} w={"full"} mx="auto">
      <Heading fontSize={"32px"} fontWeight={600} lineHeight={"40px"}>
        {title}
      </Heading>
      <Text
        fontSize={"14px"}
        fontWeight={400}
        lineHeight={"20px"}
        letterSpacing={"-2%"}
        mt={"8px"}
        color={Colors.textGray}
      >
        {subtitle}
      </Text>
      <Box mt="32px">
        {form}
        {/* <Input
          label="Email Address"
          type="email"
          placholder="Enter email address"
        />

        <CustomButton
          label="Next"
          variant="primary"
          size="lg"
          w="full"
          mt="32px"
          color={"white"}
        /> */}
      </Box>
    </Box>
  );
};

export default FormTemplate;
