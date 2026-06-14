const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings - Nayi booking create karne ke liye (Quota + Concurrency + Fallback Safe)
router.post('/bookings', async (req, res) => {
  const { room, date, slots, bookedBy, title } = req.body;

  if (!room || !date || !slots || !slots.length || !bookedBy || !title) {
    return res.status(400).json({ error: "Saari fields dena zaroori hai." });
  }

  try {
    // -------------------------------------------------------------
    // FEATURE 1: PER-USER DAILY BOOKING QUOTA CHECK (Max 4 Hours / 8 Slots)
    // -------------------------------------------------------------
    const existingBookingsCount = await Booking.countDocuments({
      "bookedBy.email": bookedBy.email,
      date: date,
      status: 'confirmed'
    });

    const requestedSlotsCount = slots.length;
    const totalSlots = existingBookingsCount + requestedSlotsCount;

    if (totalSlots > 8) {
      return res.status(400).json({ 
        error: `Quota Exceeded! Aap is din max 4 ghante book kar sakte hain. Aapne already ${(existingBookingsCount * 30) / 60} ghante book kiye hain.` 
      });
    }

    // -------------------------------------------------------------
    // FEATURE 2: DOUBLE-BOOKING PRE-CHECK (Concurrency Check)
    // -------------------------------------------------------------
    const conflictingBookings = await Booking.find({
      room,
      date,
      slot: { $in: slots },
      status: 'confirmed'
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({ error: "Double-booking detected! Inme se koi slot already booked hai." });
    }

    // Unique Group ID for consecutive slots
    const bookingGroupId = Math.random().toString(36).substring(2, 11);
    const bookingDocs = [];

    for (let slot of slots) {
      bookingDocs.push({
        room,
        date,
        slot,
        bookingGroupId,
        bookedBy,
        title,
        status: 'confirmed'
      });
    }

    // Bulk insert documents
    await Booking.insertMany(bookingDocs);

    return res.status(201).json({ message: "Booking successful!", bookingGroupId });

  } catch (error) {
    // Catch Unique Index Violation (Duplicate Key Error 11000)
    if (error.code === 11000) {
      return res.status(409).json({ error: "Double-booking detected! Yeh slot already booked hai." });
    }

    console.error("Booking error:", error);
    return res.status(500).json({ error: "Server error, booking failed." });
  }
});

// GET /api/bookings - User ki saari bookings via Email lookup
router.get('/bookings', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email query parameter dena zaroori hai." });
    }

    const userBookings = await Booking.find({ "bookedBy.email": email })
      .populate('room')
      .sort({ date: -1, slot: 1 });

    res.status(200).json(userBookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ error: "Bookings fetch karne me dikkat aayi." });
  }
});

// PATCH /api/bookings/:groupId/cancel - Booking cancel karne ke liye Refund window logic
router.patch('/bookings/:groupId/cancel', async (req, res) => {
  const { groupId } = req.params;

  try {
    const allGroupBookings = await Booking.find({ bookingGroupId: groupId });
    
    if (!allGroupBookings || allGroupBookings.length === 0) {
      return res.status(404).json({ error: "Booking nahi mili." });
    }

    if (allGroupBookings[0].status.startsWith('cancelled')) {
      return res.status(400).json({ error: "Yeh booking pehle hi cancel ho chuki hai." });
    }

    const sortedBookings = allGroupBookings.sort((a, b) => a.slot.localeCompare(b.slot));
    const earliestBooking = sortedBookings[0];

    const now = new Date();
    const bookingStartTime = new Date(`${earliestBooking.date}T${earliestBooking.slot}:00`);

    const diffInMs = bookingStartTime - now;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    let finalStatus = 'cancelled-non-refundable';
    if (diffInHours >= 2) {
      finalStatus = 'cancelled-refundable';
    }

    await Booking.updateMany(
      { bookingGroupId: groupId },
      { $set: { status: finalStatus } }
    );

    return res.status(200).json({ 
      message: `Booking successfully cancel ho gayi.`, 
      status: finalStatus 
    });

  } catch (error) {
    console.error("Cancellation error:", error);
    return res.status(500).json({ error: "Server error, cancellation failed." });
  }
});

module.exports = router;