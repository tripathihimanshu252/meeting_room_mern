const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true // e.g., "Ground Floor", "Room A"
  },
  capacity: { 
    type: Number, 
    required: true // e.g., 10, 15
  }
});

module.exports = mongoose.model('Room', roomSchema);