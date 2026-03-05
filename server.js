const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
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

app.post('/api/deploy', async (req, res) => {
  try {
    const esbuild = require('esbuild');

    const workerEntryPoint = path.join(__dirname, 'worker', 'worker.js');
    const distDir = path.join(__dirname, 'dist');
    const outfile = path.join(distDir, 'worker.mjs');

    if (!fs.existsSync(workerEntryPoint)) {
      return res.status(500).json({
        success: false,
        error: 'Worker entry point not found at worker/worker.js'
      });
    }

    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const result = await esbuild.build({
      entryPoints: [workerEntryPoint],
      bundle: true,
      format: 'esm',
      outfile: outfile,
      target: 'esnext',
      minify: false,
      sourcemap: false,
      metafile: true,
    });

    const stats = fs.statSync(outfile);
    const bundleSizeKB = (stats.size / 1024).toFixed(2);
    const warnings = result.warnings.map(w => w.text);

    // Upload to Cloudflare Workers
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({
        success: false,
        error: 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env'
      });
    }

    const scriptName = 'restaurant-booking-app';
    const bundleContent = fs.readFileSync(outfile);

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
      main_module: 'worker.mjs',
      compatibility_date: '2025-09-15',
      compatibility_flags: ['nodejs_compat'],
      bindings: []
    })], { type: 'application/json' }));
    form.append('worker.mjs', new Blob([bundleContent], {
      type: 'application/javascript+module'
    }), 'worker.mjs');

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${apiToken}` },
        body: form
      }
    );

    const cfResult = await cfResponse.json();

    if (!cfResult.success) {
      return res.status(502).json({
        success: false,
        error: `Cloudflare upload failed: ${cfResult.errors.map(e => e.message).join(', ')}`,
        details: cfResult.errors
      });
    }

    // Enable the workers.dev subdomain route for this script
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/subdomain`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true })
      }
    );

    // Fetch the real account workers subdomain
    const subdomainRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
      { headers: { 'Authorization': `Bearer ${apiToken}` } }
    );
    const subdomainData = await subdomainRes.json();
    const subdomain = subdomainData.result?.subdomain || accountId.slice(0, 8);

    const workerUrl = `https://${scriptName}.${subdomain}.workers.dev`;

    res.json({
      success: true,
      bundleSizeKB: parseFloat(bundleSizeKB),
      warnings,
      workerUrl,
      scriptId: cfResult.result.id,
      message: `Deployed! Live at ${workerUrl}`
    });
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors || []
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeMockData();
}); 