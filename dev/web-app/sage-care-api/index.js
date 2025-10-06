const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const doctorRoute = require("./routes/doctor");
const appointmentRoute = require("./routes/appointment");
const nutritionRoute = require("./routes/nutrition");
const diagnosisHistoryRoute = require("./routes/diagnosis-history");
const http = require('http');
const { Server } = require('socket.io');

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
app.use("/api/diagnosis-history", diagnosisHistoryRoute);
app.use("/uploads", express.static("uploads"));
// app.use("/api/cart", cartRoute);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

// WebRTC signaling namespace
io.of('/signaling').on('connection', (socket) => {
  console.log('Signaling client connected:', socket.id);

  socket.on('join', ({ meetingId, name }) => {
    socket.join(meetingId);
    if (!rooms[meetingId]) rooms[meetingId] = {};
    rooms[meetingId][socket.id] = name || 'Anonymous';
    
    // Log the current state
    console.log(`Socket ${socket.id} joined room ${meetingId} as ${name}`);
    console.log(`Room ${meetingId} participants:`, Object.values(rooms[meetingId]));
    console.log(`Emitting participants list to room ${meetingId}:`, Object.values(rooms[meetingId]));
    
    // Broadcast updated participant list to ALL users in the room (including the new user)
    io.of('/signaling').to(meetingId).emit('participants', Object.values(rooms[meetingId]));
    
    // Also send the participants list directly to the new user to ensure they receive it
    socket.emit('participants', Object.values(rooms[meetingId]));
    
    // Notify others about the new user
    socket.to(meetingId).emit('notification', { type: 'join', name: rooms[meetingId][socket.id] });
  });

  socket.on('signal', ({ meetingId, data }) => {
    // Handle 'ready' signal specially
    if (data.type === 'ready') {
      // Notify the sender that they're ready to create offer
      socket.emit('ready');
    } else if (data.type === 'get-participants') {
      // Handle manual participants request
      if (rooms[meetingId]) {
        console.log(`Sending participants list to ${socket.id} for room ${meetingId}:`, Object.values(rooms[meetingId]));
        socket.emit('participants', Object.values(rooms[meetingId]));
      }
    } else {
      // Forward other signals to other participants
      socket.to(meetingId).emit('signal', data);
    }
  });

  socket.on('disconnecting', () => {
    for (const meetingId of socket.rooms) {
      if (rooms[meetingId] && rooms[meetingId][socket.id]) {
        const name = rooms[meetingId][socket.id];
        delete rooms[meetingId][socket.id];
        console.log(`Socket ${socket.id} (${name}) disconnecting from room ${meetingId}`);
        console.log(`Updated participants for room ${meetingId}:`, Object.values(rooms[meetingId]));
        io.of('/signaling').to(meetingId).emit('participants', Object.values(rooms[meetingId]));
        socket.to(meetingId).emit('notification', { type: 'leave', name });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Signaling client disconnected:', socket.id);
  });
});

const port = process.env.PORT;

server.listen(port, '0.0.0.0', () => {
  console.log(`Backend server (with signaling) running on port: ${port}`);
  console.log(`Server accessible from network at: http://0.0.0.0:${port}`);
});
