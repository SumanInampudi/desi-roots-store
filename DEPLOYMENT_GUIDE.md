# Netlify Deployment Guide - Desi Roots E-commerce

## 🚀 Quick Deployment Steps (Method B - Manual Deploy)

### Step 1: Build Your Project

Your project is now ready to build! Run:

```bash
npm run build
```

This will create a `dist` folder with all your production files.

### Step 2: Deploy to Netlify (Drag & Drop)

1. Go to https://app.netlify.com
2. Sign in to your Netlify account
3. Click **"Add new site"** → **"Deploy manually"**
4. Drag and drop your **`dist`** folder onto the deployment area
5. Wait for deployment to complete (usually 30-60 seconds)

### Step 3: Configure Environment Variable

⚠️ **IMPORTANT**: Your app needs a backend API to work properly.

After deployment, you need to:

1. In Netlify Dashboard → Go to **Site settings** → **Environment variables**
2. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend API URL (see Backend Options below)
3. Click **"Redeploy"** after adding the environment variable

### Step 4: Set Up Custom Domain

1. In Netlify Dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow Netlify's DNS configuration instructions
5. Update your domain's DNS records as instructed

---

## 🔧 Backend API Options

Your application currently uses `json-server` which requires a backend server. Choose one option:

### Option 1: Deploy Backend to Render.com (Recommended - Free)

1. Create a new account at https://render.com
2. Create a new **Web Service**
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npx json-server --watch db.json --port $PORT --host 0.0.0.0`
5. Add environment variable in Render:
   - Key: `PORT`
   - Value: `3001`
6. Deploy and copy your Render URL
7. Use this URL as your `VITE_API_URL` in Netlify

### Option 2: Deploy Backend to Railway.app

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository
5. Add start command: `npx json-server --watch db.json --port $PORT --host 0.0.0.0`
6. Railway will provide a public URL
7. Use this URL as your `VITE_API_URL` in Netlify

### Option 3: Deploy Backend to Fly.io

1. Install Fly CLI: `brew install flyctl` (Mac) or see https://fly.io/docs/hands-on/install-flyctl/
2. Create `fly.toml` in your project root:

```toml
app = "desi-roots-api"

[build]

[deploy]
  release_command = "npm install"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[services]]
  internal_port = 3001
  protocol = "tcp"

  [[services.ports]]
    port = 80

  [[services.ports]]
    port = 443
```

3. Run: `fly launch`
4. Run: `fly deploy`
5. Your API will be available at `https://desi-roots-api.fly.dev`

---

## 📝 Environment Variables Reference

### Development (.env.local)
```
VITE_API_URL=http://localhost:3001
```

### Production (Netlify)
```
VITE_API_URL=https://your-backend-url.com
```

---

## ✅ Deployment Checklist

Before deploying, make sure:

- [x] API configuration is set up (`src/config/api.ts`)
- [x] All components use `API_URL` from config
- [x] Linter errors are fixed
- [ ] Backend is deployed and accessible
- [ ] Environment variable `VITE_API_URL` is set in Netlify
- [ ] Custom domain DNS is configured (if applicable)
- [ ] Test the deployed site thoroughly

---

## 🔄 Redeployment

After making changes:

1. Build again: `npm run build`
2. In Netlify → **Deploys** → Drag new `dist` folder to deployment area
3. Or use Netlify CLI: `netlify deploy --prod`

---

## 🆘 Troubleshooting

### API Calls Failing
- Check that `VITE_API_URL` is set correctly in Netlify
- Verify backend is running and accessible
- Check browser console for CORS errors

### 404 Errors on Page Refresh
- Already configured in `netlify.toml` with redirects

### Build Fails
- Delete `node_modules` and `dist`
- Run `npm install` again
- Run `npm run build` again

---

## 📞 Support

If you need help:
1. Check Netlify deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure backend API is accessible

---

## 🎉 Success!

Once deployed, your site will be live at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://yourdomain.com` (after DNS configuration)

Congratulations on deploying Desi Roots E-commerce! 🚀

