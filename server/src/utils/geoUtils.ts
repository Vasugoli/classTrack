/**
 * Geo utility functions for location validation and distance calculation
 * Used for geo-locking attendance to campus boundaries
 */

export interface Location {
	latitude: number;
	longitude: number;
}

export interface GeoConfig {
	campusLatitude: number;
	campusLongitude: number;
	campusRadius: number; // in meters
}

/**
 * Calculates the distance between two geographic points using the Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(point1: Location, point2: Location): number {
	const R = 6371000; // Earth's radius in meters
	const φ1 = (point1.latitude * Math.PI) / 180;
	const φ2 = (point2.latitude * Math.PI) / 180;
	const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
	const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
}

/**
 * Checks if a location is within the campus radius
 * Returns true if the location is within the allowed area
 */
export function isWithinCampus(userLocation: Location, geoConfig: GeoConfig): boolean {
	const campusLocation: Location = {
		latitude: geoConfig.campusLatitude,
		longitude: geoConfig.campusLongitude
	};

	const distance = calculateDistance(userLocation, campusLocation);
	return distance <= geoConfig.campusRadius;
}

/**
 * Validates that latitude and longitude values are within valid ranges
 * Latitude: -90 to 90, Longitude: -180 to 180
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
	if (typeof latitude !== "number" || typeof longitude !== "number") {
		return false;
	}

	if (isNaN(latitude) || isNaN(longitude)) {
		return false;
	}

	if (latitude < -90 || latitude > 90) {
		return false;
	}

	if (longitude < -180 || longitude > 180) {
		return false;
	}

	return true;
}

/**
 * Sanitizes and validates location input from client
 * Returns null if invalid, otherwise returns sanitized location
 */
export function sanitizeLocation(lat: any, lng: any): Location | null {
	// Convert to numbers if they're strings
	const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
	const longitude = typeof lng === "string" ? parseFloat(lng) : lng;

	if (!validateCoordinates(latitude, longitude)) {
		return null;
	}

	return {
		latitude: Number(latitude.toFixed(8)), // Limit precision to ~1cm accuracy
		longitude: Number(longitude.toFixed(8))
	};
}

/**
 * Gets geo configuration from environment variables
 * Throws error if required variables are missing or invalid
 */
export function getGeoConfig(): GeoConfig {
	const campusLat = process.env.CAMPUS_LAT;
	const campusLon = process.env.CAMPUS_LON;
	const campusRadius = process.env.CAMPUS_RADIUS;

	if (!campusLat || !campusLon || !campusRadius) {
		throw new Error("Missing required geo configuration in environment variables");
	}

	const latitude = parseFloat(campusLat);
	const longitude = parseFloat(campusLon);
	const radius = parseFloat(campusRadius);

	if (!validateCoordinates(latitude, longitude)) {
		throw new Error("Invalid campus coordinates in environment variables");
	}

	if (isNaN(radius) || radius <= 0) {
		throw new Error("Invalid campus radius in environment variables");
	}

	return {
		campusLatitude: latitude,
		campusLongitude: longitude,
		campusRadius: radius
	};
}

/**
 * Formats location for logging purposes
 * Includes distance from campus for debugging
 */
export function formatLocationForLog(
	userLocation: Location,
	geoConfig: GeoConfig
): string {
	const campusLocation: Location = {
		latitude: geoConfig.campusLatitude,
		longitude: geoConfig.campusLongitude
	};

	const distance = calculateDistance(userLocation, campusLocation);
	const withinCampus = distance <= geoConfig.campusRadius;

	return `lat:${userLocation.latitude.toFixed(6)},lng:${userLocation.longitude.toFixed(6)},dist:${Math.round(distance)}m,valid:${withinCampus}`;
}

/**
 * Estimates location accuracy based on the precision of coordinates
 * Returns estimated accuracy in meters
 */
export function estimateLocationAccuracy(location: Location): number {
	// Calculate precision based on decimal places
	const latDecimals = (location.latitude.toString().split('.')[1] || '').length;
	const lngDecimals = (location.longitude.toString().split('.')[1] || '').length;

	// Use the lower precision (fewer decimal places)
	const minDecimals = Math.min(latDecimals, lngDecimals);

	// Rough estimation: each decimal place represents ~11m at equator for latitude
	// This is a simplified calculation
	const accuracyEstimate = Math.pow(10, 5 - minDecimals) * 1.11; // meters

	return Math.max(1, accuracyEstimate); // At least 1 meter accuracy
}