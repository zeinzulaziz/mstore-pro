/** @format */

import {Config} from '@common';

const BASE_URL = 'https://doseofbeauty.id/wp-json/mytheme/v1';

export const CustomerPointsAPI = {
  /**
   * Get customer points by user ID
   * @param {string|number} userId - The user ID
   * @returns {Promise<Object>} Customer points data
   * API Response: {"user_id": 32, "points": 380}
   */
  getCustomerPoints: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const url = `${BASE_URL}/customer-points/${userId}`;
      console.log('🔄 Fetching customer points for user:', userId);
      console.log('📡 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Customer points fetched successfully:', data);
      
      return {
        success: true,
        data: data,
        userId: userId,
      };
    } catch (error) {
      console.error('❌ Error fetching customer points:', error);
      return {
        success: false,
        error: error.message,
        data: {
          points: 0,
          user_id: userId,
        },
      };
    }
  },

  /**
   * Get customer points with retry mechanism
   * @param {string|number} userId - The user ID
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @returns {Promise<Object>} Customer points data
   */
  getCustomerPointsWithRetry: async (userId, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} - Fetching customer points for user: ${userId}`);
        
        const result = await CustomerPointsAPI.getCustomerPoints(userId);
        
        if (result.success) {
          return result;
        }
        
        lastError = result.error;
        
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      } catch (error) {
        lastError = error.message;
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    console.error(`❌ All ${maxRetries} attempts failed. Last error:`, lastError);
    return {
      success: false,
      error: lastError,
      data: {
        points: 0,
        user_id: userId,
      },
    };
  },
};

export default CustomerPointsAPI;
