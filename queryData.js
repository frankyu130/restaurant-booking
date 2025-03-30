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

// Function to query and display restaurants
const queryRestaurants = async () => {
  try {
    // Query all restaurants
    console.log('\n=== All Restaurants ===');
    const allRestaurants = await Restaurant.find();
    allRestaurants.forEach(restaurant => {
      console.log(`\nName: ${restaurant.name}`);
      console.log(`Cuisine: ${restaurant.cuisine}`);
      console.log(`Address: ${restaurant.address}`);
      console.log(`Capacity: ${restaurant.capacity}`);
      console.log(`Rating: ${restaurant.rating}`);
    });

    // Query by cuisine
    console.log('\n=== Italian Restaurants ===');
    const italianRestaurants = await Restaurant.find({ cuisine: 'Italian' });
    italianRestaurants.forEach(restaurant => {
      console.log(`\nName: ${restaurant.name}`);
      console.log(`Address: ${restaurant.address}`);
    });

    // Query high-rated restaurants (rating >= 4.8)
    console.log('\n=== High-Rated Restaurants (Rating >= 4.8) ===');
    const highRatedRestaurants = await Restaurant.find({ rating: { $gte: 4.8 } });
    highRatedRestaurants.forEach(restaurant => {
      console.log(`\nName: ${restaurant.name}`);
      console.log(`Rating: ${restaurant.rating}`);
    });

    // Query by capacity range
    console.log('\n=== Large Restaurants (Capacity >= 60) ===');
    const largeRestaurants = await Restaurant.find({ capacity: { $gte: 60 } });
    largeRestaurants.forEach(restaurant => {
      console.log(`\nName: ${restaurant.name}`);
      console.log(`Capacity: ${restaurant.capacity}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error querying database:', error);
  }
};

// Run the query function
queryRestaurants(); 