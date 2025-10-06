import { Input, FormControl, FormLabel } from "@chakra-ui/react";

const GetStarted = ({ formik }) => {
  return (
    <>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          First name
        </FormLabel>
        <Input
          type="text"
          placeholder="Enter first name"
          id="firstName"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          isInvalid={formik.touched.firstName && Boolean(formik.errors.firstName)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Last name
        </FormLabel>
        <Input
          type="text"
          placeholder="Enter last name"
          id="lastName"
          name="lastName"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          isInvalid={formik.touched.lastName && Boolean(formik.errors.lastName)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Email Address
        </FormLabel>
        <Input
          type="email"
          placeholder="Enter email address"
          id="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          isInvalid={formik.touched.email && Boolean(formik.errors.email)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="14px" fontWeight={500} color="gray.700">
          Username
        </FormLabel>
        <Input
          type="text"
          placeholder="Choose a username"
          id="username"
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          isInvalid={formik.touched.username && Boolean(formik.errors.username)}
        />
      </FormControl>
    </>
  );
};

export default GetStarted;
