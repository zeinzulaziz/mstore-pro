#!/usr/bin/env node

/**
 * Script to clear Redux persisted state
 * Run this script if you encounter Redux state issues
 * 
 * Usage:
 * node clear-redux-state.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearReduxState() {
  try {
    console.log('🧹 Clearing Redux persisted state...');
    
    // Clear the persisted state
    await AsyncStorage.removeItem('persist:root');
    
    console.log('✅ Redux persisted state cleared successfully!');
    console.log('📱 The app will start with fresh state on next launch.');
    
  } catch (error) {
    console.error('❌ Error clearing Redux state:', error);
    process.exit(1);
  }
}

// Run the function
clearReduxState();
