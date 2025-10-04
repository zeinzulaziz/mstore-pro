/** @format */

import React, { PureComponent } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { withTheme, Languages, Color, Tools } from '@common';
import { OrderSummary } from '@components';
import { connect } from 'react-redux';
import styles from './styles';

class OrderSummaryScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  onEditOrder = () => {
    // Navigate back to cart or shipping info
    this.props.navigation.goBack();
  };

  onProceedToPayment = (orderDataWithMethods) => {
    const { navigation } = this.props;
    
    this.setState({ isLoading: true });
    
    // Navigate directly to Midtrans payment screen
    navigation.navigate('MidtransPaymentScreen', {
      orderData: orderDataWithMethods,
      onPaymentSuccess: this.onPaymentSuccess,
      onPaymentError: this.onPaymentError,
    });
  };

  onPaymentSuccess = (paymentData) => {
    this.setState({ isLoading: false });
    // Navigate to success screen
    this.props.navigation.navigate('OrderSuccessScreen', {
      orderData: this.props.route.params.orderData,
      paymentData,
    });
  };

  onPaymentError = (error) => {
    this.setState({ isLoading: false });
    // Show error message
    console.error('Payment error:', error);
  };

  render() {
    const { theme, route, currency, cartItems } = this.props;
    const { orderData } = route.params;
    const { isLoading } = this.state;

    // Transform cartItems to match OrderSummary expected format
    const transformedOrderData = {
      ...orderData,
      line_items: cartItems.map((cartItem, index) => {
        const product = cartItem.variation && cartItem.variation.price !== '' 
          ? cartItem.variation 
          : cartItem.product;
        
        return {
          product_id: cartItem.product.id,
          quantity: cartItem.quantity,
          name: cartItem.product.name,
          price: Tools.getMultiCurrenciesPrice(product, currency),
          image: Tools.getImageVariation(cartItem.product, cartItem.variation),
          product: cartItem.product, // Include full product data for weight
          variation: cartItem.variation ? {
            id: cartItem.variation.id,
            attributes: cartItem.variation.attributes || {},
            weight: cartItem.variation.weight // Include variation weight
          } : null
        };
      }),
      // Calculate totals from cartItems
      subTotal: this.calculateSubTotal(),
      shippingPrice: this.calculateShippingPrice(),
      taxPrice: 0, // You can add tax calculation if needed
      discountAmount: this.calculateDiscountAmount(),
      totalPrice: this.calculateTotalPrice()
    };

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        

        <OrderSummary
          orderData={transformedOrderData}
          currency={this.props.currency}
          onEditOrder={this.onEditOrder}
          onProceedToPayment={this.onProceedToPayment}
          isLoading={isLoading}
        />
      </SafeAreaView>
    );
  }

  calculateSubTotal = () => {
    const { cartItems, currency } = this.props;
    let total = 0;
    
    cartItems.forEach(cartItem => {
      const product = cartItem.variation && cartItem.variation.price !== '' 
        ? cartItem.variation 
        : cartItem.product;
      
      const price = Tools.getMultiCurrenciesPrice(product, currency);
      total += price * cartItem.quantity;
    });
    
    return total;
  };

  calculateShippingPrice = () => {
    // You can implement shipping calculation here
    // For now, return 0 or get from orderData
    return 0;
  };

  calculateDiscountAmount = () => {
    // You can implement discount calculation here
    // For now, return 0 or get from orderData
    return 0;
  };

  calculateTotalPrice = () => {
    return this.calculateSubTotal() + this.calculateShippingPrice() - this.calculateDiscountAmount();
  };
}

const mapStateToProps = (state) => ({
  currency: state.currency,
  cartItems: state.carts.cartItems,
});

export default connect(mapStateToProps)(withTheme(OrderSummaryScreen));
