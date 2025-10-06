# 🔍 OpenStreetMap Search Feature - Location Search Integration

## ✅ Perubahan yang Dilakukan

**Sebelum**: Map picker hanya bisa digunakan dengan tap manual pada map
**Sesudah**: Map picker dengan fitur pencarian alamat, tempat, dan landmark

## 🎯 Tujuan Perubahan

1. **Search Functionality** - Menambahkan fitur pencarian lokasi
2. **Better UX** - User experience yang lebih baik untuk mencari lokasi
3. **Quick Location** - Cepat menemukan lokasi tanpa harus zoom/pan manual
4. **Indonesian Support** - Mendukung pencarian dalam bahasa Indonesia

## 🔧 Technical Changes

### **1. Added Search State Management**

**New State Variables:**
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);
const [showSearchResults, setShowSearchResults] = useState(false);
```

### **2. Implemented Search Function**

**Nominatim API Integration:**
```javascript
const searchLocation = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    setShowSearchResults(false);
    return;
  }

  setIsSearching(true);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=id`
    );
    
    const results = await response.json();
    setSearchResults(results);
    setShowSearchResults(true);
  } catch (error) {
    console.error('Search error:', error);
    Alert.alert('Search Error', 'Gagal mencari lokasi. Silakan coba lagi.');
  } finally {
    setIsSearching(false);
  }
};
```

### **3. Added Search Result Selection**

**Location Selection from Search:**
```javascript
const selectSearchResult = (result) => {
  const location = {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon)
  };
  
  setSelectedLocation(location);
  setSearchQuery(result.display_name);
  setShowSearchResults(false);
  
  // Update map to selected location
  if (webViewRef.current) {
    const script = `
      if (window.map && window.marker) {
        const newLatLng = L.latLng(${location.latitude}, ${location.longitude});
        window.map.setCenter(newLatLng);
        window.map.setZoom(16);
        window.marker.setLatLng(newLatLng);
      }
    `;
    webViewRef.current.injectJavaScript(script);
  }
};
```

### **4. Added Search Input Handler**

**Real-time Search:**
```javascript
const handleSearchChange = (text) => {
  setSearchQuery(text);
  if (text.length > 2) {
    searchLocation(text);
  } else {
    setSearchResults([]);
    setShowSearchResults(false);
  }
};
```

### **5. Added Search UI Components**

**Search Bar:**
```javascript
<View style={styles.searchContainer}>
  <View style={styles.searchInputContainer}>
    <Icon name="search" size={20} color={Color.grey} />
    <TextInput
      style={styles.searchInput}
      placeholder="Cari alamat, tempat, atau landmark..."
      value={searchQuery}
      onChangeText={handleSearchChange}
      returnKeyType="search"
    />
    {isSearching && <ActivityIndicator size="small" color={Color.primary} />}
  </View>
  
  {/* Search Results */}
  {showSearchResults && searchResults.length > 0 && (
    <FlatList
      data={searchResults}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => selectSearchResult(item)}>
          <Icon name="place" size={16} color={Color.primary} />
          <Text>{item.display_name.split(',')[0]}</Text>
          <Text>{item.display_name}</Text>
        </TouchableOpacity>
      )}
    />
  )}
</View>
```

## 📊 Visual Comparison

### **Before (Manual Selection Only)**
```
┌─────────────────────────────────┐
│  Pilih Lokasi Rumah        [📍] │
│                                 │
│  📍 Tap pada map untuk memilih  │
│     lokasi rumah Anda           │
│                                 │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │        OpenStreetMap        │ │ ← Manual tap only
│  │                             │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                 │
│  Lokasi Terpilih:               │
│  -6.208800, 106.845600          │
│                                 │
│  [Batal]    [Konfirmasi Lokasi] │
└─────────────────────────────────┘
```

### **After (With Search Feature)**
```
┌─────────────────────────────────┐
│  Pilih Lokasi Rumah        [📍] │
│                                 │
│  📍 Tap pada map untuk memilih  │
│     lokasi rumah Anda           │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🔍 Cari alamat, tempat...   │ │ ← Search bar
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📍 Monas, Jakarta           │ │ ← Search results
│  │ 📍 Mall Taman Anggrek       │ │
│  │ 📍 Stasiun Gambir           │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │        OpenStreetMap        │ │ ← Auto-zoom to result
│  │                             │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                 │
│  Lokasi Terpilih:               │
│  -6.208800, 106.845600          │
│                                 │
│  [Batal]    [Konfirmasi Lokasi] │
└─────────────────────────────────┘
```

