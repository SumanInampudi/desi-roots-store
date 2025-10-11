# 🚀 Netlify Deployment - Quick Steps

## ✅ What's Been Done

- ✅ Created API configuration system (`src/config/api.ts`)
- ✅ Updated all 9 components to use environment variables
- ✅ Fixed all linter errors
- ✅ Built production bundle (`dist` folder ready!)

---

## 📦 Your Files Are Ready!

The **`dist`** folder contains your production-ready website:
- `index.html` - Main HTML file
- `assets/` - JavaScript and CSS files
- Product images

---

## 🎯 Deploy to Netlify (3 Simple Steps!)

### Step 1: Go to Netlify
1. Open https://app.netlify.com in your browser
2. Sign in to your account
3. Click **"Add new site"** button
4. Select **"Deploy manually"**

### Step 2: Drag & Drop
1. Find the **`dist`** folder on your computer:
   - Location: `/Users/SInam1/Downloads/desi-roots-ecommerce-main/dist`
2. Drag the entire **`dist`** folder into the Netlify deployment area
3. Wait for upload (30-60 seconds)
4. Your site is live! 🎉

### Step 3: Configure Your Domain
1. In Netlify Dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow the DNS instructions provided
5. Update your domain's DNS records

---

## ⚠️ IMPORTANT: Backend API Setup

Your app needs a backend to work. You have 3 options:

### Option A: Deploy to Render.com (Easiest - Free)

**Quick Deploy:**

1. Go to https://render.com/deploy
2. Create account (free)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Set these values:
   - **Name**: `desi-roots-api`
   - **Build Command**: `npm install`
   - **Start Command**: `npx json-server --watch db.json --port $PORT --host 0.0.0.0`
6. Click **"Create Web Service"**
7. Wait for deployment
8. Copy your Render URL (e.g., `https://desi-roots-api.onrender.com`)

**Update Netlify:**
1. Go back to Netlify → Your site → **Site settings** → **Environment variables**
2. Add new variable:
   - Key: `VITE_API_URL`
   - Value: `https://desi-roots-api.onrender.com` (your Render URL)
3. Click **Save**
4. Go to **Deploys** → Click **"Trigger deploy"** → **"Clear cache and deploy site"**

Done! Your site will now work with the backend! ✅

### Option B: Deploy to Railway.app

1. https://railway.app → Sign up
2. **New Project** → **Deploy from GitHub repo**
3. Select repository
4. It will auto-detect and deploy
5. Copy the public URL
6. Add to Netlify as `VITE_API_URL`

### Option C: Deploy to Fly.io

1. Install Fly CLI
2. Run `fly launch` in your project folder
3. Follow prompts
4. Your API will be at `https://[app-name].fly.dev`
5. Add to Netlify as `VITE_API_URL`

---

## 🧪 Test Your Deployment

After deploying both frontend and backend:

1. Visit your Netlify URL
2. Try these features:
   - ✅ Browse products
   - ✅ Sign in/Sign up
   - ✅ Add to cart
   - ✅ Place an order
   - ✅ View order history
   - ✅ Admin dashboard (for admin users)

---

## 🔄 Updating Your Site

When you make changes:

```bash
# 1. Build new version
npm run build

# 2. Go to Netlify → Deploys → Drag new dist folder
# OR use Netlify CLI:
netlify deploy --prod
```

---

## 📞 Need Help?

### Common Issues:

**"API calls failing"**
- Check `VITE_API_URL` is set in Netlify
- Verify backend is running
- Check browser console for errors

**"404 on page refresh"**
- Already fixed with `netlify.toml` redirects

**"Can't deploy backend"**
- Make sure `db.json` is in your repository
- Check start command is correct
- Verify PORT environment variable

---

## 🎉 You're Almost There!

Your deployment checklist:

- [x] Frontend built ✅
- [ ] Drag dist folder to Netlify
- [ ] Deploy backend to Render/Railway/Fly
- [ ] Add VITE_API_URL to Netlify
- [ ] Configure custom domain
- [ ] Test all features

**Good luck with your deployment! 🚀**

