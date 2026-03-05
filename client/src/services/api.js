import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = {
  // Get all restaurants
  getRestaurants: async () => {
    const response = await axios.get(`${API_URL}/restaurants`);
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await axios.post(`${API_URL}/bookings`, bookingData);
    return response.data;
  },

  // Trigger esbuild bundle for Cloudflare Workers deployment
  deployWorker: async () => {
    const response = await axios.post(`${API_URL}/deploy`);
    return response.data;
  }
};

export default api; 