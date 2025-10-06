import { Box, Heading, Stack, Text, useToast, Link } from "@chakra-ui/react";
import AuthLayout from "../layouts/AuthLayout";
import CustomButton from "../components/CustomButton";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";

const Login = () => {
  const { mutate: loginUser, isPending } = useLoginUser();
  const navigate = useNavigate();
  const toast = useToast();

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
      const data = {
        email: values.email,
        password: values.password,
      };
      loginUser(
        { data },
        {
          onSuccess: (res) => {
            localStorage.setItem("token", res?.accessToken);
            localStorage.setItem("userId", res?._id);
            const { password, accessToken, ...userData } = res;
            localStorage.setItem("user", JSON.stringify(userData));
            toast({
              title: "Login successful",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            navigate("/");
          },
          onError: (error) => {
            toast({
              title: "Login failed",
              description: error?.message || "Please check your credentials",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      );
    },
  });

  return (
    <AuthLayout>
      <Box>
        <Box maxW={"534px"} w={"full"} bg="white" borderRadius="xl" boxShadow="lg" px={{ base: "20px", md: "40px" }} py={{ base: "32px", md: "48px" }}>
          <Heading fontSize={{ base: "28px", md: "32px" }} fontWeight={700} lineHeight={"40px"} color="brand.500" mb="8px" fontFamily="heading">
            Welcome back
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
            Login to your account
          </Text>
          <FormikProvider value={formik}>
            <form>
              <Stack spacing={"20px"}>
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
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  placeholder="Enter your password"
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
                isLoading={isPending}
              />
              
              <Box textAlign="center" mt="24px">
                <Text fontSize="14px" color="gray.500" fontFamily="body">
                  Don't have an account?{" "}
                  <Link
                    color="brand.500"
                    fontWeight={600}
                    textDecoration="none"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => navigate("/signup")}
                    cursor="pointer"
                  >
                    Sign up
                  </Link>
                </Text>
              </Box>
            </form>
          </FormikProvider>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;
