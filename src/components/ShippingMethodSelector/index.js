import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Dimensions } from 'react-native';
import { withTheme, Tools, Languages, Color, Fonts } from '@common';
import styles from './styles';

class ShippingMethodSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMethod: null,
      showDropdown: false,
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

  selectShippingMethod = (method, index) => {
    // Create the same identifier logic as in renderShippingMethod
    const serviceCode = method.service_code || 
                       method.courier_service_code || 
                       method.service_name || 
                       `service_${index}`;
    const itemId = `${method.courier_code}_${serviceCode}`;
    
    console.log('Selecting shipping method:', {
      courier: method.courier_name,
      service: method.service_name,
      courier_code: method.courier_code,
      service_code: method.service_code,
      courier_service_code: method.courier_service_code,
      serviceCode,
      itemId,
      price: method.price
    });
    this.setState({ 
      selectedMethod: method,
      showDropdown: false 
    });
    this.props.onSelectShippingMethod(method);
  };

  toggleDropdown = () => {
    const { shippingRates } = this.props;
    console.log('🔄 Toggle dropdown clicked');
    console.log('📦 Shipping rates available:', shippingRates?.length || 0);
    console.log('📦 Current showDropdown state:', this.state.showDropdown);
    
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  renderShippingMethod = ({ item, index, isCompact = false }) => {
    const { theme } = this.props;
    const { colors: { text, background } } = theme;
    const { selectedMethod } = this.state;
    
    // Create unique identifier for each shipping method
    // Use multiple fallbacks to ensure uniqueness
    const serviceCode = item.service_code || 
                       item.courier_service_code || 
                       item.service_name || 
                       `service_${index}`;
    const itemId = `${item.courier_code}_${serviceCode}`;
    const selectedId = selectedMethod ? 
      `${selectedMethod.courier_code}_${selectedMethod.service_code || 
        selectedMethod.courier_service_code || 
        selectedMethod.service_name || 
        'unknown'}` : null;
    const isSelected = selectedId === itemId;
    
    // Debug logging for all items
    console.log('Shipping method item:', {
      index,
      courier: item.courier_name,
      service: item.service_name,
      service_code: item.service_code,
      courier_service_code: item.courier_service_code,
      serviceCode,
      itemId,
      selectedId,
      isSelected
    });

    return (
      <TouchableOpacity
        style={[
          isCompact ? styles.shippingMethodItemCompact : styles.shippingMethodItem,
          { 
            backgroundColor: isSelected ? '#f8f9ff' : background,
            borderColor: isSelected ? Color.primary : Color.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => this.selectShippingMethod(item, index)}
        activeOpacity={0.7}
      >
        <View style={styles.shippingMethodContent}>
          {/* Info Courier - Full Width */}
          <View style={styles.courierInfo}>
            <View style={styles.courierNameContainer}>
              <Text style={[styles.courierName, { color: text }]}>
                {item.courier_name || item.courier_code?.toUpperCase()}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[styles.serviceName, { color: Color.grey }]}>
              {item.courier_service_name || item.service_name || item.service_code}
            </Text>
            
            {/* Durasi Pengiriman */}
            {(item.duration || item.etd) && (
              <Text style={[styles.additionalInfo, { color: Color.grey }]}>
                ⏱️ {item.duration || `${item.etd} hari`}
              </Text>
            )}
            
            {/* Deskripsi Detail - Hide in compact mode */}
            {!isCompact && item.description && (
              <Text style={[styles.description, { color: Color.grey }]}>
                📝 {item.description}
              </Text>
            )}
            
            {/* Tipe Layanan - Hide in compact mode */}
            {!isCompact && item.service_type && (
              <Text style={[styles.additionalInfo, { color: Color.grey }]}>
                🚚 {item.service_type === 'standard' ? 'Layanan Standar' : 
                     item.service_type === 'express' ? 'Layanan Express' : 
                     item.service_type === 'overnight' ? 'Layanan Overnight' : 
                     item.service_type}
              </Text>
            )}
            
            {/* Tipe Pengiriman - Hide in compact mode */}
            {!isCompact && item.shipping_type && (
              <Text style={[styles.additionalInfo, { color: Color.grey }]}>
                📦 {item.shipping_type === 'parcel' ? 'Paket' : 
                     item.shipping_type === 'document' ? 'Dokumen' : 
                     item.shipping_type}
              </Text>
            )}
            
            {/* Features Container - Show only in compact mode */}
            {isCompact && (
              <View style={styles.featuresContainer}>
                {/* Cash on Delivery */}
                {item.available_for_cash_on_delivery && (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>💳 COD</Text>
                  </View>
                )}
                
                {/* Proof of Delivery */}
                {item.available_for_proof_of_delivery && (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>📋 POD</Text>
                  </View>
                )}
                
                {/* Instant Waybill */}
                {item.available_for_instant_waybill_id && (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>⚡ Instant</Text>
                  </View>
                )}
                
                {/* Insurance */}
                {item.available_for_insurance && (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>🛡️ Insurance</Text>
                  </View>
                )}
                
                {/* Free Shipping */}
                {item.tier === 'free' && (
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>🆓 Gratis</Text>
                  </View>
                )}
              </View>
            )}
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

    const { selectedMethod, showDropdown } = this.state;
    const screenHeight = Dimensions.get('window').height;

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <Text style={[styles.sectionTitle, { color: text }]}>
          {Languages.ShippingMethods || 'Shipping Methods'}
        </Text>
        
        {/* Dropdown Trigger */}
        <TouchableOpacity 
          style={[styles.dropdownTrigger, { backgroundColor: background }]}
          onPress={this.toggleDropdown}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownContent}>
            <View style={styles.dropdownLeft}>
              <Text style={[styles.dropdownTitle, { color: text }]}>
                {selectedMethod ? 
                  `${selectedMethod.courier_name || selectedMethod.courier_code?.toUpperCase()} - ${selectedMethod.courier_service_name || selectedMethod.service_name}` :
                  'Pilih Metode Pengiriman'
                }
              </Text>
              {selectedMethod && (
                <Text style={[styles.dropdownSubtitle, { color: Color.grey }]}>
                  {selectedMethod.duration || selectedMethod.etd ? `⏱️ ${selectedMethod.duration || `${selectedMethod.etd} hari`}` : ''}
                </Text>
              )}
            </View>
            <View style={styles.dropdownRight}>
              <Text style={[styles.dropdownPrice, { color: Color.primary }]}>
                {selectedMethod ? Tools.getCurrenciesFormatted(selectedMethod.price) : ''}
              </Text>
              <Text style={[styles.dropdownArrow, { color: text }]}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="slide"
          onRequestClose={() => this.setState({ showDropdown: false })}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => this.setState({ showDropdown: false })}
          >
            <TouchableOpacity 
              style={[styles.modalContainer, { 
                backgroundColor: background,
                maxHeight: screenHeight * 0.7 
              }]}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: text }]}>
                  Pilih Metode Pengiriman
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => this.setState({ showDropdown: false })}
                >
                  <Text style={[styles.closeButtonText, { color: text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {shippingRates && shippingRates.length > 0 ? (
                  shippingRates.map((item, index) => {
                    console.log('📦 Rendering shipping method in modal:', {
                      index,
                      courier: item.courier_name,
                      service: item.service_name,
                      price: item.price
                    });
                    return (
                      <View key={`${item.courier_code}-${item.service_code || item.courier_service_code || index}-${index}`}>
                        {this.renderShippingMethod({ item, index, isCompact: true })}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyModalContainer}>
                    <Text style={[styles.emptyModalText, { color: text }]}>
                      Tidak ada metode pengiriman tersedia
                    </Text>
                  </View>
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

export default withTheme(ShippingMethodSelector);
