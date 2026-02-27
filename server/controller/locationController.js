const Location = require('../model/locationSchema');

/**
 * POST /api/location
 *
 * Save a user's detected location (latitude, longitude, address) to MongoDB.
 * Coordinates are stored in GeoJSON [longitude, latitude] order.
 */
exports.saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    // ── Validate input ────────────────────────────────────────────
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude must be valid numbers',
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of valid range (lat: -90 to 90, lng: -180 to 180)',
      });
    }

    // ── Build GeoJSON document ─────────────────────────────────────
    const locationDoc = new Location({
      location: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON uses [longitude, latitude] order
      },
      address: typeof address === 'string' ? address.trim().slice(0, 500) : '',
      // Capture requester IP (works behind proxies with trust proxy enabled)
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
      // Link to logged-in user if JWT middleware attached req.user
      userId: req.user?._id || null,
    });

    const saved = await locationDoc.save();

    return res.status(201).json({
      success: true,
      message: 'Location saved successfully',
      data: {
        id:          saved._id,
        latitude:    lat,
        longitude:   lng,
        address:     saved.address,
        createdAt:   saved.createdAt,
      },
    });
  } catch (error) {
    console.error('[locationController] saveLocation error:', error);

    // Handle Mongoose validation errors gracefully
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving location',
    });
  }
};

/**
 * GET /api/location/nearby?lat=…&lng=…&radius=5000
 *
 * Example geospatial query – find all saved locations within a given
 * radius (metres) of the provided coordinates.
 *
 * MongoDB's $near operator requires the 2dsphere index on location.coordinates.
 *
 * Default radius: 5 000 m (5 km)
 */
exports.getNearby = async (req, res) => {
  try {
    const lat    = parseFloat(req.query.lat);
    const lng    = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius, 10) || 5000; // metres

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query params are required and must be numbers',
      });
    }

    // $nearSphere returns documents ordered by proximity (closest first)
    // maxDistance is in metres when using GeoJSON points
    const nearby = await Location.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // [longitude, latitude]
          },
          $maxDistance: radius, // metres
        },
      },
    })
      .select('address location createdAt') // only return what's needed
      .limit(50);

    return res.status(200).json({
      success: true,
      count:   nearby.length,
      radius,
      data:    nearby,
    });
  } catch (error) {
    console.error('[locationController] getNearby error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching nearby locations',
    });
  }
};
