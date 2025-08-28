# 🚀 Deploy VibeChain to Render

**Super easy cloud deployment in 5 minutes!**

---

## **📋 Prerequisites**

1. GitHub account
2. Render account (free): [render.com](https://render.com)

---

## **🚀 Deployment Steps**

### **1. Push to GitHub**

```bash
# Initialize git repo (if not already done)
git init
git add .
git commit -m "VibeChain ready for deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/vibechain.git
git branch -M main
git push -u origin main
```

### **2. Deploy on Render**

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repo** (vibechain)
4. **Fill in these settings:**

   ```
   Name: vibechain-api
   Environment: Docker
   Region: Oregon (or closest to you)
   Branch: main
   Dockerfile Path: ./Dockerfile
   ```

5. **Set Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 8080
   ```

6. **Click "Create Web Service"**

### **3. Wait for Deploy**

Render will:
- Build your Docker container
- Deploy it to the cloud
- Give you a URL like: `https://vibechain-api.onrender.com`

**Deploy time: ~5-10 minutes**

---

## **✅ Test Your Deployed API**

Once deployed, test it:

```bash
# Health check
curl https://vibechain-api.onrender.com/health

# Test prediction
curl -X POST https://vibechain-api.onrender.com/analyze \
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

Update your apps to use the new URL:

```javascript
// Before (local)
const API_URL = 'http://localhost:8080';

// After (deployed)
const API_URL = 'https://vibechain-api.onrender.com';

// Same API calls work!
const response = await fetch(`${API_URL}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tracks: [trackData] })
});
```

---

## **💰 Cost**

- **Render Free Tier**: $0/month
  - Your app sleeps after 15 minutes of inactivity
  - Wakes up in ~30 seconds when someone calls it
  - Perfect for development/testing

- **Render Paid**: $7/month
  - Always running (no sleep)
  - Better for production apps

---

## **🔧 Troubleshooting**

### **If deployment fails:**

1. **Check the build logs** in Render dashboard
2. **Common issues:**
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Run `npm run build` locally first
   - Port issues → Make sure `PORT=8080` in environment variables

### **If API doesn't respond:**

1. **Check health endpoint** first: `https://your-app.onrender.com/health`
2. **Check Render logs** for errors
3. **Verify environment variables** are set correctly

---

## **🚀 Next Steps**

1. **Custom Domain**: Add your own domain in Render dashboard
2. **HTTPS**: Automatically enabled by Render
3. **Monitoring**: Set up alerts for when your API goes down
4. **Scaling**: Upgrade to paid plan for better performance

**Your VibeChain API is now live on the internet! 🌍**
