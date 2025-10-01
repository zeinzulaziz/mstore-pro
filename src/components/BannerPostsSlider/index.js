/** @format */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity, Image, Dimensions, Animated, ActivityIndicator, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {withTheme, Tools, Constants, Images} from '@common';
import {BannerSkeleton} from '../SkeletonLoader';
import {retryApiCall, isNetworkError} from '../../utils/apiRetry';

const {width} = Dimensions.get('window');

// Separate component for banner item to use hooks
const BannerItem = ({item, onPressPost, imageURL, showPartialNext = false}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const itemWidth = showPartialNext ? width * 0.75 : width;
  const skeletonWidth = showPartialNext ? width * 0.75 - 30 : width - 30;
  const itemHeight = (itemWidth - 30) * (2 / 3); // Aspect ratio 6:19
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPressPost && onPressPost(item)}
      style={{width: itemWidth, paddingHorizontal: 15}}>
      <View style={{width: '100%', height: itemHeight, justifyContent: 'center', alignItems: 'center', borderRadius: 15, overflow: 'hidden'}}>
        {imageLoading && !imageError && (
          <BannerSkeleton 
            width={skeletonWidth} 
            height={itemHeight} 
            style={{position: 'absolute', top: 0, left: 0}}
          />
        )}
        <Image
          source={{uri: imageURL}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

// Banner gradient styles - using explicit width/height like CSS background-size
const bannerGradientBackground = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 140, // Explicit height (200px - 60px = 140px)
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  overflow: 'hidden',
  zIndex: -1,
};
const bannerRadialBase = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 140, // Same height as container
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  overflow: 'hidden',
};
const bannerRadialGradient1 = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 140, // Same height as container
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  overflow: 'hidden',
};
const bannerRadialGradient2 = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 140, // Same height as container
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  overflow: 'hidden',
};
const bannerRadialGradient3 = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 140, // Same height as container
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  overflow: 'hidden',
};

