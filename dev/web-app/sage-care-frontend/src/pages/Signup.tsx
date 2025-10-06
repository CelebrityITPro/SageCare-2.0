import { Box, Heading, Stack, Text, Link, useToast, Progress, Alert, AlertIcon } from "@chakra-ui/react";
import AuthLayout from "../layouts/AuthLayout";
import GetStarted from "../components/onboarding/GetStarted";
import CreatePassword from "../components/onboarding/CreatePassword";
import CustomButton from "../components/CustomButton";
import OtherDetails from "../components/onboarding/OtherDetails";
import TermsAndConditionsModal from "../components/modals/TermsAndConditionsModal";
import { useState } from "react";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useSignUp } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

const Signup = () => {
  const [page, setPage] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<"email_exists" | "general" | "network">("general");
  const toast = useToast();
  const { mutate: signUpUser, isLoading: isSigningUp } = useSignUp();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      phoneNumber: "",
      gender: "",
      username: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      username: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
      ...(page === 2 && {
        age: Yup.number().required("Age is required").positive().integer(),
        phoneNumber: Yup.string().required("Phone number is required"),
        gender: Yup.string().required("Sex assigned at birth is required"),
      }),
    }),
    onSubmit: (values) => {
      if (page === 1) {
        console.log(values);
        setPage(2);
        // Clear any existing errors when moving to next page
        setErrorMessage("");
      } else {
        // Show terms and conditions modal before creating account
        setShowTermsModal(true);
      }
    },
  });

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    const data = {
      email: formik.values.email,
      password: formik.values.password,
      first_name: formik.values.firstName,
      last_name: formik.values.lastName,
      age: formik.values.age,
      gender: formik.values.gender,
      phone_number: formik.values.phoneNumber,
      is_patient: true,
      is_doctor: false,
      isAdmin: false,
    };
    
    signUpUser(
      { data },
      {
        onSuccess: (res) => {
          localStorage.setItem("token", res?.accessToken);
          navigate("/");
        },
                 onError: (error: any) => {
           console.error("Signup error:", error);
           
           // Handle different types of errors
           if (error?.message?.includes("email") || error?.message?.includes("already exists")) {
             setErrorMessage("A user with this email already exists");
             setErrorType("email_exists");
           } else if (error?.message?.includes("network") || error?.message?.includes("connection")) {
             setErrorMessage("Network error. Please check your connection and try again.");
             setErrorType("network");
           } else {
             setErrorMessage(error?.message || "Account creation failed. Please try again.");
             setErrorType("general");
           }
         },
      }
    );
  };

  const clearError = () => {
    setErrorMessage("");
  };

  return (
    <AuthLayout>
      <Box>
        <Box maxW={"534px"} w={"full"} bg="white" borderRadius="xl" boxShadow="lg" px={{ base: "20px", md: "40px" }} py={{ base: "32px", md: "48px" }}>
          <Heading fontSize={{ base: "28px", md: "32px" }} fontWeight={700} lineHeight={"40px"} color="brand.500" mb="8px" fontFamily="heading">
            Let’s get you started
          </Heading>
          <Text
            fontSize={{ base: "15px", md: "16px" }}
            fontWeight={400}
            lineHeight={"24px"}
            letterSpacing={"-2%"}
            mt={"4px"}
            color="gray.500"
            mb="32px"
            fontFamily="body"
          >
            {`We’ll create an account if you don’t have one yet.`}
          </Text>
          <Progress value={page === 1 ? 50 : 100} size="sm" colorScheme="brand" borderRadius="full" mb="24px" />
          
          {/* Error Alert */}
          {errorMessage && (
            <Alert 
              status={errorType === "email_exists" ? "warning" : "error"} 
              borderRadius="md" 
              mb="20px"
              onClose={clearError}
              isClosable
            >
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  {errorMessage}
                </Text>
                {errorType === "email_exists" && (
                  <Text fontSize="xs" color="gray.600" mt="4px">
                    Try signing in with your existing account or use a different email address.
                  </Text>
                )}
              </Box>
            </Alert>
          )}
          
          <FormikProvider value={formik}>
            <form onChange={() => setErrorMessage("")}>
              <Stack spacing={"20px"}>
                {page === 1 && (
                  <>
                    <GetStarted formik={formik} />
                    <CreatePassword formik={formik} />
                  </>
                )}
                {page === 2 && <OtherDetails formik={formik} />}
              </Stack>
              <CustomButton
                label={page === 2 ? "Continue" : "Next"}
                variant="primary"
                size="lg"
                w="full"
                mt="32px"
                color={"white"}
                onClick={() => formik.submitForm()}
                // isLoading={isLoading}
              />
            </form>
          </FormikProvider>
          <Link
            as={RouterLink}
            to="/login"
            color="brand.500"
            display="block"
            textAlign="center"
            mt="24px"
            fontWeight={500}
            fontSize="15px"
            _hover={{ textDecoration: "underline" }}
          >
            Already registered? Login
          </Link>
        </Box>
      </Box>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        isLoading={isSigningUp}
      />
    </AuthLayout>
  );
};

export default Signup;
