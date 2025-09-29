/** @format */

import * as React from 'react';
import {useEffect, useMemo, useCallback, useState} from 'react';
import {View, RefreshControl, AppState} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {isEmpty} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {initializeCache} from '@utils/CacheManager';

import {Constants, withTheme} from '@common';
import {ROUTER} from '@navigation/constants';
import {HorizonList, ModalLayout, PostList, BannerPostsSlider, CustomerSummary, AnnouncementTicker, ApiCategories, BrandFeature, TopHeader} from '@components';
import {Config} from '@common';
import * as CountryRedux from '@redux/CountryRedux';
import * as CategoryRedux from '@redux/CategoryRedux';

import styles from './styles';

const Home = React.memo(
  ({theme = {}, onViewProductScreen, showCategoriesScreen, onShowAll}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    
    // Debug log to check theme
    console.log('Home theme:', theme);
    console.log('Home background:', theme?.colors?.background);

    const isConnected = useSelector(state => state.netInfo.isConnected);
    const countryList = useSelector(state => state.countries.list);
    const layoutHome = useSelector(state => state.products.layoutHome);
    const language = useSelector(state => state.language);

    const fetchCategories = useCallback(() => {
      CategoryRedux.actions.fetchCategories(dispatch);
    }, [dispatch]);

    const fetchAllCountries = useCallback(() => {
      CountryRedux.actions.fetchAllCountries(dispatch);
    }, [dispatch]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        // Clear cache and refresh all data
        await initializeCache();
        
        // Fetch fresh data
        if (isConnected) {
          fetchCategories();
          fetchAllCountries();
        }
        
        console.log('Home data refreshed successfully');
      } catch (error) {
        console.error('Error refreshing home data:', error);
      } finally {
        setRefreshing(false);
      }
    }, [isConnected, fetchCategories, fetchAllCountries]);

    const setSelectedCategory = useCallback((category) => {
      CategoryRedux.actions.setSelectedCategory(dispatch, category);
    }, [dispatch]);

    const onViewCategory = useCallback((category) => {
      setSelectedCategory(category);
      navigation.navigate('CategoryScreen');
    }, [navigation, setSelectedCategory]);

    const isHorizontal = useMemo(
      () => layoutHome === Constants.Layout.horizon || layoutHome === 7,
      [layoutHome],
    );

    useEffect(() => {
      // Initialize cache management with error handling
      initializeCache().then((cacheRefreshed) => {
        if (cacheRefreshed) {
          console.log('Cache refreshed on app startup');
        }
      }).catch((error) => {
        console.warn('Cache initialization failed, continuing without cache management:', error);
      });

      if (isConnected) {
        if (!countryList || isEmpty(countryList)) {
          fetchCategories();
          fetchAllCountries();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, countryList]);

    // Background app state listener for auto-refresh
    useEffect(() => {
      const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
          console.log('App became active, refreshing data...');
          // Refresh data when app becomes active
          if (isConnected) {
            fetchCategories();
            fetchAllCountries();
          }
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        subscription?.remove();
      };
    }, [isConnected, fetchCategories, fetchAllCountries]);

    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme?.colors?.background || '#fff'}]} edges={['top']}>
        <TopHeader 
          onSearchPress={(searchText) => navigation.navigate(ROUTER.SEARCH, {searchText})}
          onNotificationPress={() => navigation.navigate('NotificationScreen')}
          onRefreshPress={onRefresh}
        />
        {isHorizontal && (
          <HorizonList
            navigation={navigation}
            language={language}
            onShowAll={onShowAll}
            onViewProductScreen={onViewProductScreen}
            showCategoriesScreen={showCategoriesScreen}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#e39c7a']} // Android
                tintColor="#e39c7a" // iOS
                title="Pull to refresh"
                titleColor="#666"
              />
            }
            listHeaderComponentExtra={() => (
              <>
                <BannerPostsSlider
                  endpoint={Config.WooCommerce.url.replace(/\/$/, '')}
                  onPressPost={post =>
                    navigation.navigate('NewsDetailScreen', {post})
                  }
                  style={{paddingTop: 0, marginTop: 0}}
                />
                <CustomerSummary />
                <AnnouncementTicker endpoint={Config.WooCommerce.url.replace(/\/$/, '')} />
                <ApiCategories
                  onShowAll={onShowAll}
                  style={{paddingBottom: 30, paddingLeft: 10, paddingRight: 10}}
                />
                <BannerPostsSlider
                  endpoint={Config.WooCommerce.url.replace(/\/$/, '')}
                  path={'/wp-json/wp/v2/banner?banner-type=378'}
                  query={'?_embed&per_page=3'}
                  onPressPost={post =>
                    navigation.navigate('NewsDetailScreen', {post})
                  }
                  transparent={true}
                />
              </>
            )}
          />
        )}

        {!isHorizontal && (
          <PostList
            navigation={navigation}
            parentLayout={layoutHome}
            onViewProductScreen={onViewProductScreen}
            listHeaderComponentExtra={() => (
              <>
                <BannerPostsSlider
                  endpoint={Config.WooCommerce.url.replace(/\/$/, '')}
                  onPressPost={post =>
                    navigation.navigate('NewsDetailScreen', {post})
                  }
                  style={{paddingTop: 0, marginTop: 0}}
                />
                <CustomerSummary />
                <AnnouncementTicker endpoint={Config.WooCommerce.url.replace(/\/$/, '')} />
                <ApiCategories
                  onShowAll={onShowAll}
                  style={{marginBottom: 30}}
                />
                <BannerPostsSlider
                  endpoint={Config.WooCommerce.url.replace(/\/$/, '')}
                  path={'/wp-json/wp/v2/banner?banner-type=378'}
                  query={'?_embed&per_page=3'}
                  onPressPost={post =>
                    navigation.navigate('NewsDetailScreen', {post})
                  }
                  transparent={true}
                />
              </>
            )}
          />
        )}
        <ModalLayout />
      </SafeAreaView>
    );
  },
);

export default withTheme(Home);
