/** @format */

import { StyleSheet } from 'react-native';
import { Color, Fonts } from '@common';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Color.primary,
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  methodText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: Color.red,
  },
});

