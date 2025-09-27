/** @format */

import * as React from 'react';

import { Category } from '@containers';

const CategoryScreen = ({ navigation, route }) => {
  // Get brand data from navigation params
  const brand = route?.params?.brand;
  const title = route?.params?.title;
  
  return (
    <Category
      brand={brand}
      title={title}
      onViewProductScreen={item => {
        navigation.navigate('DetailScreen', item);
      }}
    />
  );
};

export default CategoryScreen;
