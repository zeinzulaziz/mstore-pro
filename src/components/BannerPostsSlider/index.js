/** @format */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity, Image, Dimensions, Animated, ActivityIndicator} from 'react-native';
import {withTheme, Tools, Constants, Images} from '@common';

const {width} = Dimensions.get('window');

const BannerPostsSlider = ({theme, onPressPost, endpoint, path = '/wp-json/wp/v2/banner?banner-type=377', query = '?_embed&per_page=3'}) => {
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
      const resp = await fetch(postsEndpoint);
      const json = await resp.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [postsEndpoint]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
    const keyId = item && item.id ? item.id : imageURL;
    const isLoaded = !!imageLoaded[keyId];
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPressPost && onPressPost(item)}
        style={{width, paddingHorizontal: 15}}>
        <View style={{width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', borderRadius: 15, overflow: 'hidden'}}>
          {!isLoaded && (
            <ActivityIndicator size="small" color="#666" />
          )}
          <Image
            source={{uri: imageURL}}
            onLoadStart={() => {
              if (!imageLoaded[keyId]) {
                setImageLoaded(prev => ({...prev, [keyId]: false}));
              }
            }}
            onLoadEnd={() => setImageLoaded(prev => ({...prev, [keyId]: true}))}
            style={{width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute', top: 0, left: 0, opacity: isLoaded ? 1 : 0}}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={{width, height: 200, paddingHorizontal: 10}}>
        <View style={{width: '100%', height: 200, borderRadius: 15, overflow: 'hidden'}}>
          <Image
            source={Images.PlaceHolder}
            style={{width: '100%', height: '100%', resizeMode: 'cover'}}
          />
        </View>
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
    <View>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it, idx) => `${it.id || idx}`}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(data, index) => ({length: width, offset: width * index, index})}
      />
      {renderDots()}
    </View>
  );
};

export default withTheme(BannerPostsSlider);


