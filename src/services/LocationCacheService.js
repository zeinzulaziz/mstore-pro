/**
 * Location Cache Service
 * Handles caching of location data (coordinates + address details)
 */

import { actions as AddressRedux } from '@redux/AddressRedux';

class LocationCacheService {
  
  /**
   * Cache location data with coordinates and address details
   * @param {Object} locationData - Location data to cache
   * @param {number} locationData.latitude - Latitude coordinate
   * @param {number} locationData.longitude - Longitude coordinate
   * @param {Object} locationData.address - Address details
   * @param {string} locationData.address.city - City name
   * @param {string} locationData.address.district - District name
   * @param {string} locationData.address.province - Province name
   * @param {string} locationData.address.postcode - Postal code
   * @param {string} locationData.address.formattedAddress - Full formatted address
   * @param {number} locationData.timestamp - Cache timestamp
   */
  static cacheLocationData(dispatch, locationData) {
    try {
      const cacheData = {
        ...locationData,
        timestamp: Date.now(),
        cached: true
      };
      
      console.log('🗄️ Caching location data:', JSON.stringify(cacheData, null, 2));
      
      AddressRedux.actions.cacheLocationData(dispatch, cacheData);
      
      return {
        success: true,
        message: 'Location data cached successfully'
      };
    } catch (error) {
      console.error('❌ Error caching location data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get cached location data
   * @param {Object} state - Redux state
   * @returns {Object|null} Cached location data or null
   */
  static getCachedLocation(state) {
    try {
      const cachedLocation = state.addresses?.cachedLocation;
      
      if (!cachedLocation) {
        console.log('📭 No cached location found');
        return null;
      }
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - cachedLocation.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (cacheAge > maxAge) {
        console.log('⏰ Cached location expired, age:', Math.round(cacheAge / (60 * 60 * 1000)), 'hours');
        return null;
      }
      
      console.log('✅ Using cached location data:', JSON.stringify(cachedLocation, null, 2));
      return cachedLocation;
    } catch (error) {
      console.error('❌ Error getting cached location:', error);
      return null;
    }
  }
  
  /**
   * Clear cached location data
   * @param {Function} dispatch - Redux dispatch function
   */
  static clearCachedLocation(dispatch) {
    try {
      console.log('🗑️ Clearing cached location data');
      AddressRedux.actions.cacheLocationData(dispatch, null);
      
      return {
        success: true,
        message: 'Cached location data cleared'
      };
    } catch (error) {
      console.error('❌ Error clearing cached location:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Check if location data is cached and valid
   * @param {Object} state - Redux state
   * @returns {boolean} True if valid cached location exists
   */
  static hasValidCachedLocation(state) {
    const cachedLocation = this.getCachedLocation(state);
    return cachedLocation !== null;
  }
  
  /**
   * Get cache info (age, validity, etc.)
   * @param {Object} state - Redux state
   * @returns {Object} Cache information
   */
  static getCacheInfo(state) {
    const cachedLocation = state.addresses?.cachedLocation;
    
    if (!cachedLocation) {
      return {
        exists: false,
        age: null,
        valid: false
      };
    }
    
    const age = Date.now() - cachedLocation.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const valid = age <= maxAge;
    
    return {
      exists: true,
      age: Math.round(age / (60 * 60 * 1000)), // Age in hours
      valid: valid,
      coordinates: {
        latitude: cachedLocation.latitude,
        longitude: cachedLocation.longitude
      },
      address: cachedLocation.address
    };
  }
}

export default LocationCacheService;
