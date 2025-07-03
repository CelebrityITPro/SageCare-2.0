import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import AuthLayout from "../layouts/AuthLayout";
import { Colors } from "../components/Colors";
import CustomButton from "../components/CustomButton";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";

const Login = () => {
  const { mutate: loginUser } = useLoginUser();

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      // Handle final submission here
      console.log("Final submission values:", values);
      const data = {
        email: values.email,
        password: values.password,
      };
      console.log("Attempting login with data:", data);
      loginUser(
        { data },
        {
                  onSuccess: (res) => {
          console.log("Login successful:", res);
          localStorage.setItem("token", res?.accessToken);
          localStorage.setItem("userId", res?._id);
          // Store the full user object (excluding password and accessToken)
          const { password, accessToken, ...userData } = res;
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("Stored user data:", userData);
          navigate("/");
        },
          onError: (error) => {
            console.error("Login failed:", error);
            alert("Login failed: " + (error?.message || "Unknown error"));
          }
        }
      );
    },
  });

  return (
    <AuthLayout>
      <Box>
        <Box maxW={"534px"} w={"full"}>
          <Heading fontSize={"32px"} fontWeight={600} lineHeight={"40px"}>
            Welcome back
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
            {`Login to your account`}
          </Text>
          <FormikProvider value={formik}>
            <form>
              <Stack spacing={"16px"}>
                <Input
                  label="Email Address"
                  type="email"
                  placholder="Enter email address"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                />
                <Input
                  label="Create password"
                  type="password"
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  placeholder="Create a password"
                />
              </Stack>

              <CustomButton
                label={"Login"}
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

export default Login;
