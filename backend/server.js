const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes Import
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON data parse karne ke liye zaroori hai

// Routes Middleware Link (Yahan dono routes link ho rahe hain)
app.use('/api', roomRoutes);    // Isse banega: /api/rooms aur /api/rooms/:id/availability
app.use('/api', bookingRoutes); // Isse banega: /api/bookings

// Test Route
app.get('/', (req, res) => {
  res.send('RoomIt Backend Server is Running Successfully! 🚀');
});

// Database Connection Setup
const PORT = process.env.PORT || 5000;

// 🔥 Bhai maine isme tumhara username (himanshu) aur password (My_Secret123) direct cluster string ke sath set kar diya hai
const MONGO_URI = 'mongodb+srv://himanshu:My_Secret123@cluster0.b7ipzgo.mongodb.net/roomit?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully! 🎉');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('Database Connection Error: ', err));