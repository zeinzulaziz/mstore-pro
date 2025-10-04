import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { withTheme, Color, Fonts } from '@common';

const { width, height } = Dimensions.get('window');

const MapPicker = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation = null,
  theme: { colors: { text, background } }
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      // Import GeolocationService dynamically to avoid circular dependency
      const GeolocationService = require('@services/GeolocationService').default;
      const position = await GeolocationService.getLocationWithFallback();
      
      setSelectedLocation({ latitude: position.latitude, longitude: position.longitude });
      
      // Update WebView with new location
      if (webViewRef.current) {
        const script = `
          if (window.map && window.marker) {
            const newLatLng = new google.maps.LatLng(${position.latitude}, ${position.longitude});
            window.map.setCenter(newLatLng);
            window.marker.setPosition(newLatLng);
          }
        `;
        webViewRef.current.injectJavaScript(script);
      }
      
      Alert.alert(
        'Location Updated',
        `Coordinates: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get current location. Please select manually on the map.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert(
        'No Location Selected',
        'Please tap on the map to select your location.',
        [{ text: 'OK' }]
      );
    }
  };

  const onCancel = () => {
    onClose();
  };

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_selected') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  const getMapHTML = () => {
    const lat = selectedLocation?.latitude || -6.2088;
    const lng = selectedLocation?.longitude || 106.8456;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
              crossorigin=""/>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          #map { width: 100%; height: 100vh; }
          #error { 
            display: none; 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            background: #f44336; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            z-index: 1000;
            max-width: 80%;
          }
          #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 1000;
          }
          .leaflet-control-zoom {
            margin-top: 10px !important;
            margin-right: 10px !important;
          }
          .leaflet-control-layers {
            margin-top: 10px !important;
            margin-right: 10px !important;
          }
        </style>
      </head>
      <body>
        <div id="loading">Loading OpenStreetMap...</div>
        <div id="error"></div>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
                crossorigin=""></script>
        <script>
          let map;
          let marker;
          let mapLoaded = false;
          
          function showError(message) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').innerHTML = message;
          }
          
          function hideLoading() {
            document.getElementById('loading').style.display = 'none';
          }
          
          function sendLocationToRN(lat, lng) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location_selected',
                latitude: lat,
                longitude: lng
              }));
            }
          }
          
          function initMap() {
            try {
              // Initialize the map
              map = L.map('map').setView([${lat}, ${lng}], 15);
              
              // Add OpenStreetMap tiles
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
              }).addTo(map);
              
              // Add additional tile layers for variety
              const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri',
                maxZoom: 19
              });
              
              const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
                maxZoom: 17
              });
              
              // Add layer control
              const baseMaps = {
                "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors',
                  maxZoom: 19
                }),
                "Satellite": satelliteLayer,
                "Terrain": terrainLayer
              };
              
              L.control.layers(baseMaps).addTo(map);
              
              // Create custom marker icon
              const customIcon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              
              // Add marker
              marker = L.marker([${lat}, ${lng}], { 
                icon: customIcon,
                draggable: true 
              }).addTo(map);
              
              // Add click listener to map
              map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                marker.setLatLng([lat, lng]);
                sendLocationToRN(lat, lng);
              });
              
              // Add drag listener to marker
              marker.on('dragend', function(e) {
                const lat = e.target.getLatLng().lat;
                const lng = e.target.getLatLng().lng;
                sendLocationToRN(lat, lng);
              });
              
              // Add scale control
              L.control.scale({
                position: 'bottomleft',
                metric: true,
                imperial: false
              }).addTo(map);
              
              mapLoaded = true;
              hideLoading();
              
            } catch (error) {
              console.error('Map initialization error:', error);
              showError('Error loading map: ' + error.message);
            }
          }
          
          function handleMapError() {
            showError('Failed to load OpenStreetMap. Please check your internet connection and try again.');
          }
          
          // Initialize map when page loads
          document.addEventListener('DOMContentLoaded', function() {
            initMap();
          });
          
          // Set timeout for map loading
          setTimeout(function() {
            if (!mapLoaded) {
              handleMapError();
            }
          }, 10000);
        </script>
      </body>
      </html>
    `;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { backgroundColor: background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Icon name="close" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>
            Pilih Lokasi Rumah
          </Text>
          <TouchableOpacity onPress={getCurrentLocation} style={styles.headerButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Color.primary} />
            ) : (
              <Icon name="my-location" size={24} color={Color.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: text }]}>
            📍 Tap pada map untuk memilih lokasi rumah Anda
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: getMapHTML() }}
            style={styles.map}
            onMessage={handleMapMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Color.primary} />
                <Text style={[styles.loadingText, { color: text }]}>
                  Loading Map...
                </Text>
              </View>
            )}
          />
        </View>

        {/* Selected Location Info */}
        {selectedLocation && (
          <View style={styles.locationInfo}>
            <Text style={[styles.locationLabel, { color: text }]}>
              Lokasi Terpilih:
            </Text>
            <Text style={[styles.locationCoords, { color: text }]}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              !selectedLocation && styles.disabledButton
            ]}
            onPress={onConfirmLocation}
            disabled={!selectedLocation}
          >
            <Text style={styles.confirmButtonText}>Konfirmasi Lokasi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  instructions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Color.lightGrey,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  locationInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Color.lightGrey,
    borderTopWidth: 1,
    borderTopColor: Color.border,
  },
  locationLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Color.grey,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Color.lightGrey,
    borderWidth: 1,
    borderColor: Color.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Color.text,
  },
  confirmButton: {
    backgroundColor: Color.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: Color.grey,
    opacity: 0.6,
  },
});

export default withTheme(MapPicker);