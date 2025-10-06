/** @format */

import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { withTheme, Languages, Tools, Color, Fonts } from '@common';
import styles from './styles';
import MidtransDirectPayment from '../../services/MidtransDirectPaymentFixed';
import MidtransTest from '../../services/MidtransTest';

class DirectPaymentMethods extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethod: null,
      paymentMethods: [],
      isLoading: false
    };
  }

  componentDidMount() {
    this.loadPaymentMethods();
  }

  loadPaymentMethods = () => {
    const paymentMethods = MidtransDirectPayment.getPaymentMethodOptions();
    this.setState({ paymentMethods });
  };

  testMidtransAPI = async () => {
    console.log('🧪 Testing Midtrans API...');
    const result = await MidtransTest.testAPIConnectivity();
    
    Alert.alert(
      'API Test Result',
      result.success ? 
        '✅ API Test Successful!' : 
        `❌ API Test Failed: ${result.error}`,
      [{ text: 'OK' }]
    );
  };

  testGoPay = async () => {
    console.log('🧪 Testing GoPay specifically...');
    const result = await MidtransTest.testBankTransfer('gopay');
    
    Alert.alert(
      'GoPay Test Result',
      result.success ? 
        '✅ GoPay Test Successful!' : 
        `❌ GoPay Test Failed: ${result.data}`,
      [{ text: 'OK' }]
    );
  };

  testBNI = async () => {
    console.log('🧪 Testing BNI specifically...');
    const result = await MidtransTest.testBankTransfer('bank_transfer');
    
    Alert.alert(
      'BNI Test Result',
      result.success ? 
        '✅ BNI Test Successful!' : 
        `❌ BNI Test Failed: ${result.data}`,
      [{ text: 'OK' }]
    );
  };

  testGoPayAccount = async () => {
    console.log('🧪 Testing GoPay account status...');
    const result = await MidtransTest.testGoPayAccountStatus();
    
    Alert.alert(
      'GoPay Account Test Result',
      result.success ? 
        '✅ GoPay Account Test Successful!' : 
        `❌ GoPay Account Test Failed: ${result.data}`,
      [{ text: 'OK' }]
    );
  };

  selectPaymentMethod = (method) => {
    if (!method.enabled) {
      Alert.alert(
        'Payment Method Not Available',
        method.note || 'This payment method is currently not available.',
        [{ text: 'OK' }]
      );
      return;
    }

    this.setState({ selectedMethod: method });
    
    if (this.props.onMethodSelected) {
      this.props.onMethodSelected(method);
    }
  };

  processPayment = async () => {
    const { selectedMethod } = this.state;
    const { orderData, onPaymentSuccess, onPaymentError } = this.props;

    if (!selectedMethod) {
      Alert.alert('Please select a payment method');
      return;
    }

    this.setState({ isLoading: true });

    try {
      console.log(`Processing payment with ${selectedMethod.name}...`);
      
      const result = await MidtransDirectPayment.processPayment(orderData, selectedMethod);
      
      if (result.success) {
        console.log('✅ Payment processed successfully:', result);
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...result.data,
            payment_method: selectedMethod,
            order_id: result.data.order_id
          });
        }
      } else {
        console.error('❌ Payment failed:', result);
        console.error('❌ Error details:', result.error);
        console.error('❌ Error type:', result.error_type);
        console.error('❌ Error details:', result.error_details);
        
        if (onPaymentError) {
          onPaymentError(result.error || 'Payment failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      console.error('❌ Error stack:', error.stack);
      
      if (onPaymentError) {
        onPaymentError(error.message || 'An unexpected error occurred.');
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };

  renderPaymentMethod = (method) => {
    const { selectedMethod } = this.state;
    const isSelected = selectedMethod?.id === method.id;
    const isEnabled = method.enabled;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod,
          !isEnabled && styles.disabledPaymentMethod
        ]}
        onPress={() => this.selectPaymentMethod(method)}
        disabled={!isEnabled}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.paymentMethodInfo}>
            <Text style={[
              styles.paymentMethodName,
              !isEnabled && styles.disabledText
            ]}>
              {method.name}
            </Text>
            <Text style={[
              styles.paymentMethodDescription,
              !isEnabled && styles.disabledText
            ]}>
              {method.description}
            </Text>
            {method.status === 'pending' && (
              <Text style={styles.pendingText}>
                {method.note}
              </Text>
            )}
          </View>
          
          <View style={styles.paymentMethodStatus}>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIndicatorText}>✓</Text>
              </View>
            )}
            {method.status === 'pending' && (
              <View style={styles.pendingIndicator}>
                <Text style={styles.pendingIndicatorText}>⏳</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { paymentMethods, selectedMethod, isLoading } = this.state;
    const { theme } = this.props;

    const activeMethods = paymentMethods.filter(method => method.enabled);
    const pendingMethods = paymentMethods.filter(method => !method.enabled);

    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>
        
        <ScrollView style={styles.paymentMethodsList}>
          {/* Active Payment Methods */}
          {activeMethods.length > 0 && (
            <View style={styles.paymentSection}>
              <Text style={styles.sectionSubtitle}>Available Now</Text>
              {activeMethods.map(this.renderPaymentMethod)}
            </View>
          )}

          {/* Pending Payment Methods */}
          {pendingMethods.length > 0 && (
            <View style={styles.paymentSection}>
              <Text style={styles.sectionSubtitle}>Coming Soon</Text>
              {pendingMethods.map(this.renderPaymentMethod)}
            </View>
          )}
        </ScrollView>

        {/* Test API Buttons */}
        <View style={styles.testContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={this.testMidtransAPI}
          >
            <Text style={styles.testButtonText}>🧪 Test API Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonSecondary]}
            onPress={this.testGoPay}
          >
            <Text style={styles.testButtonText}>💰 Test GoPay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonTertiary]}
            onPress={this.testBNI}
          >
            <Text style={styles.testButtonText}>🏦 Test BNI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonQuaternary]}
            onPress={this.testGoPayAccount}
          >
            <Text style={styles.testButtonText}>🔍 Test GoPay Account</Text>
          </TouchableOpacity>
        </View>

        {/* Process Payment Button */}
        {selectedMethod && (
          <View style={styles.processPaymentContainer}>
            <TouchableOpacity
              style={[
                styles.processPaymentButton,
                isLoading && styles.processPaymentButtonDisabled
              ]}
              onPress={this.processPayment}
              disabled={isLoading}
            >
              <Text style={styles.processPaymentButtonText}>
                {isLoading ? 'Processing...' : `Pay with ${selectedMethod.name}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

export default withTheme(DirectPaymentMethods);
