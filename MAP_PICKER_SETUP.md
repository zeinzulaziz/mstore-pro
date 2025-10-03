# 🗺️ Map Picker Setup Guide

## ✅ Features yang Sudah Diimplementasikan

### 1. **MapPicker Component**
- **Full-screen modal** dengan Google Maps
- **Tap to select** location functionality
- **Current location** button dengan GPS
- **Real-time coordinates** display
- **Confirm/Cancel** actions

### 2. **AddressForm Integration**
- **Dual buttons**: "📍 Get Current Location" + "🗺️ Pick on Map"
- **Auto-fill coordinates** setelah pilih lokasi
- **Status updates** untuk user feedback
- **Seamless integration** dengan form validation

### 3. **User Experience**
- **Intuitive interface** seperti Google Maps
- **Visual feedback** dengan marker dan status
- **Error handling** untuk permission issues
- **Fallback mechanism** jika GPS tidak tersedia

## 🔧 Setup yang Diperlukan

### 1. ✅ Package Installation
```bash
npm install react-native-maps --legacy-peer-deps
```

### 2. ✅ Android Permissions
**File**: `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### 3. ✅ iOS Permissions
**File**: `ios/MStore_v2/Info.plist`
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to calculate accurate shipping rates and show your location on the map.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs access to location to calculate accurate shipping rates and show your location on the map.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs access to location to calculate accurate shipping rates and show your location on the map.</string>
```

### 4. ⚠️ Google Maps API Key (Required)

#### Android Setup:
**File**: `android/app/src/main/AndroidManifest.xml`
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

#### iOS Setup:
**File**: `ios/MStore_v2/AppDelegate.mm`
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
  // ... existing code
}
```

## 🚀 How to Get Google Maps API Key

### 1. **Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Maps SDK for Android** & **Maps SDK for iOS**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict API key for security

### 2. **API Restrictions**
- **Android**: Restrict to your app's package name
- **iOS**: Restrict to your app's bundle identifier
- **Maps**: Enable only Maps SDK for Android/iOS

### 3. **Billing Account**
- Google Maps requires billing account
- Free tier: $200 credit per month
- Usage-based pricing after free tier

## 📱 User Flow

### 1. **Delivery Form**
- User mengisi alamat dasar (nama, jalan, kota, dll)
- User melihat 2 options:
  - **📍 Get Current Location**: GPS otomatis
  - **🗺️ Pick on Map**: Manual selection

### 2. **Map Picker Interface**
- **Full-screen map** dengan Google Maps
- **Tap anywhere** untuk pilih lokasi
- **Red marker** menunjukkan lokasi terpilih
- **Current location** button untuk GPS
- **Coordinates display** real-time

### 3. **Confirmation**
- **"Konfirmasi Lokasi"** button
- **Coordinates auto-fill** di form
- **Status update** dengan koordinat terpilih
- **Seamless return** ke form

## 🎯 Benefits

### 1. **Accuracy**
- **Precise location** selection dengan map
- **Visual confirmation** sebelum submit
- **Exact coordinates** untuk shipping calculation

### 2. **User Experience**
- **Familiar interface** seperti Google Maps
- **Intuitive interaction** dengan tap to select
- **Real-time feedback** dengan coordinates

### 3. **Shipping Integration**
- **Biteship API** dengan koordinat akurat
- **Better delivery estimates** dengan lokasi tepat
- **Reduced delivery errors** dengan pin yang presisi

## 🔧 Testing

### 1. **Device Testing**
- **Test di device fisik** (GPS + Maps)
- **Test permission flow** (Allow/Deny)
- **Test map interaction** (tap, zoom, pan)

### 2. **API Testing**
- **Check console logs** untuk coordinates
- **Verify Biteship integration** dengan koordinat
- **Test shipping calculation** dengan lokasi real

### 3. **Error Handling**
- **No GPS signal**: Fallback ke default location
- **Permission denied**: Show manual selection
- **Network error**: Graceful degradation

## ⚠️ Important Notes

1. **Google Maps API Key** wajib diisi untuk maps berfungsi
2. **Test di device fisik** untuk GPS functionality
3. **Billing account** diperlukan untuk Google Maps
4. **API restrictions** untuk security
5. **Fallback mechanism** jika maps tidak load

## 🎉 Ready to Use!

Map Picker sudah siap digunakan! User sekarang bisa:
- 🗺️ **Pilih lokasi dengan tepat** di map
- 📍 **Visual confirmation** sebelum submit
- 🚚 **Akurat shipping calculation** dengan koordinat presisi
- 📱 **User-friendly interface** seperti Google Maps

**Status**: ✅ **MAP PICKER COMPLETED** - Ready for testing! 🚀
