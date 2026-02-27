const mongoose = require('mongoose');

/**
 * Location Schema using GeoJSON "Point" format.
 *
 * MongoDB stores geospatial data as [longitude, latitude] (NOT lat/lng!).
 * The 2dsphere index enables efficient geospatial queries such as
 * $near, $geoWithin, $geoIntersects, etc.
 */
const locationSchema = new mongoose.Schema(
  {
    // GeoJSON Point object - standard format for geospatial data
    location: {
      type: {
        type: String,
        enum: ['Point'],      // Only 'Point' geometry is supported here
        default: 'Point',
        required: true,
      },
      // [longitude, latitude] – GeoJSON order (opposite of what most people expect!)
      coordinates: {
        type: [Number],       // [lng, lat]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return (
              lng >= -180 && lng <= 180 &&  // valid longitude range
              lat >= -90  && lat <= 90      // valid latitude range
            );
          },
          message: 'Coordinates must be a valid [longitude, latitude] pair',
        },
      },
    },

    // Human-readable address from Nominatim reverse geocoding
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },

    // Optional: link location to a user/contact submission
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // IP for basic analytics / deduplication
    ip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2dsphere index – REQUIRED for all MongoDB geospatial operators ($near, etc.)
// ─────────────────────────────────────────────────────────────────────────────
locationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
