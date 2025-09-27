/** @format */

import React, {PureComponent} from 'react';
import {View, FlatList, Image, Text} from 'react-native';
import {connect} from 'react-redux';

import {toast} from '@app/Omni';
import {Languages, Images, withTheme} from '@common';
import {ImageCache, TouchableScale} from '@components';

import styles from './styles';

class ApiCategories extends PureComponent {
  render() {
    const {
      categories,
      theme: {
        colors: {background},
      },
      style,
    } = this.props;

    // filter only the parent categories
    const cates = categories.filter(cate => cate.parent == 0);

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={cates}
        renderItem={this.renderItem}
        numColumns={5}
        style={style}
        contentContainerStyle={[styles.list, {backgroundColor: background}]}
      />
    );
  }

  renderItem = ({item, index}) => {
    const isLastInRow = (index + 1) % 5 === 0;
    const isLastRow = index >= Math.floor(this.props.categories.filter(cate => cate.parent == 0).length / 5) * 5;
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
      list,
      fetchProductsByCollections,
      setSelectedCategory,
    } = this.props;
    
    // Find the category in the list (same logic as HList)
    const selectedCategory = list.find(cat => cat.id === category.id) || category;
    
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

  componentDidMount() {
    if (this.props.categories.length == 0) {
      this.props.fetchCategories();
    }
  }
}

ApiCategories.defaultProps = {
  categories: [],
};

const mapStateToProps = state => {
  return {
    categories: state.categories.list,
    list: state.categories.list, // For finding selected category
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
    fetchCategories: () => {
      if (!netInfo.isConnected) return toast(Languages.noConnection);
      actions.fetchCategories(dispatch);
    },
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
