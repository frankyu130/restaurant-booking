const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/restaurant-booking', {
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

// Sample restaurant data
const sampleRestaurants = [
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
  },
  {
    name: "Pizza Paradise",
    cuisine: "Italian",
    address: "890 Pizza Street, Westside",
    capacity: 55,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Dragon Palace",
    cuisine: "Chinese",
    address: "234 Fortune Road, Chinatown",
    capacity: 70,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  },
  {
    name: "Burger Barn",
    cuisine: "American",
    address: "567 Burger Boulevard, Northside",
    capacity: 65,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurant data');

    // Insert new data
    const result = await Restaurant.insertMany(sampleRestaurants);
    console.log(`Successfully inserted ${result.length} restaurants`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seeding function
seedDatabase(); 