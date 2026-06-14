const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// 1. GET /api/rooms - Saare rooms ki list nikalne ke liye
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Rooms fetch karne me dikkat aayi." });
  }
});

// 2. GET /api/rooms/:id/availability?date=YYYY-MM-DD - 30-min slots grid check karne ke liye
router.get('/rooms/:id/availability', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ error: "Date dena zaroori hai (date=YYYY-MM-DD)." });
    }

    // Database se us room aur us date ki saari active bookings nikal lo
    // 'confirmed' status check karne se cancelled slots automatic free dikhenge!
    const bookings = await Booking.find({
      room: roomId,
      date: date,
      status: 'confirmed'
    });

    // Ek set bana lo booked slots ka fast lookup ke liye (e.g., ["09:00", "09:30"])
    const bookedSlots = new Set(bookings.map(b => b.slot));

    // Subah 9 AM se Shaam 6 PM (18:00) tak ke saare 30-minute slots generate karo
    const allSlots = [];
    let startHour = 9;
    let startMinute = 0;

    while (startHour < 18) {
      const formattedHour = startHour.toString().padStart(2, '0');
      const formattedMinute = startMinute.toString().padStart(2, '0');
      const slotTime = `${formattedHour}:${formattedMinute}`;

      allSlots.push({
        slot: slotTime,
        isAvailable: !bookedSlots.has(slotTime) // Agar set me hai toh false (booked), nahi toh true (free)
      });

      // 30 minute aage badhao
      startMinute += 30;
      if (startMinute === 60) {
        startHour += 1;
        startMinute = 0;
      }
    }

    res.status(200).json({
      roomId,
      date,
      slots: allSlots
    });

  } catch (error) {
    res.status(500).json({ error: "Availability check karne me fail hua server." });
  }
});

module.exports = router;