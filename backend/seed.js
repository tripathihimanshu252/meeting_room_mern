const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roomit';

const seedDatabase = async () => {
  try {
    // 1. Database se connect karo
    await mongoose.connect(MONGO_URI);
    console.log('Seed script: Connected to MongoDB.');

    // 2. Purana data saaf karo taaki duplicate na ho
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Old data cleared.');

    // 3. Default 4 Rooms ka data insert karo
    const rooms = await Room.insertMany([
      { name: 'Tesla Boardroom', location: '1st Floor, Wing A', capacity: 12 },
      { name: 'Einstein Lab', location: '2nd Floor, Wing B', capacity: 8 },
      { name: 'Ada Lovelace Room', location: 'Ground Floor', capacity: 4 },
      { name: 'Newton Discussion Room', location: '3rd Floor', capacity: 20 }
    ]);
    console.log('4 Rooms inserted successfully!');

    // 4. Kuch dummy bookings insert karo testing ke liye
    // Aaj ki date nikalte hain YYYY-MM-DD format me
    const today = new Date().toISOString().split('T')[0];

    await Booking.insertMany([
      {
        room: rooms[0]._id, // Tesla Boardroom
        date: today,
        slot: '09:00',
        bookingGroupId: 'group_seed_1',
        bookedBy: { name: 'Gaurav Kumar', email: 'gaurav@example.com' },
        title: 'Daily Standup Meeting',
        status: 'confirmed'
      },
      {
        room: rooms[0]._id,
        date: today,
        slot: '09:30',
        bookingGroupId: 'group_seed_1', // Same group ID matlab consecutive slot hai
        bookedBy: { name: 'Gaurav Kumar', email: 'gaurav@example.com' },
        title: 'Daily Standup Meeting',
        status: 'confirmed'
      },
      {
        room: rooms[1]._id, // Einstein Lab
        date: today,
        slot: '14:00',
        bookingGroupId: 'group_seed_2',
        bookedBy: { name: 'Muskan Kumari', email: 'muskan@example.com' },
        title: 'Project Architecture Review',
        status: 'confirmed'
      }
    ]);
    console.log('Dummy bookings inserted successfully!');

    // Connection close karo
    await mongoose.connection.close();
    console.log('Database seeding completed and connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();