import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const MAPS_API_KEY = (process.env.MAPS_API_KEY || '').trim();

// 5-minute in-memory cache to minimize Google API latency and cost
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(lat, lng, radius, keyword) {
  const roundedLat = Number(lat).toFixed(3);
  const roundedLng = Number(lng).toFixed(3);
  return `${roundedLat}_${roundedLng}_${radius}_${keyword || 'all'}`;
}

// Emergency national and state fallback helplines if no local phone number is found
const DEFAULT_EMERGENCY_PHONE = '108';

// Fallback emergency hospitals if Google API is unavailable
const FALLBACK_HOSPITALS = [
  {
    id: 'fb-1',
    name: 'City Care Emergency Hospital',
    type: 'Multi-Speciality Hospital',
    phone: '011-2323-4000',
    emergencyPhone: '108',
    address: 'Central Health District, Main Boulevard',
    lat: 28.6139,
    lng: 77.2090,
    rating: 4.6,
    userRatingsTotal: 340,
    isOpenNow: true,
    distanceText: '1.8 km',
    distanceValue: 1800,
    durationText: '5 mins',
    durationValue: 300,
    is24Hours: true,
  },
  {
    id: 'fb-2',
    name: 'Metro Trauma & Acute Care Centre',
    type: 'Trauma Centre',
    phone: '011-2659-3333',
    emergencyPhone: '102',
    address: 'Ring Road Medical Corridor',
    lat: 28.6200,
    lng: 77.2150,
    rating: 4.4,
    userRatingsTotal: 215,
    isOpenNow: true,
    distanceText: '2.5 km',
    distanceValue: 2500,
    durationText: '7 mins',
    durationValue: 420,
    is24Hours: true,
  },
  {
    id: 'fb-3',
    name: 'Apollo Lifeline Clinic & Emergency',
    type: 'Emergency Clinic',
    phone: '011-2987-1100',
    emergencyPhone: '112',
    address: 'Healthcare Plaza, 2nd Avenue',
    lat: 28.6080,
    lng: 77.2020,
    rating: 4.5,
    userRatingsTotal: 180,
    isOpenNow: true,
    distanceText: '3.2 km',
    distanceValue: 3200,
    durationText: '9 mins',
    durationValue: 540,
    is24Hours: true,
  }
];

/**
 * Calculates straight-line distance in km (Haversine formula)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetch top 5-10 nearest hospitals/clinics from Google Places and Distance Matrix APIs
 */
export async function getNearbyHospitals({
  lat = 28.6139,
  lng = 77.2090,
  radius = 5000,
  type = 'hospital',
  keyword = '',
  limit = 10,
}) {
  const cacheKey = getCacheKey(lat, lng, radius, keyword);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (!MAPS_API_KEY) {
    console.warn('[hospitalService] MAPS_API_KEY missing, using fallback data');
    return FALLBACK_HOSPITALS;
  }

  try {
    // 1. Google Places Nearby Search
    let placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${MAPS_API_KEY}`;
    if (keyword) {
      placesUrl += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    if (placesData.status !== 'OK' || !placesData.results || placesData.results.length === 0) {
      console.warn(`[hospitalService] Google Places status: ${placesData.status}`);
      if (placesData.error_message) console.warn(placesData.error_message);
      return FALLBACK_HOSPITALS;
    }

    // Take top results up to limit (5-10)
    const rawPlaces = placesData.results.slice(0, Math.min(limit, 10));

    // 2. Fetch Place Details in parallel to get direct phone numbers and full addresses
    const placeDetailPromises = rawPlaces.map(async (place) => {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,geometry,rating,user_ratings_total,opening_hours,types,business_status&key=${MAPS_API_KEY}`;
        const res = await fetch(detailsUrl);
        const data = await res.json();
        return data.result || {};
      } catch (err) {
        return {};
      }
    });

    const detailsList = await Promise.all(placeDetailPromises);

    // 3. Batch Call Distance Matrix API for exact travel time and driving distance
    const destinationCoords = rawPlaces
      .map((p) => `${p.geometry?.location?.lat},${p.geometry?.location?.lng}`)
      .join('|');

    const distUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${destinationCoords}&mode=driving&key=${MAPS_API_KEY}`;
    let distanceRows = [];
    try {
      const distRes = await fetch(distUrl);
      const distData = await distRes.json();
      if (distData.status === 'OK' && distData.rows?.[0]?.elements) {
        distanceRows = distData.rows[0].elements;
      }
    } catch (distErr) {
      console.warn('[hospitalService] Distance matrix failed, falling back to Haversine', distErr.message);
    }

    // 4. Assemble merged response
    const hospitals = rawPlaces.map((place, idx) => {
      const details = detailsList[idx] || {};
      const distInfo = distanceRows[idx] || {};

      const pLat = place.geometry?.location?.lat || details.geometry?.location?.lat;
      const pLng = place.geometry?.location?.lng || details.geometry?.location?.lng;

      // Fallback distance calculation if distance matrix element wasn't OK
      let distanceText = distInfo.distance?.text;
      let distanceValue = distInfo.distance?.value;
      let durationText = distInfo.duration?.text;
      let durationValue = distInfo.duration?.value;

      if (!distanceText && pLat && pLng) {
        const straightKm = haversineDistance(lat, lng, pLat, pLng);
        distanceText = `${straightKm.toFixed(1)} km`;
        distanceValue = Math.round(straightKm * 1000);
        // Estimate 25 km/h city driving speed
        const estMins = Math.max(3, Math.round((straightKm / 25) * 60));
        durationText = `${estMins} mins`;
        durationValue = estMins * 60;
      }

      const phone =
        details.formatted_phone_number ||
        details.international_phone_number ||
        DEFAULT_EMERGENCY_PHONE;

      const address =
        details.formatted_address ||
        place.vicinity ||
        'Address available on request';

      const isOpenNow =
        details.opening_hours?.open_now ??
        place.opening_hours?.open_now ??
        true;

      const rating = details.rating || place.rating || 4.2;
      const userRatingsTotal = details.user_ratings_total || place.user_ratings_total || 0;

      // Determine category (Clinic vs Hospital)
      const types = details.types || place.types || [];
      let category = 'Hospital';
      if (types.includes('clinic') || place.name.toLowerCase().includes('clinic')) {
        category = 'Clinic';
      } else if (place.name.toLowerCase().includes('trauma')) {
        category = 'Trauma Centre';
      } else if (place.name.toLowerCase().includes('eye')) {
        category = 'Eye Speciality';
      } else if (place.name.toLowerCase().includes('dental')) {
        category = 'Dental Care';
      }

      return {
        id: place.place_id,
        placeId: place.place_id,
        name: place.name,
        category,
        phone,
        hasDirectPhone: Boolean(details.formatted_phone_number || details.international_phone_number),
        emergencyPhone: '108',
        address,
        lat: pLat,
        lng: pLng,
        rating,
        userRatingsTotal,
        isOpenNow,
        distanceText: distanceText || 'Nearby',
        distanceValue: distanceValue || 0,
        durationText: durationText || 'Few mins',
        durationValue: durationValue || 0,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}&destination_place_id=${place.place_id}`,
      };
    });

    // Sort by shortest driving duration / distance
    hospitals.sort((a, b) => (a.durationValue || 0) - (b.durationValue || 0));

    cache.set(cacheKey, { timestamp: Date.now(), data: hospitals });
    return hospitals;
  } catch (error) {
    console.error('[hospitalService] Error fetching nearby hospitals:', error);
    return FALLBACK_HOSPITALS;
  }
}

export default {
  getNearbyHospitals,
};
