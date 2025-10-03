/** @format */

import { StyleSheet } from 'react-native';
import { Color, Fonts } from '@common';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Color.grey,
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
  },
  orderTotalLabel: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
  orderTotalAmount: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
    color: Color.primary,
  },
  paymentMethodsContainer: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 15,
  },
  paymentMethodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Color.border,
    overflow: 'hidden',
  },
  selectedPaymentMethod: {
    borderColor: Color.primary,
    borderWidth: 2,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  paymentMethodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 8,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    fontWeight: '500',
    marginBottom: 3,
  },
  paymentMethodDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Color.grey,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
  },
  paymentInfoContainer: {
    backgroundColor: Color.lightGrey,
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Color.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 15,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  proceedButton: {
    flex: 2,
    backgroundColor: Color.primary,
    borderRadius: 8,
    paddingVertical: 15,
  },
  disabledButton: {
    backgroundColor: Color.lightGrey,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
  },
});