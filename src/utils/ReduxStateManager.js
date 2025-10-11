/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore} from 'redux-persist';

/**
 * Utility functions for managing Redux persisted state
 */

/**
 * Clear all persisted Redux state
 * This will force the app to start with fresh state
 */
export const clearPersistedState = async () => {
  try {
    console.log('🧹 Clearing persisted Redux state...');
    await AsyncStorage.removeItem('persist:root');
    console.log('✅ Persisted Redux state cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing persisted state:', error);
    return false;
  }
};

/**
 * Get the current persisted state for debugging
 */
export const getPersistedState = async () => {
  try {
    const state = await AsyncStorage.getItem('persist:root');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('❌ Error getting persisted state:', error);
    return null;
  }
};

/**
 * Check if there are any unexpected keys in the persisted state
 */
export const checkForUnexpectedKeys = async () => {
  try {
    const state = await getPersistedState();
    if (!state) return { hasUnexpectedKeys: false, unexpectedKeys: [] };
    
    const expectedKeys = [
      'app', 'categories', 'products', 'netInfo', 'toast', 'user', 'carts',
      'wishList', 'news', 'layouts', 'language', 'payments', 'countries',
      'currency', 'sideMenu', 'tags', 'addresses', 'brands', 'filters',
      'customerPoints', 'shipping'
    ];
    
    const unexpectedKeys = Object.keys(state).filter(key => !expectedKeys.includes(key));
    
    return {
      hasUnexpectedKeys: unexpectedKeys.length > 0,
      unexpectedKeys
    };
  } catch (error) {
    console.error('❌ Error checking for unexpected keys:', error);
    return { hasUnexpectedKeys: false, unexpectedKeys: [] };
  }
};

/**
 * Auto-fix Redux state by clearing it if unexpected keys are found
 * This should be called during app initialization
 */
export const autoFixReduxState = async () => {
  try {
    const { hasUnexpectedKeys, unexpectedKeys } = await checkForUnexpectedKeys();
    
    if (hasUnexpectedKeys) {
      console.log('🔧 Found unexpected keys in Redux state:', unexpectedKeys);
      console.log('🧹 Clearing persisted state to fix the issue...');
      
      const cleared = await clearPersistedState();
      if (cleared) {
        console.log('✅ Redux state has been cleared and will be recreated on next app start');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error in auto-fix Redux state:', error);
    return false;
  }
};
