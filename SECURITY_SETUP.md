# 🔒 Security Setup Guide

## ⚠️ **IMPORTANT: API Keys Security**

### **Current Status:**
- ✅ **Midtrans API Keys**: AMAN (hanya di server)
- ❌ **WooCommerce API Keys**: TIDAK AMAN (ter-expose di code)

## 🛠 **Setup Environment Variables:**

### **1. Create .env file:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

### **2. Fill in your actual API keys:**
```env
# WooCommerce API Keys
WOOCOMMERCE_URL=https://doseofbeauty.id/
WOOCOMMERCE_CONSUMER_KEY=ck_your_actual_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_actual_consumer_secret_here

# Google Maps API Key (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### **3. Generate New WooCommerce API Keys:**
1. Login to WordPress Admin: `https://doseofbeauty.id/wp-admin/`
2. Go to **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Click **Add Key**
4. Set **Description**: "Mobile App API Key"
5. Set **User**: Select admin user
6. Set **Permissions**: **Read/Write**
7. Click **Generate API Key**
8. Copy **Consumer Key** and **Consumer Secret**
9. Update `.env` file with new keys

### **4. Revoke Old API Keys:**
1. Go to **WooCommerce** → **Settings** → **Advanced** → **REST API**
2. Find old API keys and click **Revoke**
3. This will invalidate the old keys in the code

## 🚀 **Deployment:**

### **Development:**
- Use `.env` file (already in .gitignore)
- Keys are loaded from environment variables

### **Production:**
- Set environment variables in your hosting platform
- Never commit `.env` file to repository

## 🔍 **Security Best Practices:**

### **1. API Key Rotation:**
- Rotate WooCommerce API keys regularly
- Monitor API usage in WooCommerce dashboard
- Set up alerts for unusual activity

### **2. Access Control:**
- Limit API key permissions to minimum required
- Use separate keys for different environments
- Monitor who has access to production keys

### **3. Code Security:**
- Never hardcode API keys in source code
- Use environment variables for all sensitive data
- Regular security audits

## 📊 **Current Security Status:**

| Component | Status | Location | Action Required |
|-----------|--------|----------|-----------------|
| Midtrans Server Key | ✅ Secure | functions.php | None |
| Midtrans Client Key | ✅ Secure | functions.php | None |
| WooCommerce Consumer Key | ❌ Exposed | Config.js | Rotate & Use .env |
| WooCommerce Consumer Secret | ❌ Exposed | Config.js | Rotate & Use .env |

## 🚨 **Immediate Actions Required:**

1. **Generate new WooCommerce API keys**
2. **Update .env file with new keys**
3. **Revoke old API keys**
4. **Test app with new keys**
5. **Deploy to production with environment variables**

## 📞 **Support:**

If you need help with security setup, contact the development team.
