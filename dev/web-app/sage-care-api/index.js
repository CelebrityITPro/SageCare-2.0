const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const doctorRoute = require("./routes/doctor");
const appointmentRoute = require("./routes/appointment");
const nutritionRoute = require("./routes/nutrition");

dotenv.config();

// Debug environment variables
console.log("=== Environment Variables Debug ===");
console.log("DB_CONNECTION_URL exists:", !!process.env.DB_CONNECTION_URL);
console.log("PORT exists:", !!process.env.PORT);
console.log("PW_ENCRYPT_KEY exists:", !!process.env.PW_ENCRYPT_KEY);
console.log("JWT_SECRET_KEY exists:", !!process.env.JWT_SECRET_KEY);
console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("=== End Debug ===");

const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "User-Agent",
    "Content-Encoding",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors());
app.options("*", cors());

mongoose
  .connect(process.env.DB_CONNECTION_URL)
  .then((value) => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    throw Error(err);
  });

app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/users", userRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/nutrition", nutritionRoute);
app.use("/uploads", express.static("uploads"));
// app.use("/api/cart", cartRoute);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Backend server running on port: ${port}`);
});
