# Deployment Guide for Desi Roots E-commerce

## Quick Deploy to Netlify

### Method 1: Drag & Drop (Fastest)
1. Build your app: `npm run build`
2. Go to https://app.netlify.com
3. Drag the `dist` folder to Netlify dashboard
4. Connect your domain `desiroots.store` in Domain Settings

### Method 2: Connect GitHub Repository (Recommended for Updates)
1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings are already configured in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Once deployed, go to Domain Settings → Add custom domain → `desiroots.store`

## Build Commands
- Development: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Environment
- Node version: 18+ recommended
- Package manager: npm

## Domain Configuration
Your domain `desiroots.store` is already in Netlify. Just connect it to your deployed site:
1. Go to Site Settings → Domain Management
2. Add custom domain: `desiroots.store`
3. Netlify will automatically configure DNS

## Automatic Deployments
If using Git integration, any push to your main branch will automatically deploy to production.

