/** @format */

import React, {PureComponent} from 'react';
import {View, FlatList, Text, Image} from 'react-native';
import {connect} from 'react-redux';

import {toast} from '@app/Omni';
import {Languages, Images, withTheme, Config} from '@common';
import {TouchableScale} from '@components';
import CacheService from '@services/CacheService';
import {CategorySkeleton} from '../SkeletonLoader';

import styles from './styles';

// Function to decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
};

class ApiCategories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      homeCategories: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchHomeCategories();
  }

  componentDidUpdate(prevProps) {
    // Auto-refresh when internet comes back
    if (this.props.justCameOnline && !prevProps.justCameOnline) {
      console.log('ApiCategories: Internet came back, refreshing...');
      // Force refresh by clearing state first
      this.setState({homeCategories: [], loading: true});
      this.fetchHomeCategories();
    }
  }

  fetchHomeCategories = async () => {
    try {
      this.setState({loading: true});
      
      const base = Config.WooCommerce.url;
      // Cache both endpoints independently with 12h TTL
      const allCategories = await CacheService.fetchWithCache(
        'wc_all_categories_cache',
        `${base}/wp-json/wc/store/v1/products/categories`,
        { ttlMs: 12 * 60 * 60 * 1000 }
      ) || [];

      const selectedIds = await CacheService.fetchWithCache(
        'home_categories_ids_cache',
        `${base}/wp-json/mytheme/v1/home-categories`,
        { ttlMs: 12 * 60 * 60 * 1000 }
      ) || [];
      
      // console.log('All categories from WooCommerce:', allCategories.length);
      // console.log('Selected IDs from custom API:', selectedIds);
      
      // Filter kategori berdasarkan ID yang dipilih
      const homeCategories = allCategories.filter(cat =>
        selectedIds.some(selected => selected.id === cat.id)
      );
      
      // console.log('Filtered home categories:', homeCategories.length);
      // console.log('Home categories:', homeCategories.map(c => ({id: c.id, name: c.name})));
      
      this.setState({
        homeCategories: homeCategories,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching home categories:', error);
      this.setState({loading: false});
    }
  };

  render() {
    const {
      theme: {
        colors: {background},
      },
      style,
    } = this.props;

    const {homeCategories, loading} = this.state;

    if (loading) {
      return <CategorySkeleton />;
    }

    if (homeCategories.length === 0) {
      return (
        <View style={[styles.loadingContainer, {backgroundColor: background}]}>
          <Text>No categories available</Text>
        </View>
      );
    }

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={homeCategories}
        renderItem={this.renderItem}
        numColumns={5}
        style={style}
        contentContainerStyle={[styles.list, {backgroundColor: background}]}
      />
    );
  }

  renderItem = ({item, index}) => {
    const {homeCategories, loading} = this.state;
    
    const isLastInRow = (index + 1) % 5 === 0;
    const isLastRow = index >= Math.floor(homeCategories.length / 5) * 5;
    const itemStyle = isLastInRow ? styles.itemLast : styles.item;
    const wrapStyle = isLastRow ? styles.wrapLastRow : styles.wrap;
    
    return (
      <TouchableScale
        activeOpacity={0.9}
        style={itemStyle}
        onPress={() => this.showProductsByCategory(item)}>
        <View style={styles.imageContainer}>
          {loading ? (
            <CategorySkeleton size={60} />
          ) : item.image ? (
            <Image
              source={{uri: item.image.thumbnail || item.image.src}}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={Images.categoryPlaceholder}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.content}>
          <View style={wrapStyle}>
            <Text style={styles.name}>{decodeHtmlEntities(item.name)}</Text>
          </View>
        </View>
      </TouchableScale>
    );
  };

  showProductsByCategory = (category) => {
    const {
      onShowAll,
      fetchProductsByCollections,
      setSelectedCategory,
    } = this.props;
    
    console.log('Category clicked:', category);
    
    // Use the category directly since we already have the complete data
    const selectedCategory = category;
    
    // Set selected category in Redux (same as m-store does)
    setSelectedCategory({
      ...selectedCategory,
      mainCategory: selectedCategory,
    });
    
    // Fetch products for this category (same as m-store does)
    fetchProductsByCollections(category.id, null, 1, 0);
    
    // Navigate to show all products (same as m-store does)
    onShowAll({
      name: category.name,
      category: category.id,
      layout: 'twoColumn'
    }, 0);
  };

}

ApiCategories.defaultProps = {
  categories: [],
};

const mapStateToProps = state => {
  return {
    netInfo: state.netInfo,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {netInfo} = stateProps;
  const {dispatch} = dispatchProps;
  const {actions} = require('@redux/CategoryRedux');
  const LayoutRedux = require('@redux/LayoutRedux');
  
  return {
    ...ownProps,
    ...stateProps,
    setSelectedCategory: (category) => {
      actions.setSelectedCategory(dispatch, category);
    },
    fetchProductsByCollections: (categoryId, tagId, page = 1, idx) => {
      if (!netInfo.isConnected) return toast(Languages.noConnection);
      LayoutRedux.actions.fetchProductsLayoutTagId(
        dispatch,
        categoryId,
        tagId,
        page,
        idx,
      );
    },
  };
}

export default connect(
  mapStateToProps,
  undefined,
  mergeProps,
)(withTheme(ApiCategories));
