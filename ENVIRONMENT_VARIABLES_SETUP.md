# Environment Variables Setup for Vercel

## 🔐 Required Environment Variables

Add these environment variables in your Vercel project settings:

### Gmail API OAuth Configuration
- `GMAIL_CLIENT_ID` - Your Google OAuth Client ID (from Google Cloud Console)
- `GMAIL_CLIENT_SECRET` - Your Google OAuth Client Secret (from Google Cloud Console)  
- `GMAIL_REDIRECT_URI` - OAuth redirect URI (https://webappinsurance.vercel.app/auth/google/callback)

### Gmail API Tokens (Optional - for demo enhancement)
- `GMAIL_ACCESS_TOKEN` - Access token for Gmail API (if available)
- `GMAIL_REFRESH_TOKEN` - Refresh token for Gmail API (if available)

### Google Services Configuration
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email for Google APIs
- `GOOGLE_SHEETS_ID` - Google Sheets document ID
- `GOOGLE_SHEETS_RANGE` - Default range for Google Sheets operations

### Email Configuration
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_ACCOUNT_SID` - Twilio account SID

## 📋 How to Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `webappinsurance`

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Select "Environment Variables" from the sidebar

3. **Add Each Variable**
   - Click "Add New" for each environment variable
   - Enter the name (e.g., `GMAIL_CLIENT_ID`)
   - Enter the value (your actual Client ID)
   - Select environments: Production, Preview, Development
   - Click "Save"

## 🎯 For OAuth Demo

The most critical variables for the OAuth demo are:
- `GMAIL_CLIENT_ID` - **REQUIRED** for OAuth flow
- `GMAIL_CLIENT_SECRET` - **REQUIRED** for token exchange
- `GMAIL_REDIRECT_URI` - **REQUIRED** for OAuth redirect

## 🚀 Deployment Process

1. Set all environment variables in Vercel
2. Push your code to repository
3. Vercel will automatically deploy with environment variables
4. The OAuth demo will use these variables securely

## 🔒 Security Best Practices

- ✅ Never commit sensitive data to Git
- ✅ Use environment variables for all secrets
- ✅ Different values for development/production
- ✅ Rotate credentials regularly
- ✅ Monitor access logs

## 🧪 Testing

After setting environment variables:
1. Deploy to Vercel
2. Visit: https://webappinsurance.vercel.app/oauth-demo-vercel.html
3. Test OAuth flow with real credentials
4. Verify all functionality works 