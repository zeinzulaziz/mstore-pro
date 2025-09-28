/** @format */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {Config, Languages, withTheme} from '@common';
import {Tools} from '@common';
import * as BrandsRedux from '@redux/BrandsRedux';

import styles from './styles';

const {width} = Dimensions.get('window');

const BrandFeature = React.memo(props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const {
    theme: {
      colors: {text},
    },
  } = props;

  const brands = useSelector(state => state.brands.list);
  const isFetching = useSelector(state => state.brands.isFetching);
  const brandsError = useSelector(state => state.brands.error);

  // Show all brands without duplication
  const itemWidth = (width - 32 - 24) / 4; // Same as brandItemWidth in styles

  useEffect(() => {
    // console.log('BrandFeature useEffect - brands:', brands?.length, 'loading:', loading, 'isFetching:', isFetching);
    
    // Force refresh brands data to get latest images
    setLoading(true);
    // console.log('🔄 Force refreshing brands data...');
    BrandsRedux.actions.fetchBrands()(dispatch).finally(() => {
      setLoading(false);
    //   console.log('Brands fetch completed');
    });
  }, [dispatch]);

  // Auto-scroll disabled - manual scrolling only

  // Autoplay disabled - no automatic scrolling
  // useEffect(() => {
  //   if (brands && brands.length > 0) {
  //     startAutoplay();
  //   }
  //   
  //   return () => {
  //     stopAutoplay();
  //   };
  // }, [brands]);

  const onPressBrand = brand => {
    // Navigate to brand products or brand detail
    // console.log('Brand clicked:', brand.name, 'ID:', brand.id);
    // console.log('Full brand object:', JSON.stringify(brand, null, 2));
    navigation.navigate('CategoryScreen', {
      brand: brand,
      title: brand.name,
    });
  };

  // Auto-scroll functions removed - manual scrolling only

  const renderBrandItem = (item, index) => {
    // Use item.image?.src directly as suggested
    let brandImage = item.image?.src;
    
    // Convert HTTP to HTTPS for security
    if (brandImage && brandImage.startsWith('http://')) {
      brandImage = brandImage.replace('http://', 'https://');
    }

    return (
      <TouchableOpacity
        key={`brand_${item.id || index}`}
        style={styles.brandItem}
        onPress={() => onPressBrand(item)}
        activeOpacity={0.8}>
        <View style={styles.brandImageContainer}>
          {brandImage ? (
            <Image
              source={{uri: brandImage}}
              style={styles.brandImage}
              resizeMode="contain"
              onLoad={() => {
                // console.log('Brand image loaded successfully:', item.name, brandImage);
              }}
              onError={(error) => {
                // console.log('Brand image failed to load:', item.name, 'URL:', brandImage, 'Error:', error.nativeEvent);
              }}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.brandName, {color: text}]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.count && (
          <Text style={[styles.brandCount, {color: text}]}>
            {item.count} products
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, {color: text}]}>
        {Languages.BrandFeature || 'Featured Brands'}
      </Text>
      <Text style={[styles.subtitle, {color: text}]}>
        {Languages.BrandFeatureSubtitle || 'Discover our trusted brands'}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#a96b4f" />
      <Text style={[styles.loadingText, {color: text}]}>
        {Languages.Loading || 'Loading brands...'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, {color: text}]}>
        {brandsError ? `Error: ${brandsError}` : (Languages.NoBrands || 'No brands available')}
      </Text>
      {brandsError && (
        <Text style={[styles.emptyText, {color: text, marginTop: 8, fontSize: 12}]}>
          Check console for details
        </Text>
      )}
    </View>
  );

  // Progress dots removed - no longer needed

  // Debug logging
//   console.log('BrandFeature render - brands:', brands?.length, 'loading:', loading, 'isFetching:', isFetching, 'error:', brandsError);

  if (loading || isFetching) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderLoading()}
      </View>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmpty()}
      </View>
    );
  }

  // Scroll handlers removed - no auto-scroll needed

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsList}
      >
        {brands?.map((item, index) => renderBrandItem(item, index))}
      </ScrollView>
    </View>
  );
});

export default withTheme(BrandFeature);
