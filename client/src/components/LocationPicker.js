import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaLocationArrow, FaSpinner, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { locationService } from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../styles/LocationPicker.css';

// ─────────────────────────────────────────────────────────────────────────────
// Fix Leaflet's default icon paths broken by Webpack/CRA bundling
// ─────────────────────────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// Custom pulsing marker icon for the user's detected position
const pulsingIcon = L.divIcon({
  className: 'lp-pulsing-marker',
  html: `
    <div class="lp-marker-outer">
      <div class="lp-marker-inner"></div>
    </div>
  `,
  iconSize:   [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fly the map to a new centre whenever coordinates change
// ─────────────────────────────────────────────────────────────────────────────
function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { duration: 1.4 });
    }
  }, [coords, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main LocationPicker component
//
// Props
//   value     {string}   – current address text (controlled by parent form)
//   onChange  {function} – called with the resolved address string
// ─────────────────────────────────────────────────────────────────────────────
const LocationPicker = ({ value, onChange }) => {
  const [coords,      setCoords]      = useState(null);   // { lat, lng }
  const [address,     setAddress]     = useState('');
  const [geoStatus,   setGeoStatus]   = useState('idle'); // idle | loading | success | denied | error
  const [geoError,    setGeoError]    = useState('');
  const [saveStatus,  setSaveStatus]  = useState('idle'); // idle | saving | saved | error
  const [manualMode,  setManualMode]  = useState(false);  // let user type their own address

  // ── Reverse-geocode with OpenStreetMap Nominatim ────────────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
        `&lat=${lat}&lon=${lng}&accept-language=en`;

      const res  = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();

      // Build a human-readable address from Nominatim response
      const p = data.address || {};
      const parts = [
        p.road || p.hamlet || p.village,
        p.suburb || p.neighbourhood,
        p.city || p.town || p.county,
        p.state,
        p.country,
        p.postcode,
      ].filter(Boolean);

      return parts.join(', ') || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      // Fallback: just return coordinates as string
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  // ── Save coordinates + address to backend (fire-and-forget) ────────────
  const saveToBackend = useCallback(async (lat, lng, resolvedAddress) => {
    setSaveStatus('saving');
    try {
      await locationService.saveLocation({
        latitude:  lat,
        longitude: lng,
        address:   resolvedAddress,
      });
      setSaveStatus('saved');
    } catch (err) {
      console.warn('[LocationPicker] backend save failed:', err);
      setSaveStatus('error');
    }
  }, []);

  // ── Main detect handler ─────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('loading');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({ lat, lng });

        // Reverse-geocode to get a human-readable address
        const resolved = await reverseGeocode(lat, lng);
        setAddress(resolved);
        onChange(resolved);      // update parent form field
        setGeoStatus('success');

        // Persist to MongoDB in the background
        saveToBackend(lat, lng, resolved);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus('denied');
          setGeoError(
            'Location permission was denied. Please enable it in your browser settings, ' +
            'or type your location manually below.'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoStatus('error');
          setGeoError('Location information is unavailable. Please try again or type manually.');
        } else {
          setGeoStatus('error');
          setGeoError('Location request timed out. Please try again or type manually.');
        }
        setManualMode(true); // fall back gracefully
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000, // accept a cached position up to 1 min old
      }
    );
  }, [reverseGeocode, saveToBackend, onChange]);

  // ── When value is cleared externally, reset internal state ─────────────
  useEffect(() => {
    if (!value) {
      setCoords(null);
      setAddress('');
      setGeoStatus('idle');
      setSaveStatus('idle');
      setManualMode(false);
    }
  }, [value]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="lp-wrapper">

      {/* ── Detect button / status bar ── */}
      <div className="lp-toolbar">
        <button
          type="button"
          className={`lp-detect-btn lp-detect-btn--${geoStatus}`}
          onClick={detectLocation}
          disabled={geoStatus === 'loading'}
          aria-label="Detect my location"
        >
          {geoStatus === 'loading' ? (
            <><FaSpinner className="lp-spin" /> Detecting…</>
          ) : (
            <><FaLocationArrow /> Auto-Detect Location</>
          )}
        </button>

        {geoStatus === 'success' && saveStatus === 'saved' && (
          <span className="lp-badge lp-badge--saved">
            <FaCheckCircle /> Saved
          </span>
        )}

        <button
          type="button"
          className="lp-manual-toggle"
          onClick={() => setManualMode(m => !m)}
          title="Type location manually"
        >
          {manualMode ? 'Hide manual input' : 'Type manually'}
        </button>
      </div>

      {/* ── Error / denied notice ── */}
      {(geoStatus === 'denied' || geoStatus === 'error') && geoError && (
        <div className="lp-notice lp-notice--error">
          <FaExclamationTriangle />
          <span>{geoError}</span>
        </div>
      )}

      {/* ── OpenStreetMap (shown once we have coordinates) ── */}
      {coords && (
        <div className="lp-map-container">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={16}
            scrollWheelZoom={false}
            className="lp-map"
            attributionControl={true}
          >
            {/* OpenStreetMap tile layer (free, no API key needed) */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            />

            {/* Fly to new coords when they change */}
            <MapFlyTo coords={coords} />

            {/* Marker at user's position */}
            <Marker position={[coords.lat, coords.lng]} icon={pulsingIcon}>
              <Popup className="lp-popup">
                <strong>Your Location</strong>
                <br />
                <small>{address || 'Resolving address…'}</small>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Address display below map */}
          <div className="lp-address-strip">
            <FaMapMarkerAlt className="lp-addr-icon" />
            <span className="lp-addr-text">
              {address || 'Fetching address…'}
            </span>
          </div>

          {/* Coordinates in small print */}
          <div className="lp-coords">
            Lat: {coords.lat.toFixed(6)} &nbsp;|&nbsp; Lng: {coords.lng.toFixed(6)}
          </div>
        </div>
      )}

      {/* ── Manual text input (fallback / override) ── */}
      {(manualMode || geoStatus === 'idle') && (
        <div className="lp-manual-input">
          <input
            type="text"
            className="lp-text-input"
            placeholder="Or type your city, state or full address…"
            value={value || ''}
            onChange={(e) => {
              setAddress(e.target.value);
              onChange(e.target.value);
            }}
            maxLength={200}
          />
          {geoStatus === 'idle' && (
            <p className="lp-hint">
              Click <strong>Auto-Detect Location</strong> above to fill this automatically.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
