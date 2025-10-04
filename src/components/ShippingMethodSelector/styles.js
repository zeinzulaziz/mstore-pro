import { StyleSheet } from 'react-native';
import { Color, Fonts } from '@common';

export default StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 8,
  },
  shippingMethodsList: {
    // Removed maxHeight to prevent VirtualizedList error
  },
  shippingMethodItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.border,
  },
  shippingMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierInfo: {
    flex: 1,
    marginRight: 8,
  },
  courierName: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
  },
  etd: {
    fontSize: 10,
    fontFamily: Fonts.regular,
  },
  description: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    lineHeight: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 6,
  },
  errorContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
});
