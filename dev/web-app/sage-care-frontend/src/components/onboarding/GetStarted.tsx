import Input from "../Input";
import CustomButton from "../CustomButton";

const GetStarted = () => {
  return (
    // <Box maxW={"534px"} w={"full"} mx="auto">
    //   <Heading fontSize={"32px"} fontWeight={600} lineHeight={"40px"}>
    //     Let’s get you started
    //   </Heading>
    //   <Text
    //     fontSize={"14px"}
    //     fontWeight={400}
    //     lineHeight={"20px"}
    //     letterSpacing={"-2%"}
    //     mt={"8px"}
    //     color={Colors.textGray}
    //   >
    //     {`We’ll create an account if you don’t have one yet.`}
    //   </Text>
    <>
      <Input
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
      />
    </>

    // </Box>
  );
};

export default GetStarted;
