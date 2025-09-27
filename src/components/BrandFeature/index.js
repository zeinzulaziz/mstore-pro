/** @format */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoplayTimer = useRef(null);

  const {
    theme: {
      colors: {text},
    },
  } = props;

  const brands = useSelector(state => state.brands.list);
  const isFetching = useSelector(state => state.brands.isFetching);
  const brandsError = useSelector(state => state.brands.error);

  useEffect(() => {
    console.log('BrandFeature useEffect - brands:', brands?.length, 'loading:', loading, 'isFetching:', isFetching);
    
    // Force refresh brands data to get latest images
    setLoading(true);
    console.log('🔄 Force refreshing brands data...');
    BrandsRedux.actions.fetchBrands()(dispatch).finally(() => {
      setLoading(false);
      console.log('Brands fetch completed');
    });
  }, [dispatch]);

  // Start autoplay when brands are loaded
  useEffect(() => {
    if (brands && brands.length > 0) {
      startAutoplay();
    }
    
    return () => {
      stopAutoplay();
    };
  }, [brands]);

  const onPressBrand = brand => {
    // Navigate to brand products or brand detail
    navigation.navigate('CategoryScreen', {
      brand: brand,
      title: brand.name,
    });
  };

  // Autoplay function
  const startAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
    }
    
    autoplayTimer.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % brands.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  const renderBrandItem = ({item, index}) => {
    console.log('Brand item:', JSON.stringify(item, null, 2));
    
    // Use item.image?.src directly as suggested
    let brandImage = item.image?.src;
    
    // Convert HTTP to HTTPS for security
    if (brandImage && brandImage.startsWith('http://')) {
      brandImage = brandImage.replace('http://', 'https://');
      console.log('Converted HTTP to HTTPS:', brandImage);
    }
    
    console.log('Brand image URL:', brandImage);
    console.log('Brand image is truthy:', !!brandImage);
    console.log('Brand image type:', typeof brandImage);
    console.log('Brand image starts with https:', brandImage?.startsWith('https://'));
    console.log('Brand image starts with http:', brandImage?.startsWith('http://'));
    
    const isLastItem = index === brands.length - 1;

    return (
      <TouchableOpacity
        style={[styles.brandItem, isLastItem && styles.lastBrandItem]}
        onPress={() => onPressBrand(item)}
        activeOpacity={0.8}>
        <View style={styles.brandImageContainer}>
          {brandImage ? (
            <Image
              source={{uri: brandImage}}
              style={styles.brandImage}
              resizeMode="contain"
              onLoad={() => {
                console.log('Brand image loaded successfully:', item.name, brandImage);
              }}
              onError={(error) => {
                console.log('Brand image failed to load:', item.name, 'URL:', brandImage, 'Error:', error.nativeEvent);
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

  const renderProgressDots = () => {
    if (!brands || brands.length <= 1) return null;
    
    return (
      <View style={styles.progressDotsContainer}>
        {brands.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentIndex ? '#a96b4f' : '#e0e0e0',
                opacity: index === currentIndex ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Debug logging
  console.log('BrandFeature render - brands:', brands?.length, 'loading:', loading, 'isFetching:', isFetching, 'error:', brandsError);

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

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        ref={flatListRef}
        data={brands} // Show all brands
        renderItem={renderBrandItem}
        keyExtractor={(item, index) => `brand_${item.id || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onScrollBeginDrag={stopAutoplay} // Stop autoplay when user scrolls
        onScrollEndDrag={startAutoplay} // Resume autoplay when user stops scrolling
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width * 0.8));
          setCurrentIndex(newIndex);
        }}
        getItemLayout={(data, index) => ({
          length: width * 0.8,
          offset: width * 0.8 * index,
          index,
        })}
        initialScrollIndex={0}
      />
      {renderProgressDots()}
    </View>
  );
});

export default withTheme(BrandFeature);
