/** @format */

import React, {PureComponent} from 'react';
import {View, FlatList, Image, Text} from 'react-native';
import {connect} from 'react-redux';

import {toast} from '@app/Omni';
import {Languages, Images, withTheme, Config} from '@common';
import {ImageCache, TouchableScale} from '@components';

import styles from './styles';

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

  fetchHomeCategories = async () => {
    try {
      this.setState({loading: true});
      
      // Ambil semua kategori dari WooCommerce Store API
      const res1 = await fetch(`${Config.WooCommerce.url}/wp-json/wc/store/v1/products/categories`);
      const allCategories = await res1.json();
      
      // Ambil daftar ID kategori yang dipilih dari API custom
      const res2 = await fetch(`${Config.WooCommerce.url}/wp-json/mytheme/v1/home-categories`);
      const selectedIds = await res2.json();
      
      console.log('All categories from WooCommerce:', allCategories.length);
      console.log('Selected IDs from custom API:', selectedIds);
      
      // Filter kategori berdasarkan ID yang dipilih
      const homeCategories = allCategories.filter(cat =>
        selectedIds.some(selected => selected.id === cat.id)
      );
      
      console.log('Filtered home categories:', homeCategories.length);
      console.log('Home categories:', homeCategories.map(c => ({id: c.id, name: c.name})));
      
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
      return (
        <View style={[styles.loadingContainer, {backgroundColor: background}]}>
          <Text>Loading categories...</Text>
        </View>
      );
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
    const {homeCategories} = this.state;
    
    const isLastInRow = (index + 1) % 5 === 0;
    const isLastRow = index >= Math.floor(homeCategories.length / 5) * 5;
    const itemStyle = isLastInRow ? styles.itemLast : styles.item;
    const wrapStyle = isLastRow ? styles.wrapLastRow : styles.wrap;
    
    return (
      <TouchableScale
        activeOpacity={0.9}
        style={itemStyle}
        onPress={() => this.showProductsByCategory(item)}>
        {item.image && <ImageCache uri={item.image.src} style={styles.image} />}
        {!item.image && (
          <Image source={Images.categoryPlaceholder} style={styles.image} />
        )}
        <View style={styles.content}>
          <View style={wrapStyle}>
            <Text style={styles.name}>{item.name}</Text>
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
