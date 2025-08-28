# 🚀 Deploy VibeChain to Vercel

**Super easy deployment in 3 minutes!**

---

## **🎯 Why Vercel?**

- ✅ **Easier than Render** - One-click deploy
- ✅ **Free tier** - Perfect for APIs like this
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **Global CDN** - Fast worldwide
- ✅ **GitHub integration** - Auto-deploy on push

---

## **🚀 Deployment Steps**

### **1. Push to GitHub (if not done already)**

```bash
# Add new Vercel files
git add vercel.json DEPLOY_VERCEL.md

# Commit
git commit -m "Add Vercel deployment configuration"

# Push to GitHub (create repo first if needed)
git remote add origin https://github.com/yourusername/vibechain.git
git push -u origin main
```

### **2. Deploy on Vercel**

#### **Option A: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: vibechain
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### **Option B: Vercel Dashboard**

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repo** (vibechain)
4. **Configure:**
   ```
   Framework Preset: Other
   Build Command: npm run vercel-build
   Output Directory: dist
   Install Command: npm install
   ```
5. **Click "Deploy"**

### **3. Get Your Live URL**

Vercel will give you a URL like:
```
https://vibechain-abc123.vercel.app
```

---

## **✅ Test Your Deployed API**

```bash
# Health check
curl https://vibechain-abc123.vercel.app/health

# Test prediction
curl -X POST https://vibechain-abc123.vercel.app/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tracks": [{
      "danceability": 0.8,
      "energy": 0.9,
      "valence": 0.7,
      "tempo": 0.8,
      "acousticness": 0.2,
      "instrumentalness": 0.0,
      "speechiness": 0.1,
      "liveness": 0.1,
      "key": 0.5,
      "loudness": 0.6,
      "mode": 1.0,
      "duration_ms": 0.5,
      "time_signature": 0.8,
      "hour_of_day": 0.5,
      "day_of_week": 0.3,
      "month": 0.4,
      "is_weekend": 0.0,
      "skip_rate": 0.1,
      "repeat_count": 0.2,
      "playlist_position": 0.0
    }]
  }'
```

---

## **🎯 Use in Your Apps**

Update your apps to use the new Vercel URL:

```javascript
// Before (local)
const API_URL = 'http://localhost:8080';

// After (Vercel)
const API_URL = 'https://vibechain-abc123.vercel.app';

// Same API calls work!
const response = await fetch(`${API_URL}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tracks: [trackData] })
});
```

---

## **🔧 Vercel Advantages**

### **🆚 Vercel vs Render:**

| Feature | Vercel | Render |
|---------|--------|---------|
| **Setup** | 1 command | Multiple steps |
| **Deploy time** | ~2 minutes | ~5-10 minutes |
| **Free tier** | Generous | Limited |
| **Auto-deploy** | On git push | Manual/webhook |
| **HTTPS** | Automatic | Automatic |
| **Custom domains** | Easy | Easy |

### **💰 Vercel Pricing:**

- **Free**: Perfect for VibeChain
  - 100GB bandwidth/month
  - Unlimited requests
  - 10 second function timeout
  
- **Pro**: $20/month (if you need more)
  - 1TB bandwidth
  - Advanced analytics

---

## **🔧 Troubleshooting**

### **If deployment fails:**

1. **Check build logs** in Vercel dashboard
2. **Common issues:**
   - TypeScript errors → Run `npm run build` locally first
   - Missing dependencies → Check `package.json`
   - Large files → Vercel has 50MB limit per function

### **If API is slow:**

- **First request** might be slow (cold start)
- **Subsequent requests** are fast (~20ms)
- **Upgrade to Pro** for faster cold starts

### **Model loading issues:**

- **Check model files** are committed to git
- **Verify build logs** show model files included
- **Test health endpoint** first

---

## **🚀 Advanced Features**

### **Custom Domain:**
```bash
# Add your domain in Vercel dashboard
vercel domains add yourdomain.com
```

### **Environment Variables:**
```bash
# Set in Vercel dashboard or CLI
vercel env add SPOTIFY_CLIENT_ID
```

### **Analytics:**
- Built-in performance monitoring
- Request analytics
- Error tracking

---

## **🎉 That's It!**

Your VibeChain API is now:
- 🌍 **Live on the internet**
- 🔒 **Secured with HTTPS**
- ⚡ **Fast global delivery**
- 🚀 **Auto-deploys on git push**

**Share your API URL with the world!** 🎵