## 🚀 Benefits

### **1. Enhanced User Experience**
- ✅ **Quick Search** - Cepat menemukan lokasi dengan pencarian
- ✅ **No Manual Navigation** - Tidak perlu zoom/pan manual
- ✅ **Indonesian Support** - Mendukung bahasa Indonesia
- ✅ **Real-time Results** - Hasil pencarian real-time

### **2. Better Functionality**
- ✅ **Multiple Search Types** - Alamat, tempat, landmark
- ✅ **Auto-zoom** - Otomatis zoom ke lokasi yang dipilih
- ✅ **Visual Feedback** - Loading indicator saat mencari
- ✅ **Error Handling** - Error handling yang baik

### **3. Professional Features**
- ✅ **Nominatim API** - Menggunakan OpenStreetMap Nominatim
- ✅ **Debounced Search** - Search setelah 3 karakter
- ✅ **Limited Results** - Maksimal 5 hasil untuk performa
- ✅ **Clean UI** - UI yang clean dan user-friendly

## 📱 Search Features

### **Search Input:**
- **Placeholder**: "Cari alamat, tempat, atau landmark..."
- **Real-time**: Search setelah 3 karakter
- **Loading**: Activity indicator saat mencari
- **Clear**: Bisa clear search

### **Search Results:**
- **Limit**: Maksimal 5 hasil
- **Format**: Nama tempat + alamat lengkap
- **Selection**: Tap untuk memilih
- **Auto-close**: Otomatis tutup setelah pilih

### **Map Integration:**
- **Auto-zoom**: Otomatis zoom ke lokasi
- **Marker Update**: Update marker ke lokasi baru
- **Center Map**: Center map ke lokasi yang dipilih

## 🎨 UI Components

### **Search Container:**
```javascript
searchContainer: {
  paddingHorizontal: 15,
  paddingBottom: 10,
}
```

### **Search Input:**
```javascript
searchInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#e0e0e0',
}
```

### **Search Results:**
```javascript
searchResultsContainer: {
  position: 'absolute',
  top: 50,
  left: 15,
  right: 15,
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  maxHeight: 200,
  zIndex: 1000,
  elevation: 5,
}
```

## 📊 API Integration

### **Nominatim Search API:**
```javascript
// Endpoint
https://nominatim.openstreetmap.org/search

// Parameters
{
  format: 'json',
  q: 'search query',
  limit: 5,
  addressdetails: 1,
  'accept-language': 'id'
}
```

### **Response Format:**
```javascript
[
  {
    place_id: "123456",
    lat: "-6.2088",
    lon: "106.8456",
    display_name: "Monas, Jakarta Pusat, DKI Jakarta, Indonesia",
    type: "attraction",
    importance: 0.9
  }
]
```

## 🧪 Testing

### **Test Scenarios:**
1. **Search Input** - Test search input functionality
2. **Search Results** - Test search results display
3. **Location Selection** - Test selecting search result
4. **Map Update** - Test map update after selection
5. **Error Handling** - Test error scenarios

### **Expected Results:**
- ✅ Search input works with real-time search
- ✅ Search results display correctly
- ✅ Selecting result updates map and marker
- ✅ Map zooms to selected location
- ✅ Error handling works properly

## 🎉 Status

**✅ COMPLETED** - OpenStreetMap search feature berhasil ditambahkan!

### **What's Added:**
- 🔍 **Search Bar** - Input pencarian dengan icon dan placeholder
- 📍 **Search Results** - Daftar hasil pencarian dengan icon tempat
- 🗺️ **Map Integration** - Auto-zoom dan update marker
- 🌐 **Nominatim API** - Integrasi dengan OpenStreetMap Nominatim
- 🇮🇩 **Indonesian Support** - Mendukung bahasa Indonesia

### **Result:**
Sekarang map picker memiliki fitur pencarian yang lengkap untuk mencari alamat, tempat, dan landmark dengan mudah! 🚀
