import { Box } from "@chakra-ui/react";
import AuthLayout from "../layouts/AuthLayout";
import GetStarted from "../components/onboarding/GetStarted";

const Signup = () => {
  return (
    <AuthLayout>
      <Box>
        <GetStarted />
      </Box>
    </AuthLayout>
  );
};

export default Signup;
