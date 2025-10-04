/** @format */

import { encode, decode } from 'base-64';

/**
 * Base64 Helper for React Native
 * Provides base64 encoding/decoding functions that work in React Native
 */

export const Base64Helper = {
  /**
   * Encode string to base64
   * @param {string} str - String to encode
   * @returns {string} Base64 encoded string
   */
  encode: (str) => {
    try {
      return encode(str);
    } catch (error) {
      console.error('Base64 encode error:', error);
      return '';
    }
  },

  /**
   * Decode base64 string
   * @param {string} str - Base64 string to decode
   * @returns {string} Decoded string
   */
  decode: (str) => {
    try {
      return decode(str);
    } catch (error) {
      console.error('Base64 decode error:', error);
      return '';
    }
  },

  /**
   * Create Basic Auth header
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {string} Basic Auth header
   */
  createBasicAuth: (username, password) => {
    const authString = `${username}:${password}`;
    const encodedAuth = Base64Helper.encode(authString);
    return `Basic ${encodedAuth}`;
  },

  /**
   * Create Basic Auth header for Midtrans
   * @param {string} serverKey - Midtrans server key
   * @returns {string} Basic Auth header for Midtrans
   */
  createMidtransAuth: (serverKey) => {
    return Base64Helper.createBasicAuth(serverKey, '');
  }
};

export default Base64Helper;
