const express = require('express');
const router  = express.Router();
const {
  saveLocation,
  getNearby,
} = require('../controller/locationController');

/**
 * POST /api/location
 * Save a detected location (latitude, longitude, address) to MongoDB.
 *
 * Body: { latitude: number, longitude: number, address?: string }
 */
router.post('/location', saveLocation);

/**
 * GET /api/location/nearby?lat=…&lng=…&radius=5000
 * Return locations within `radius` metres of the given coordinates.
 * Uses MongoDB $nearSphere geospatial operator (requires 2dsphere index).
 *
 * Example: GET /api/location/nearby?lat=26.8467&lng=80.9462&radius=5000
 */
router.get('/location/nearby', getNearby);

module.exports = router;
