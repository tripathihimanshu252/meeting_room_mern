const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
  },
  date: { 
    type: String, 
    required: true // Format: YYYY-MM-DD
  },
  slot: { 
    type: String, 
    required: true // e.g., "09:00", "09:30", "10:00"
  },
  bookingGroupId: { 
    type: String, 
    required: true // Jab user ek sath 2-3 consecutive slots book karega, toh unki group ID same hogi
  },
  bookedBy: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  title: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled-refundable', 'cancelled-non-refundable'], 
    default: 'confirmed' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// CRITICAL: Yeh index double-booking ko database level par hi block kar dega!
bookingSchema.index({ room: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);