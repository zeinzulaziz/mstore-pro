/** @format */

/**
 * Midtrans API Keys Configuration
 * 
 * IMPORTANT: Replace these with your actual Midtrans keys
 * 
 * To get your Midtrans keys:
 * 1. Go to https://dashboard.midtrans.com/
 * 2. Sign up or login
 * 3. Go to Settings > Access Keys
 * 4. Copy your Server Key and Client Key
 * 5. Replace the values below
 */

export const MIDTRANS_KEYS = {
  // Sandbox Keys (for testing)
  SANDBOX: {
    SERVER_KEY: 'SB-Mid-server-2MQ1aJSUt06it3tg3Y9Kwfvsy', // Sandbox server key with SB- prefix
    CLIENT_KEY: 'SB-Mid-client-E9xRTz_mrBPlv57u', // Sandbox client key with SB- prefix
    MERCHANT_ID: 'G469854109', // Your Midtrans Merchant ID
  },
  
  // Production Keys (for live)
  PRODUCTION: {
    SERVER_KEY: 'VT-server-production-key', // Replace with your actual production server key
    CLIENT_KEY: 'VT-client-production-key', // Replace with your actual production client key
  }
};

/**
 * Get current keys based on environment
 */
export const getCurrentKeys = () => {
  const environment = __DEV__ ? 'SANDBOX' : 'PRODUCTION';
  return MIDTRANS_KEYS[environment];
};

/**
 * Validate if keys are properly configured
 */
export const validateKeys = () => {
  const keys = getCurrentKeys();
  
  if (keys.SERVER_KEY === 'VT-server-sandbox-key' || keys.SERVER_KEY === 'VT-server-production-key') {
    console.warn('⚠️  Using default Midtrans keys! Please replace with your actual keys.');
    return false;
  }
  
  if (!keys.SERVER_KEY.startsWith('SB-Mid-server') && !keys.SERVER_KEY.startsWith('Mid-server')) {
    console.error('❌ Invalid server key format! Should start with "SB-Mid-server" or "Mid-server"');
    return false;
  }
  
  if (!keys.CLIENT_KEY.startsWith('SB-Mid-client') && !keys.CLIENT_KEY.startsWith('Mid-client')) {
    console.error('❌ Invalid client key format! Should start with "SB-Mid-client" or "Mid-client"');
    return false;
  }
  
  console.log('✅ Midtrans keys validation passed');
  return true;
};

export default MIDTRANS_KEYS;
