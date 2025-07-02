import Input from "../Input";

const GetStarted = ({ formik }) => {
  return (
    <>
      <Input
        label="First name"
        type="text"
        placholder="Enter first name"
        id="firstName"
        name="firstName"
        value={formik.values.firstName}
        onChange={formik.handleChange}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
      />
      <Input
        label="Last name"
        type="text"
        placholder="Enter last name"
        id="lastName"
        name="lastName"
        value={formik.values.lastName}
        onChange={formik.handleChange}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
      />
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
        label="Username"
        type="text"
        placholder="Choose a username"
        id="username"
        name="username"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
      />
    </>
  );
};

export default GetStarted;
