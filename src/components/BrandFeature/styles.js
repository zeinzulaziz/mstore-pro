/** @format */

import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const brandItemWidth = (width - 32 - 24) / 4; // 4 items per row with margins and padding

export default StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  brandsList: {
    paddingRight: 16,
  },
  brandItem: {
    width: brandItemWidth,
    alignItems: 'center',
    marginRight: 8,
  },
  lastBrandItem: {
    marginRight: 0,
  },
  brandImageContainer: {
    width: brandItemWidth,
    height: brandItemWidth * 0.8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandImage: {
    width: brandItemWidth * 0.7,
    height: brandItemWidth * 0.7,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  brandCount: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
  },
  separator: {
    width: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  placeholderContainer: {
    width: brandItemWidth * 0.7,
    height: brandItemWidth * 0.7,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
