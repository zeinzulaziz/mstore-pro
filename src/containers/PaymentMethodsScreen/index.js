/** @format */

import React, { PureComponent } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { withTheme, Languages } from '@common';
import { Header, MidtransPaymentMethods } from '@components';
import { connect } from 'react-redux';
import styles from './styles';

class PaymentMethodsScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      paymentMethods: [
        {
          id: 'credit_card',
          name: 'Credit Card',
          description: 'Visa, Mastercard, JCB',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'BCA, BNI, BRI, Mandiri',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'gopay',
          name: 'GoPay',
          description: 'Pay with GoPay wallet',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'shopeepay',
          name: 'ShopeePay',
          description: 'Pay with ShopeePay wallet',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'qris',
          name: 'QRIS',
          description: 'Scan QR code to pay',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'alfamart',
          name: 'Alfamart',
          description: 'Pay at Alfamart store',
          icon: 'https://via.placeholder.com/40x40',
        },
        {
          id: 'indomaret',
          name: 'Indomaret',
          description: 'Pay at Indomaret store',
          icon: 'https://via.placeholder.com/40x40',
        },
      ],
    };
  }

  onBack = () => {
    this.props.navigation.goBack();
  };

  onProceedPayment = (selectedMethod) => {
    const { navigation, route } = this.props;
    const { orderData, onPaymentSuccess, onPaymentError } = route.params;

    // Here you would integrate with Midtrans SDK
    // For now, we'll simulate the payment process
    console.log('Processing payment with method:', selectedMethod);
    console.log('Order data:', orderData);

    // Simulate payment processing
    setTimeout(() => {
      if (selectedMethod.id === 'credit_card') {
        // Simulate credit card payment
        onPaymentSuccess({
          method: selectedMethod,
          transactionId: 'TXN_' + Date.now(),
          status: 'success',
        });
      } else {
        // For other methods, show payment instructions
        navigation.navigate('PaymentInstructionsScreen', {
          orderData,
          paymentMethod: selectedMethod,
          onPaymentSuccess,
          onPaymentError,
        });
      }
    }, 2000);
  };

  render() {
    const { theme, route, currency } = this.props;
    const { orderData } = route.params;
    const { paymentMethods } = this.state;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        
        <Header
          title={Languages.PaymentMethods || 'Payment Methods'}
          onBack={this.onBack}
          style={styles.header}
        />

        <MidtransPaymentMethods
          paymentMethods={paymentMethods}
          orderData={orderData}
          currency={this.props.currency}
          onBack={this.onBack}
          onProceedPayment={this.onProceedPayment}
        />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  currency: state.currency,
});

export default connect(mapStateToProps)(withTheme(PaymentMethodsScreen));
