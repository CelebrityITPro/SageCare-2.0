const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const doctorRoute = require("./routes/doctor");

dotenv.config();
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
// app.use("/api/cart", cartRoute);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Backend server running on port: ${port}`);
});
