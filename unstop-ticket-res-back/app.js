const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Seat = require('./models/seat');
const seatNumbers = require('./seatNumbers');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seatReservation', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    createInitialSeats(); // Create initial seat data
  })
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Create initial seat data
async function createInitialSeats() {
  try {
    await Seat.deleteMany(); // Clear existing seat data
    await Seat.create(seatNumbers); // Create new seat data

    console.log('Initial seat data created');
  } catch (error) {
    console.error('Error creating initial seat data:', error);
  }
}

// API endpoints
app.get('/api/seats', async (req, res, next) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ message: 'Failed to fetch seats' });
  }
});

app.post('/api/reservations', async (req, res, next) => {
  try {
    const { seatNumbers } = req.body;

    console.log('Requested Seat Numbers:', seatNumbers);

    if (!seatNumbers || seatNumbers.length === 0) {
      res.status(400).json({ message: 'No seat numbers provided' });
      return;
    }

    // Check if all requested seats are available
    const seats = await Seat.find({ number: { $in: seatNumbers }, available: true });

    console.log('Available Seats:', seats);

    if (seats.length !== seatNumbers.length) {
      res.status(400).json({ message: 'Insufficient seats available' });
    } else {
      // Update seats as reserved
      await Seat.updateMany({ number: { $in: seatNumbers } }, { available: false });

      res.json({ message: 'Seats reserved successfully' });
    }
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({ message: 'Failed to reserve seats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
