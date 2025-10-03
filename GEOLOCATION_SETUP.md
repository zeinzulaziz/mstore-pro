# Geolocation Setup untuk Biteship Integration

## 📱 Package Installation

Jalankan command berikut untuk install geolocation package:

```bash
npm install @react-native-community/geolocation
```

## 🔧 Android Setup

### 1. Android Permissions
Tambahkan permission di `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 2. Auto-linking
Package akan auto-link, tapi jika ada masalah, jalankan:

```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## 🍎 iOS Setup

### 1. Info.plist
Tambahkan di `ios/YourApp/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to calculate accurate shipping rates.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs access to location to calculate accurate shipping rates.</string>
```

### 2. Pod Install
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🚀 Features yang Ditambahkan

### 1. GeolocationService
- **getCurrentPosition()**: Mendapatkan koordinat saat ini
- **requestLocationPermission()**: Request permission untuk Android
- **getLocationWithFallback()**: Fallback ke koordinat Jakarta jika gagal

### 2. AddressForm Enhancement
- **📍 Get Current Location Button**: Button untuk mendapatkan koordinat
- **Latitude/Longitude Fields**: Field untuk menampilkan koordinat
- **Real-time Status**: Status update saat mendapatkan lokasi

### 3. Biteship Locations API
- **createLocation()**: Membuat location di Biteship dashboard
- **Automatic Location Creation**: Otomatis buat location saat OrderSummary
- **Location ID Storage**: Simpan location ID untuk future use

## 📋 API Parameters (sesuai dokumentasi Biteship)

```javascript
{
  "name": "John Doe",
  "contact_name": "John Doe", 
  "contact_phone": "08123456789",
  "address": "Jl. Example No. 123",
  "note": "Optional note",
  "postal_code": "12190",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "type": "destination"
}
```

## 🔄 Flow Integration

1. **User mengisi form Delivery**
2. **Klik "📍 Get Current Location"**
3. **Sistem request permission & get coordinates**
4. **Latitude/Longitude otomatis terisi**
5. **Saat OrderSummary, create Biteship location**
6. **Gunakan location_id untuk shipping calculation**

## 🛠️ Testing

1. **Test di device fisik** (GPS tidak work di simulator)
2. **Allow location permission** saat diminta
3. **Check console logs** untuk melihat API calls
4. **Verify di Biteship dashboard** location terbuat

## ⚠️ Troubleshooting

- **Permission denied**: Check AndroidManifest.xml & Info.plist
- **Location not found**: Test di outdoor dengan GPS signal
- **API error**: Check Biteship API key & network connection
- **Coordinates invalid**: Pastikan format latitude/longitude benar
