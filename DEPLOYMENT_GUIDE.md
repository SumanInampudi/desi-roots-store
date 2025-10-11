# 🚀 Deployment Guide - Desi Roots Store

## ✅ What's Been Configured

1. **Production Environment File** (`.env.production`)
   - Created with API URL: `https://desi-roots-api.onrender.com`

2. **Netlify Configuration** (`netlify.toml`)
   - Build command configured
   - SPA routing redirects set up
   - Environment variable configured

3. **Fresh Production Build**
   - Built with production API URL
   - Ready to deploy

## 📋 Netlify Configuration Steps

### Option 1: Using Netlify UI (Recommended)

1. **Go to your Netlify site dashboard**
   - Navigate to https://app.netlify.com
   - Select your "desiroots" site

2. **Set Environment Variable**
   - Go to **Site configuration** → **Environment variables**
   - Click **Add a variable**
   - Set:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://desi-roots-api.onrender.com`
   - Click **Save**

3. **Redeploy**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**
   - OR simply drag-drop the new `dist` folder

### Option 2: Using netlify.toml (Already Done!)

The `netlify.toml` file has been created with the environment variable. Just:
1. Commit the `netlify.toml` file to your repository
2. Push to your connected Git repo
3. Netlify will auto-deploy with the correct settings

## 🔍 Verify API Connection

Your API is confirmed working:
- **API URL**: https://desi-roots-api.onrender.com
- **Status**: ✅ Active (6 products available)
- **Endpoints Available**:
  - `/products` - 6 items
  - `/users` - 3 items
  - `/orders` - 1004 items
  - `/reviews` - 13 items
  - `/cart` - 0 items
  - `/expenses` - 10 items

## 🐛 Troubleshooting

### If data still doesn't load:

1. **Check Browser Console**
   - Open https://desiroots.store
   - Press F12 to open DevTools
   - Check Console for errors
   - Look for CORS errors or 404s

2. **Verify Environment Variable**
   ```bash
   # In Netlify UI, check if VITE_API_URL is set correctly
   # It MUST start with VITE_ prefix for Vite to expose it
   ```

3. **Check API Endpoints**
   - Visit: https://desi-roots-api.onrender.com/products
   - Should return JSON with 6 products
   - If it returns HTML or error, API needs fixing

4. **Clear Netlify Cache**
   - In Netlify: **Site configuration** → **Build & deploy**
   - Click **Clear cache and deploy site**

5. **Check CORS Headers**
   - Your JSON Server on Render needs to allow requests from desiroots.store
   - JSON Server should handle this automatically, but verify if issues persist

## 📦 Deploy New Build

### Quick Deploy (Drag & Drop):
1. Build locally: `npm run build`
2. Go to Netlify dashboard
3. Drag the `dist` folder to the deploy area

### Git Deploy (Automatic):
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add production environment configuration"
   git push
   ```
2. Netlify will auto-deploy

## ✨ Post-Deployment Checklist

- [ ] Environment variable `VITE_API_URL` is set in Netlify
- [ ] New build deployed with the variable
- [ ] Browser cache cleared (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Products page loads data
- [ ] Reviews section shows testimonials
- [ ] Cart functionality works
- [ ] Orders can be placed
- [ ] Product management accessible (admin only)

## 🔗 Important URLs

- **Production Site**: https://desiroots.store
- **API Server**: https://desi-roots-api.onrender.com
- **Netlify Dashboard**: https://app.netlify.com

## 💡 Notes

- The `.env.production` file is used during build time
- Netlify environment variables override the file values
- Vite only exposes variables prefixed with `VITE_`
- API URL is hardcoded into the build, so rebuild after changes

## 🎯 Expected Result

After following these steps:
1. ✅ https://desiroots.store loads with all design changes
2. ✅ Products display correctly
3. ✅ Reviews rotate every 15 seconds
4. ✅ Cart and orders work
5. ✅ All features functional

---

**Last Updated**: October 2025
**Build Version**: Production with dynamic testimonials
