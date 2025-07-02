import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import AuthLayout from "../layouts/AuthLayout";
import GetStarted from "../components/onboarding/GetStarted";
import { Colors } from "../components/Colors";
import CreatePassword from "../components/onboarding/CreatePassword";
import CustomButton from "../components/CustomButton";
import OtherDetails from "../components/onboarding/OtherDetails";
import { useState } from "react";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useSignUp } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [page, setPage] = useState(1);

  const { mutate: signUpUser } = useSignUp();

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
      } else {
        // Handle final submission here
        console.log("Final submission values:", values);
        const data = {
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          age: values.age,
          gender: values.gender,
          phone_number: values.phoneNumber,
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
          }
        );
      }
      // You can send the data to your backend or perform any other action
    },
  });

  return (
    <AuthLayout>
      <Box>
        <Box maxW={"534px"} w={"full"}>
          <Heading fontSize={"32px"} fontWeight={600} lineHeight={"40px"}>
            Let’s get you started
          </Heading>
          <Text
            fontSize={"14px"}
            fontWeight={400}
            lineHeight={"20px"}
            letterSpacing={"-2%"}
            mt={"8px"}
            color={Colors.textGray}
            mb="32px"
          >
            {`We’ll create an account if you don’t have one yet.`}
          </Text>
          <FormikProvider value={formik}>
            <form>
              <Stack spacing={"16px"}>
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
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Signup;
