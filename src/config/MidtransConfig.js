/** @format */

import Base64Helper from '../utils/Base64Helper';
import { getCurrentKeys, validateKeys } from './MidtransKeys';

// Midtrans Configuration
export const MIDTRANS_CONFIG = {
  // Sandbox Environment
  SANDBOX: {
    BASE_URL: 'https://app.sandbox.midtrans.com',
    SNAP_URL: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    SNAP_ENDPOINT: '/snap/v1/transactions', // Snap API endpoint yang benar
    ...getCurrentKeys()
  },
  
  // Production Environment
  PRODUCTION: {
    BASE_URL: 'https://api.midtrans.com',
    SNAP_URL: 'https://app.midtrans.com/snap/v2/vtweb',
    ...getCurrentKeys()
  },
  
  // Current Environment (change to 'production' for live)
  ENVIRONMENT: 'sandbox',
  
  // Payment Methods
  PAYMENT_METHODS: {
    QRIS: 'qris',
    BANK_TRANSFER: 'bank_transfer',
    GOPAY: 'gopay',
    SHOPEEPAY: 'shopeepay',
    CREDIT_CARD: 'credit_card',
  },
  
  // Banks for Bank Transfer
  BANKS: {
    BCA: 'bca',
    BNI: 'bni',
    BRI: 'bri',
    MANDIRI: 'mandiri',
    PERMATA: 'permata',
  },
  
  // Callback URLs
  CALLBACKS: {
    FINISH: 'https://your-app.com/finish',
    PENDING: 'https://your-app.com/pending',
    ERROR: 'https://your-app.com/error',
  },
};

// Get current configuration based on environment
export const getMidtransConfig = () => {
  return MIDTRANS_CONFIG.ENVIRONMENT === 'production' 
    ? MIDTRANS_CONFIG.PRODUCTION 
    : MIDTRANS_CONFIG.SANDBOX;
};

// Generate Authorization Header
export const getAuthHeader = () => {
  const config = getMidtransConfig();
  return Base64Helper.createMidtransAuth(config.SERVER_KEY);
};

// Generate Snap URL
export const getSnapUrl = (token) => {
  const config = getMidtransConfig();
  return `${config.SNAP_URL}/${token}`;
};
