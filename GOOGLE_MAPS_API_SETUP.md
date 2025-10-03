# 🗺️ Google Maps API Key Setup

## ⚠️ Error yang Terjadi:
"Sorry! Something went wrong. This page didn't load Google Maps correctly."

## 🔧 Solusi: Dapatkan Google Maps API Key yang Valid

### **1. Buat Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau select existing project
3. Enable billing account (required untuk Google Maps)

### **2. Enable APIs**
1. Go to **APIs & Services** → **Library**
2. Enable these APIs:
   - **Maps JavaScript API** ✅
   - **Geocoding API** ✅ (optional)
   - **Places API** ✅ (optional)

### **3. Create API Key**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key

### **4. Restrict API Key (Recommended)**
1. Click on your API key
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add: `localhost:*`, `127.0.0.1:*`, `*yourdomain.com/*`
3. Under **API restrictions**:
   - Select **Restrict key**
   - Select: **Maps JavaScript API**

### **5. Update API Key di Code**
**File**: `src/components/MapPicker/index.js`
```javascript
// Ganti YOUR_GOOGLE_MAPS_API_KEY dengan API key yang valid
src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap"
```

## 🚀 Testing

### **1. Test di Browser**
1. Buka `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY`
2. Should return JavaScript code (not error)

### **2. Test di App**
1. Run app: `npx react-native run-android`
2. Go to Cart → Delivery
3. Click "🗺️ Pick on Map"
4. Map should load without error

## 💰 Pricing

### **Free Tier:**
- **$200 credit** per month
- **28,000 map loads** per month
- **40,000 geocoding requests** per month

### **After Free Tier:**
- **$7 per 1,000 map loads**
- **$5 per 1,000 geocoding requests**

## 🔒 Security Best Practices

1. **Restrict API Key** to specific domains
2. **Monitor usage** in Google Cloud Console
3. **Set up billing alerts**
4. **Use different keys** for development/production

## ⚠️ Common Issues

### **1. "This page didn't load Google Maps correctly"**
- **Cause**: Invalid or restricted API key
- **Fix**: Check API key and restrictions

### **2. "RefererNotAllowedMapError"**
- **Cause**: API key restricted to specific domains
- **Fix**: Add your domain to allowed referrers

### **3. "QuotaExceededError"**
- **Cause**: Exceeded free tier limits
- **Fix**: Check usage in Google Cloud Console

## 🎯 Quick Fix

Replace in `src/components/MapPicker/index.js`:
```javascript
// Line 170
src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap"
```

**Status**: ⚠️ **NEEDS VALID API KEY** - Get your free Google Maps API key! 🚀
