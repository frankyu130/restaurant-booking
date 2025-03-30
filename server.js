const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  address: String,
  capacity: Number,
  rating: Number,
  image: String
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  date: Date,
  time: String,
  numberOfGuests: Number,
  customerName: String,
  customerEmail: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// Mock data
const mockRestaurants = [
  {
    name: "La Bella Italia",
    cuisine: "Italian",
    address: "123 Main Street, Downtown",
    capacity: 50,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Sushi Master",
    cuisine: "Japanese",
    address: "456 Ocean Drive, Beachfront",
    capacity: 40,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Taco Fiesta",
    cuisine: "Mexican",
    address: "789 Spice Street, Old Town",
    capacity: 60,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "The Golden Fork",
    cuisine: "French",
    address: "321 Gourmet Avenue, Uptown",
    capacity: 30,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Spice Garden",
    cuisine: "Indian",
    address: "654 Curry Lane, Midtown",
    capacity: 45,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  }
];

// Initialize mock data
const initializeMockData = async () => {
  try {
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      await Restaurant.insertMany(mockRestaurants);
      console.log('Mock restaurants added successfully');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
};

// Routes
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeMockData();
}); 