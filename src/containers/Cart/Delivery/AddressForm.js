import React, { useState } from 'react';
import {View, TouchableOpacity, Text, Alert} from 'react-native';
import {Controller} from 'react-hook-form';

import {TextInput, SelectCountry, Button, MapPicker} from '@components';
import {Languages, withTheme, Color, Fonts} from '@common';
import GeolocationService from '@services/GeolocationService';
import ReverseGeocodingService from '@services/ReverseGeocodingService';

import styles from './styles';

const AddressForm = React.memo(({errors, control, ...rest}) => {
  const {
    theme: {
      colors: {placeholder, text},
    },
  } = rest;

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationStatus('Getting location...');
    
    try {
      const position = await GeolocationService.getLocationWithFallback();
      
      // Update form values
      control._formValues.latitude = position.latitude.toString();
      control._formValues.longitude = position.longitude.toString();
      
      // Get address from coordinates
      setLocationStatus('Converting to address...');
      const addressData = await ReverseGeocodingService.getAddressWithFallback(
        position.latitude, 
        position.longitude
      );
      
      setAddressDetails(addressData);
      
      // Update form with address data
      if (addressData.city !== 'Unknown') {
        control._formValues.city = addressData.city;
      }
      if (addressData.district !== 'Unknown') {
        control._formValues.district = addressData.district;
      }
      if (addressData.province !== 'Unknown') {
        control._formValues.province = addressData.province;
      }
      if (addressData.postcode !== 'Unknown') {
        control._formValues.postcode = addressData.postcode;
      }
      
      setLocationStatus(`Location selected: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`);
      
      Alert.alert(
        'Location Updated',
        `Coordinates: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}\nAddress: ${addressData.formattedAddress}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('Failed to get location');
      Alert.alert(
        'Location Error',
        'Unable to get current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onLocationSelect = async (location) => {
    setSelectedLocation(location);
    control._formValues.latitude = location.latitude.toString();
    control._formValues.longitude = location.longitude.toString();
    
    // Get address from coordinates
    setLocationStatus('Converting to address...');
    try {
      const addressData = await ReverseGeocodingService.getAddressWithFallback(
        location.latitude, 
        location.longitude
      );
      
      setAddressDetails(addressData);
      
      // Update form with address data
      if (addressData.city !== 'Unknown') {
        control._formValues.city = addressData.city;
      }
      if (addressData.district !== 'Unknown') {
        control._formValues.district = addressData.district;
      }
      if (addressData.province !== 'Unknown') {
        control._formValues.province = addressData.province;
      }
      if (addressData.postcode !== 'Unknown') {
        control._formValues.postcode = addressData.postcode;
      }
      
      setLocationStatus(`Location selected: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationStatus(`Location selected: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    }
  };

  const openMapPicker = () => {
    setShowMapPicker(true);
  };

  return (
    <View style={styles.formContainer}>
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.FirstName}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeFirstName}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.first_name?.message}
          />
        )}
        name="first_name"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.LastName}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeLastName}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.last_name?.message}
          />
        )}
        name="last_name"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.Address}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeAddress}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.address_1?.message}
          />
        )}
        name="address_1"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.City}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeCity}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.city?.message}
          />
        )}
        name="city"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.State}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeState}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.state?.message}
          />
        )}
        name="state"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.Postcode}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypePostcode}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.postcode?.message}
          />
        )}
        name="postcode"
      />
      
      {/* Location Buttons */}
      <View style={styles.locationContainer}>
        <View style={styles.locationButtonsRow}>
          <Button
            text={isGettingLocation ? "Getting Location..." : "📍 Get Current Location"}
            onPress={getCurrentLocation}
            isLoading={isGettingLocation}
            style={[styles.locationButton, styles.halfButton]}
            textStyle={styles.locationButtonText}
          />
          <Button
            text="🗺️ Pick on Map"
            onPress={openMapPicker}
            style={[styles.locationButton, styles.halfButton, styles.mapButton]}
            textStyle={styles.locationButtonText}
          />
        </View>
        {locationStatus ? (
          <Text style={[styles.locationStatus, { color: text }]}>
            {locationStatus}
          </Text>
        ) : null}
        
        {/* Address Details Display */}
        {addressDetails && (
          <View style={styles.addressDetailsContainer}>
            <Text style={[styles.addressDetailsTitle, { color: text }]}>
              Detail Alamat:
            </Text>
            <View style={styles.addressComponents}>
              <Text style={[styles.addressComponent, { color: text }]}>
                Kota: {addressDetails.city}
              </Text>
              <Text style={[styles.addressComponent, { color: text }]}>
                Kecamatan: {addressDetails.district}
              </Text>
              <Text style={[styles.addressComponent, { color: text }]}>
                Provinsi: {addressDetails.province}
              </Text>
              <Text style={[styles.addressComponent, { color: text }]}>
                Kode Pos: {addressDetails.postcode}
              </Text>
            </View>
          </View>
        )}
      </View>
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <SelectCountry
            onChange={onChange}
            value={value}
            error={errors.country?.message}
          />
        )}
        name="country"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.Email}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeEmail}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.email?.message}
          />
        )}
        name="email"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.Phone}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypePhone}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.phone?.message}
          />
        )}
        name="phone"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <TextInput
            label={Languages.Note}
            onChangeText={onChange}
            value={value}
            placeholder={Languages.TypeNote}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={placeholder}
            error={errors.note?.message}
          />
        )}
        name="note"
      />

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={onLocationSelect}
        initialLocation={selectedLocation}
      />
    </View>
  );
});

export default withTheme(AddressForm);
