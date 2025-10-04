import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { withTheme, Tools, Languages, Color, Fonts } from '@common';
import styles from './styles';

class ShippingMethodSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethod: null,
    };
  }

  componentDidMount() {
    const { selectedShippingMethod } = this.props;
    if (selectedShippingMethod) {
      this.setState({ selectedMethod: selectedShippingMethod });
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedShippingMethod } = this.props;
    if (prevProps.selectedShippingMethod !== selectedShippingMethod) {
      this.setState({ selectedMethod: selectedShippingMethod });
    }
  }

  selectShippingMethod = (method) => {
    this.setState({ selectedMethod: method });
    this.props.onSelectShippingMethod(method);
  };

  renderShippingMethod = ({ item }) => {
    const { theme } = this.props;
    const { colors: { text, background } } = theme;
    const { selectedMethod } = this.state;
    const isSelected = selectedMethod && selectedMethod.courier_code === item.courier_code && selectedMethod.service_code === item.service_code;

    return (
      <TouchableOpacity
        style={[
          styles.shippingMethodItem,
          { 
            backgroundColor: isSelected ? '#f8f9ff' : background,
            borderColor: isSelected ? Color.primary : Color.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => this.selectShippingMethod(item)}
        activeOpacity={0.7}
      >
        <View style={styles.shippingMethodContent}>
          {/* Radio Button di Kiri */}
          <View style={styles.radioContainer}>
            <Icon 
              name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
              size={20} 
              color={isSelected ? Color.primary : Color.grey} 
            />
          </View>
          
          {/* Info Courier di Tengah */}
          <View style={styles.courierInfo}>
            <Text style={[styles.courierName, { color: text }]}>
              {item.courier_name || item.courier_code?.toUpperCase()}
            </Text>
            <Text style={[styles.serviceName, { color: Color.grey }]}>
              {item.service_name || item.service_code}
              {item.etd && ` • ${item.etd} hari`}
            </Text>
          </View>
          
          {/* Price di Kanan */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: Color.primary }]}>
              {Tools.getCurrencyFormatted(item.price, this.props.currency)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { 
      shippingRates, 
      isLoading, 
      error, 
      theme: { colors: { text, background } } 
    } = this.props;

    if (isLoading) {
      return (
        <View style={[styles.container, { backgroundColor: background }]}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            {Languages.ShippingMethods || 'Shipping Methods'}
          </Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.primary} />
            <Text style={[styles.loadingText, { color: text }]}>
              {Languages.LoadingShippingRates || 'Loading shipping rates...'}
            </Text>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.container, { backgroundColor: background }]}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            {Languages.ShippingMethods || 'Shipping Methods'}
          </Text>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Color.red }]}>
              {error}
            </Text>
          </View>
        </View>
      );
    }

    if (!shippingRates || shippingRates.length === 0) {
      return (
        <View style={[styles.container, { backgroundColor: background }]}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            {Languages.ShippingMethods || 'Shipping Methods'}
          </Text>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: Color.grey }]}>
              {Languages.NoShippingMethods || 'No shipping methods available'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <Text style={[styles.sectionTitle, { color: text }]}>
          {Languages.ShippingMethods || 'Shipping Methods'}
        </Text>
        <View style={styles.shippingMethodsList}>
          {shippingRates.map((item, index) => (
            <View key={`${item.courier_code}-${item.service_code}-${index}`}>
              {this.renderShippingMethod({ item })}
            </View>
          ))}
        </View>
      </View>
    );
  }
}

export default withTheme(ShippingMethodSelector);
