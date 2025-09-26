import React, { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// Center the grid properly with equal margins
const horizontalPadding = 16;
const gap = 12;
const columns = 5;
const totalGapWidth = gap * (columns - 1);
const availableWidth = width - (horizontalPadding * 2);
const widthItem = (availableWidth - totalGapWidth) / columns;

export default StyleSheet.create({
  item: {
    width: widthItem,
    marginTop: 14,
    marginRight: gap,
    alignItems: 'center',
  },
  itemLast: {
    width: widthItem,
    marginTop: 14,
    marginRight: 0, // No right margin for last item in each row
    alignItems: 'center',
  },
  image: {
    width: widthItem,
    height: widthItem,
    borderRadius: 16,
  },
  name: {
    marginTop: 8,
    color: '#333',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 10,
    paddingHorizontal: horizontalPadding,
  },
  content: {
    alignItems: 'center',
  },
  wrap: {
    alignItems: 'center',
  },
});
