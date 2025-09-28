/** @format */

import * as React from 'react';
import {useEffect, useMemo, useCallback} from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {isEmpty} from 'lodash';
import {useNavigation} from '@react-navigation/native';

import {Constants, withTheme} from '@common';
import {ROUTER} from '@navigation/constants';
import {HorizonList, ModalLayout, PostList, BannerPostsSlider, CustomerSummary, AnnouncementTicker, ApiCategories, BrandFeature, TopHeader} from '@components';
import {Config} from '@common';
import * as CountryRedux from '@redux/CountryRedux';
import * as CategoryRedux from '@redux/CategoryRedux';

import styles from './styles';

const Home = React.memo(
  ({background, onViewProductScreen, showCategoriesScreen, onShowAll}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

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
      if (isConnected) {
        if (!countryList || isEmpty(countryList)) {
          fetchCategories();
          fetchAllCountries();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, countryList]);

    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <TopHeader 
          onSearchPress={(searchText) => navigation.navigate(ROUTER.SEARCH, {searchText})}
          onNotificationPress={() => navigation.navigate('NotificationScreen')}
        />
        {isHorizontal && (
          <HorizonList
            navigation={navigation}
            language={language}
            onShowAll={onShowAll}
            onViewProductScreen={onViewProductScreen}
            showCategoriesScreen={showCategoriesScreen}
            listHeaderComponentExtra={() => (
              <>
                <BannerPostsSlider
                  endpoint={Config.WooCommerce.url.replace(/\/$/, '')}
                  onPressPost={post =>
                    navigation.navigate('NewsDetailScreen', {post})
                  }
                  style={{paddingTop: 10, marginTop: -10}}
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
                  style={{paddingTop: 10, marginTop: -10}}
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