const BannerPostsSlider = ({theme, onPressPost, endpoint, path = '/wp-json/wp/v2/banner?banner-type=377', query = '?_embed&per_page=3', style, transparent = false, justCameOnline = false, showPartialNext = false}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const listRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalMs = 4000;

  const postsEndpoint = useMemo(() => {
    const base = endpoint.replace(/\/$/, '');
    const joiner = path.indexOf('?') >= 0 ? (query.startsWith('&') ? '' : '&') : (query.startsWith('?') ? '' : '?');
    return `${base}${path}${joiner}${query.replace(/^\?/, '').replace(/^&/, '')}`;
  }, [endpoint, path, query]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching banner posts...');
      
      const data = await retryApiCall(
        async () => {
          const resp = await fetch(postsEndpoint);
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
          }
          const json = await resp.json();
          return Array.isArray(json) ? json : [];
        },
        3, // max retries
        1000 // initial delay
      );
      
      setItems(data);
      console.log('✅ Banner posts fetched successfully');
    } catch (error) {
      console.log('❌ Error fetching banner posts:', error.message);
      if (isNetworkError(error)) {
        console.log('🌐 Network error detected, will retry when connection is restored');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [postsEndpoint]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto-refresh when internet comes back
  useEffect(() => {
    if (justCameOnline) {
      console.log('BannerPostsSlider: Internet came back, refreshing...');
      // Clear image cache and reset loading states
      setImageLoaded({});
      fetchPosts();
    }
  }, [justCameOnline, fetchPosts]);

  // autoplay and progress bar animation
  useEffect(() => {
    if (!items || items.length === 0) return;

    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: intervalMs,
      useNativeDriver: false,
    });

    const startAnim = () => {
      anim.start(({finished}) => {
        if (!finished) return;
        const next = (currentIndex + 1) % items.length;
        if (listRef.current) {
          try {
            listRef.current.scrollToIndex({index: next, animated: true});
          } catch (e) {}
        }
        setCurrentIndex(next);
      });
    };

    startAnim();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, items]);

  const getFeaturedImage = post => {
    // 1) Try _embedded featured media
    try {
      const media =
        post && post._embedded && post._embedded['wp:featuredmedia']
          ? post._embedded['wp:featuredmedia'][0]
          : null;
      if (media) {
        // Prefer large or medium_large if available
        const sizes = media.media_details && media.media_details.sizes;
        if (sizes) {
          if (sizes[Constants.PostImage.large])
            return sizes[Constants.PostImage.large].source_url;
          if (sizes[Constants.PostImage.medium_large])
            return sizes[Constants.PostImage.medium_large].source_url;
          if (sizes[Constants.PostImage.medium])
            return sizes[Constants.PostImage.medium].source_url;
        }
        if (media.source_url) return media.source_url;
      }
    } catch (e) {}

    // 2) Custom field sometimes returned by some setups
    if (post && post.image_feature) return post.image_feature;

    // 3) Fallback to existing helper (better_featured_image plugin)
    const fromTools = Tools.getImage(post, Constants.PostImage.large);
    if (fromTools && fromTools !== Images.PlaceHolderURL) return fromTools;

    return Images.PlaceHolderURL;
  };

  const renderItem = ({item}) => {
    const imageURL = getFeaturedImage(item);
    return (
      <BannerItem 
        item={item} 
        onPressPost={onPressPost} 
        imageURL={imageURL}
        showPartialNext={showPartialNext}
      />
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={[
        style, 
        {
          position: 'relative', 
          borderBottomLeftRadius: transparent ? 0 : 30, 
          borderBottomRightRadius: transparent ? 0 : 30, 
          overflow: 'hidden',
          paddingTop: Platform.OS === 'android' ? 50 : 80,
          marginTop: Platform.OS === 'android' ? -10 : 0,
          zIndex: 0,
        }
      ]}>
        <BannerSkeleton width={width} height={200} />
      </View>
    );
  }

  if (!items || items.length === 0) return null;

  const onScrollEnd = e => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  };

  const renderDots = () => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, paddingHorizontal: 10}}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#ccc', // Light gray background
          borderRadius: 15,
          paddingHorizontal: 8,
          paddingVertical: 6,
          alignItems: 'center',
        }}>
          {items.map((_, i) => {
            const widthInterpolate = progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            });
            const isActive = i === currentIndex;
            return (
              <View
                key={`dot-${i}`}
                style={{
                  width: 20,
                  height: 10,
                  marginHorizontal: 2,
                  borderRadius: 5,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                }}>
                {isActive ? (
                  <Animated.View
                    style={{
                      width: widthInterpolate,
                      height: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                    }}
                  />
                ) : (
                  <View style={{width: 0, height: 10}} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[
      style, 
      {
        position: 'relative', 
        borderBottomLeftRadius: transparent ? 0 : 30, 
        borderBottomRightRadius: transparent ? 0 : 30, 
        overflow: 'hidden',
        // Add padding top to account for absolute positioned TopHeader
        paddingTop: Platform.OS === 'android' ? 50 : 80,
        // Add negative margin to eliminate remaining space
        marginTop: Platform.OS === 'android' ? -15 : -5,
        zIndex: 0, // Lower than TopHeader
      }
    ]}>
      {/* Radial Gradient Background - only show if not transparent */}
      {!transparent && (
        <View style={bannerGradientBackground}>
          {/* Base color */}
          <View style={[bannerRadialBase, {backgroundColor: '#ffe9c5'}]} />
          
          {/* Radial gradient effect using multiple layers */}
          <LinearGradient
            colors={['#f08e4b', 'rgba(240, 142, 75, 0.3)', 'transparent']}
            start={{x: 0.3, y: 0.2}}
            end={{x: 0.8, y: 0.8}}
            style={bannerRadialGradient1}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255, 233, 197, 0.8)', '#ffe9c5']}
            start={{x: 0.1, y: 0.1}}
            end={{x: 0.6, y: 0.6}}
            style={bannerRadialGradient2}
          />
          <LinearGradient
            colors={['rgba(240, 142, 75, 0.6)', 'transparent', 'rgba(255, 233, 197, 0.4)']}
            start={{x: 0.4, y: 0.4}}
            end={{x: 1, y: 1}}
            style={bannerRadialGradient3}
          />
        </View>
      )}
      
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it, idx) => `${it.id || idx}`}
        renderItem={renderItem}
        horizontal
        pagingEnabled={!showPartialNext}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        snapToInterval={showPartialNext ? width * 0.75 : width}
        decelerationRate={showPartialNext ? "fast" : "normal"}
        snapToAlignment="start"
        contentContainerStyle={showPartialNext ? {paddingRight: width * 0.25} : {}}
        getItemLayout={(data, index) => {
          const itemLength = showPartialNext ? width * 0.75 : width;
          return {length: itemLength, offset: itemLength * index, index};
        }}
      />
      {renderDots()}
    </View>
  );
};

export default withTheme(BannerPostsSlider);


