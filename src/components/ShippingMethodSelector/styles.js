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
  // Dropdown Styles
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: Color.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLeft: {
    flex: 1,
    marginRight: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500',
    marginBottom: 2,
  },
  dropdownSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  dropdownRight: {
    alignItems: 'flex-end',
  },
  dropdownPrice: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 2,
  },
  dropdownArrow: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Color.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  modalContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  shippingMethodItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.border,
  },
  shippingMethodItemCompact: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Color.border,
  },
  shippingMethodContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  courierInfo: {
    flex: 1,
    marginRight: 8,
  },
  courierNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  courierName: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    flex: 1,
  },
  selectedIndicator: {
    backgroundColor: Color.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginTop: 2,
  },
  tierInfo: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  additionalInfo: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Color.grey,
    marginTop: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  featureTag: {
    backgroundColor: Color.lightBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 2,
  },
  featureText: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: Color.text,
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
