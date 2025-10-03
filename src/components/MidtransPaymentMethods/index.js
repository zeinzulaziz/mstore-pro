/** @format */

import React, { PureComponent } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { withTheme, Tools, Languages, Color, Fonts } from '@common';
import { Button } from '@components';
import styles from './styles';

class MidtransPaymentMethods extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethod: null,
      isLoading: false,
    };
  }

  onSelectPaymentMethod = (method) => {
    this.setState({ selectedMethod: method });
  };

  onProceedPayment = () => {
    const { selectedMethod } = this.state;
    const { onProceedPayment } = this.props;

    if (!selectedMethod) {
      return;
    }

    this.setState({ isLoading: true });
    onProceedPayment(selectedMethod);
  };

  renderPaymentMethod = (method, index) => {
    const { selectedMethod } = this.state;
    const { theme } = this.props;
    const { colors: { text } } = theme;
    const isSelected = selectedMethod && selectedMethod.id === method.id;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.paymentMethodItem,
          isSelected && styles.selectedPaymentMethod,
        ]}
        onPress={() => this.onSelectPaymentMethod(method)}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.paymentMethodInfo}>
            <Image
              source={{ uri: method.icon || 'https://via.placeholder.com/40x40' }}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <View style={styles.paymentMethodDetails}>
              <Text style={[styles.paymentMethodName, { color: text }]}>
                {method.name}
              </Text>
              <Text style={[styles.paymentMethodDescription, { color: text }]}>
                {method.description}
              </Text>
            </View>
          </View>
          
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {
      paymentMethods = [],
      orderData,
      currency,
      theme: { colors: { text, background } },
      onBack,
    } = this.props;
    const { selectedMethod, isLoading } = this.state;

    const { totalPrice } = orderData;

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: text }]}>
              {Languages.SelectPaymentMethod || 'Select Payment Method'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: text }]}>
              {Languages.ChooseYourPreferredPaymentMethod || 'Choose your preferred payment method'}
            </Text>
          </View>

          {/* Order Total */}
          <View style={styles.orderTotalContainer}>
            <Text style={[styles.orderTotalLabel, { color: text }]}>
              {Languages.OrderTotal || 'Order Total'}
            </Text>
            <Text style={[styles.orderTotalAmount, { color: text }]}>
              {Tools.getCurrencyFormatted(totalPrice, currency)}
            </Text>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={[styles.sectionTitle, { color: text }]}>
              {Languages.AvailablePaymentMethods || 'Available Payment Methods'}
            </Text>
            
            {paymentMethods.map((method, index) => this.renderPaymentMethod(method, index))}
          </View>

          {/* Payment Info */}
          <View style={styles.paymentInfoContainer}>
            <Text style={[styles.paymentInfoTitle, { color: text }]}>
              {Languages.PaymentInformation || 'Payment Information'}
            </Text>
            <Text style={[styles.paymentInfoText, { color: text }]}>
              {Languages.PaymentInfoDescription || 
                'Your payment will be processed securely by Midtrans. You will be redirected to complete the payment process.'}
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            text={Languages.Back || 'Back'}
            onPress={onBack}
            style={[styles.backButton, { borderColor: Color.border }]}
            textStyle={[styles.backButtonText, { color: text }]}
          />
          <Button
            text={Languages.ProceedToPayment || 'Proceed to Payment'}
            onPress={this.onProceedPayment}
            isLoading={isLoading}
            disabled={!selectedMethod}
            style={[
              styles.proceedButton,
              !selectedMethod && styles.disabledButton,
            ]}
            textStyle={styles.proceedButtonText}
          />
        </View>
      </View>
    );
  }
}

export default withTheme(MidtransPaymentMethods);