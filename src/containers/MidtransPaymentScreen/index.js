/** @format */

import React, { PureComponent } from 'react';
import { View, SafeAreaView, StatusBar, Alert, ActivityIndicator, Text, Linking } from 'react-native';
import { withTheme, Languages, Tools, Color, Fonts } from '@common';
import { Header } from '@components';
import { connect } from 'react-redux';
import { WebView } from 'react-native-webview';
import { getMidtransConfig, getAuthHeader, getSnapUrl } from '../../config/MidtransConfig';
import MStoreMidtransAPI from '../../services/MStoreMidtransAPI';
import styles from './styles';

class MidtransPaymentScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      paymentStatus: 'processing', // processing, success, failed, webview
      snapToken: null,
      snapUrl: null,
      error: null,
    };
  }

  componentDidMount() {
    console.log('MidtransPaymentScreen mounted');
    // Simulate Midtrans payment processing
    this.processPayment();
  }

  processPayment = async () => {
    console.log('processPayment called');
    const { route } = this.props;
    const { orderData, onPaymentSuccess, onPaymentError } = route.params;
    
    console.log('orderData:', orderData);
    console.log('selectedPaymentMethod:', orderData?.selectedPaymentMethod);
    
    try {
      // Use direct Midtrans integration
      console.log('Using direct Midtrans integration...');
      
      // Generate Snap token directly from Midtrans
      const snapResult = await MStoreMidtransAPI.generateSnapToken(orderData);
      
      if (snapResult.success) {
        console.log('✅ Snap token generated successfully!');
        console.log('Token:', snapResult.token);
        console.log('Redirect URL:', snapResult.redirect_url);
        
        this.setState({
          isLoading: false,
          paymentStatus: 'webview',
          snapToken: snapResult.token,
          snapUrl: snapResult.redirect_url
        });
      } else {
        console.error('❌ Failed to generate Snap token:', snapResult.error);
        this.setState({
          isLoading: false,
          paymentStatus: 'failed',
          error: `Failed to generate Snap token: ${snapResult.error}`
        });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      this.setState({
        isLoading: false,
        paymentStatus: 'failed',
        error: error.message
      });
    }
  };

  fallbackToManualPayment = () => {
    const { route } = this.props;
    const { orderData, onPaymentSuccess, onPaymentError } = route.params;
    const { selectedPaymentMethod } = orderData;
    
    // Simple fallback - just show success for now
    this.setState({
      isLoading: false,
      paymentStatus: 'success'
    });
    
    setTimeout(() => {
      onPaymentSuccess({
        method: selectedPaymentMethod,
        transactionId: 'TXN_' + Date.now(),
        status: 'success',
        orderData
      });
    }, 2000);
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onNavigationStateChange = (navState) => {
    console.log('Navigation state changed:', navState.url);
    
    // Check if URL indicates payment completion
    if (navState.url.includes('finish')) {
      this.handlePaymentSuccess({
        payment_method: this.props.route.params.orderData.selectedPaymentMethod?.id,
        transaction_id: 'TXN_' + Date.now(),
        url: navState.url
      });
    } else if (navState.url.includes('pending')) {
      this.handlePaymentPending({
        payment_method: this.props.route.params.orderData.selectedPaymentMethod?.id,
        transaction_id: 'TXN_' + Date.now(),
        url: navState.url
      });
    } else if (navState.url.includes('error')) {
      this.handlePaymentError({
        error_message: 'Payment failed',
        url: navState.url
      });
    }
  };

  onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);
      
      if (data.status === 'webview_ready') {
        console.log('WebView is ready');
      } else if (data.status === 'success') {
        this.handlePaymentSuccess(data);
      } else if (data.status === 'pending') {
        this.handlePaymentPending(data);
      } else if (data.status === 'error') {
        this.handlePaymentError(data);
      } else if (data.status === 'payment_event') {
        console.log('Payment event:', data.result);
        // Handle specific payment events from Snap.js
        if (data.result && data.result.status_code === '200') {
          this.handlePaymentSuccess(data.result);
        } else if (data.result && data.result.status_code === '201') {
          this.handlePaymentPending(data.result);
        } else if (data.result && data.result.status_code === '400') {
          this.handlePaymentError(data.result);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  handlePaymentSuccess = (data) => {
    const { route } = this.props;
    const { onPaymentSuccess } = route.params;
    
    onPaymentSuccess({
      method: data.payment_method,
      transactionId: data.transaction_id,
      status: 'success',
      orderData: this.props.route.params.orderData,
      midtransData: data
    });
  };

  handlePaymentPending = (data) => {
    const { route } = this.props;
    const { onPaymentSuccess } = route.params;
    
    onPaymentSuccess({
      method: data.payment_method,
      transactionId: data.transaction_id,
      status: 'pending',
      orderData: this.props.route.params.orderData,
      midtransData: data
    });
  };

  handlePaymentError = (data) => {
    const { route } = this.props;
    const { onPaymentError } = route.params;
    
    onPaymentError(data.error_message || 'Payment failed');
  };

  render() {
    const { theme, route } = this.props;
    const { orderData } = route.params;
    const { isLoading, paymentStatus, snapUrl, error } = this.state;
    const { selectedPaymentMethod } = orderData;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        
        <Header
          title="Midtrans Payment"
          onBack={this.onBack}
          style={styles.header}
        />

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Processing payment with {selectedPaymentMethod?.name}...
              </Text>
            </View>
          ) : paymentStatus === 'webview' ? (
            <WebView
              source={{ uri: snapUrl }}
              style={styles.webview}
              onMessage={this.onWebViewMessage}
              onNavigationStateChange={this.onNavigationStateChange}
              injectedJavaScript={`
                // Midtrans Snap WebView Integration
                (function() {
                  // Listen for Midtrans payment events
                  window.addEventListener('message', function(event) {
                    try {
                      if (event.data && typeof event.data === 'object') {
                        window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
                      }
                    } catch (e) {
                      console.error('Error handling message:', e);
                    }
                  });
                  
                  // Listen for Snap.js events
                  if (typeof window.snap !== 'undefined') {
                    window.snap.on('payment', function(result) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        status: 'payment_event',
                        result: result
                      }));
                    });
                  }
                  
                  // Listen for URL changes that indicate payment status
                  let currentUrl = window.location.href;
                  const checkUrl = function() {
                    if (window.location.href !== currentUrl) {
                      currentUrl = window.location.href;
                      console.log('URL changed to:', currentUrl);
                      
                      if (currentUrl.includes('finish')) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          status: 'success',
                          payment_method: '${selectedPaymentMethod?.id}',
                          transaction_id: 'TXN_' + Date.now(),
                          url: currentUrl
                        }));
                      } else if (currentUrl.includes('pending')) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          status: 'pending',
                          payment_method: '${selectedPaymentMethod?.id}',
                          transaction_id: 'TXN_' + Date.now(),
                          url: currentUrl
                        }));
                      } else if (currentUrl.includes('error')) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          status: 'error',
                          error_message: 'Payment failed',
                          url: currentUrl
                        }));
                      }
                    }
                  };
                  
                  // Check URL every 500ms
                  setInterval(checkUrl, 500);
                  
                  // Also check on page load
                  window.addEventListener('load', checkUrl);
                  
                  // Notify that script is ready
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'webview_ready'
                  }));
                })();
              `}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="compatibility"
              thirdPartyCookiesEnabled={true}
              allowsBackForwardNavigationGestures={true}
            />
          ) : paymentStatus === 'success' ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { color: theme.colors.text }]}>
                Payment processed successfully!
              </Text>
              <Text style={[styles.methodText, { color: theme.colors.text }]}>
                Method: {selectedPaymentMethod?.name}
              </Text>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.text }]}>
                {error || 'Payment failed. Please try again.'}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  currency: state.currency.currency,
});

export default connect(mapStateToProps)(withTheme(MidtransPaymentScreen));
