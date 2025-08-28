# VibeChain API Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:8080`  
**Content-Type**: `application/json`

---

## **🚀 Overview**

VibeChain is a neural network-powered music recommendation API that predicts the optimal next song based on current track features and listening patterns.

**What it does**: Give it a song's audio features → Get back what the next song's vibe should be.

---

## **📡 Endpoints**

### **1. Health Check**

**GET** `/health`

Check if the API is running and model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "uptime_seconds": 123.45,
  "memory_usage": {
    "used": 46517464,
    "total": 68550656
  }
}
```

**Status Codes:**
- `200` - API is healthy
- `500` - API is down

---

### **2. Analyze Tracks (Main Endpoint)**

**POST** `/analyze`

Get music recommendations based on track features.

**Request Body:**
```json
{
  "tracks": [
    {
      "danceability": 0.735,
      "energy": 0.578,
      "key": 0.455,
      "loudness": 0.803,
      "mode": 1.0,
      "speechiness": 0.0461,
      "acousticness": 0.514,
      "instrumentalness": 0.0902,
      "liveness": 0.159,
      "valence": 0.624,
      "tempo": 0.49,
      "duration_ms": 0.346,
      "time_signature": 0.571,
      "hour_of_day": 0.75,
      "day_of_week": 0.286,
      "month": 0.667,
      "is_weekend": 0.0,
      "skip_rate": 0.05,
      "repeat_count": 0.2,
      "playlist_position": 0.3
    }
  ],
  "options": {
    "include_insights": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": {
      "mood_prediction": {
        "valence": 0.503,
        "energy": 0.651,
        "arousal": 0.597
      },
      "pattern_embedding": [0.503, 0.651, 0.597],
      "next_track_prediction": {
        "valence": 0.503,
        "energy": 0.651,
        "danceability": 0.597
      },
      "confidence_scores": {
        "mood": 0.85,
        "next_track": 0.80
      }
    },
    "metadata": {
      "tracks_analyzed": 1,
      "analysis_timestamp": "2025-08-28T07:31:25.974Z",
      "model_version": "1.0.0"
    }
  },
  "processing_time_ms": 20
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error (missing/invalid fields)
- `500` - Model error or server error

---

### **3. Model Information**

**GET** `/model/info`

Get information about the loaded model.

**Response:**
```json
{
  "success": true,
  "data": {
    "model_loaded": true,
    "model_type": "SimpleSpotifyModel",
    "input_features": 20,
    "output_features": 3
  },
  "processing_time_ms": 2
}
```

**Status Codes:**
- `200` - Success
- `404` - No model loaded

---

## **📊 Data Schemas**

### **Track Features (Input)**

All values must be normalized to 0-1 range:

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `danceability` | float | 0-1 | How suitable for dancing |
| `energy` | float | 0-1 | Perceptual intensity and power |
| `key` | float | 0-1 | Musical key (normalized) |
| `loudness` | float | 0-1 | Overall loudness (normalized) |
| `mode` | float | 0-1 | Major (1) or minor (0) |
| `speechiness` | float | 0-1 | Presence of spoken words |
| `acousticness` | float | 0-1 | Acoustic vs electronic |
| `instrumentalness` | float | 0-1 | Contains vocals (0) vs instrumental (1) |
| `liveness` | float | 0-1 | Presence of live audience |
| `valence` | float | 0-1 | Musical positivity (0=sad, 1=happy) |
| `tempo` | float | 0-1 | Tempo (normalized BPM) |
| `duration_ms` | float | 0-1 | Track duration (normalized) |
| `time_signature` | float | 0-1 | Time signature (normalized) |
| `hour_of_day` | float | 0-1 | Hour when played (0=midnight, 1=noon) |
| `day_of_week` | float | 0-1 | Day (0=Monday, 1=Sunday) |
| `month` | float | 0-1 | Month (0=January, 1=December) |
| `is_weekend` | float | 0-1 | Weekend (0=weekday, 1=weekend) |
| `skip_rate` | float | 0-1 | How often user skips this track |
| `repeat_count` | float | 0-1 | How often user repeats this track |
| `playlist_position` | float | 0-1 | Position in playlist (0=start, 1=end) |

### **Prediction Output**

| Field | Type | Description |
|-------|------|-------------|
| `mood_prediction` | object | Next track's predicted mood |
| `mood_prediction.valence` | float | Predicted happiness (0-1) |
| `mood_prediction.energy` | float | Predicted energy level (0-1) |
| `mood_prediction.arousal` | float | Predicted danceability (0-1) |
| `next_track_prediction` | object | Full next track feature prediction |
| `confidence_scores` | object | Model confidence levels |
| `confidence_scores.mood` | float | Confidence in mood prediction |
| `confidence_scores.next_track` | float | Confidence in track prediction |
| `pattern_embedding` | array | Numerical representation of patterns |

---

## **🔧 Integration Examples**

### **JavaScript/Fetch**
```javascript
const response = await fetch('http://localhost:8080/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tracks: [trackFeatures]
  })
});

const result = await response.json();
if (result.success) {
  const nextVibe = result.data.predictions.mood_prediction;
  console.log(`Next song should be ${nextVibe.energy * 100}% energy`);
}
```

### **Python/Requests**
```python
import requests

response = requests.post('http://localhost:8080/analyze', 
    json={'tracks': [track_features]})

if response.json()['success']:
    prediction = response.json()['data']['predictions']['mood_prediction']
    print(f"Next song: {prediction['valence']} valence, {prediction['energy']} energy")
```

### **cURL**
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tracks": [{
      "danceability": 0.8,
      "energy": 0.9,
      "valence": 0.7,
      ...
    }]
  }'
```

---

## **🚦 Error Handling**

### **Validation Errors (400)**
```json
{
  "success": false,
  "error": "Validation failed: \"tracks[0].danceability\" is required",
  "processing_time_ms": 5
}
```

### **Model Errors (500)**
```json
{
  "success": false,
  "error": "No model loaded",
  "processing_time_ms": 2
}
```

### **Server Errors (500)**
```json
{
  "success": false,
  "error": "Internal server error",
  "processing_time_ms": 10
}
```

---

## **⚡ Performance**

- **Response Time**: ~20ms average
- **Throughput**: 1000+ requests/minute
- **Model Size**: ~500KB
- **Memory Usage**: ~50MB

---

## **🔒 Rate Limiting**

Currently no rate limiting implemented. Recommended for production:
- 1000 requests per minute per IP
- 10,000 requests per hour per API key

---

## **🎯 Data Conversion Helpers**

### **From Spotify Web API**
```javascript
function spotifyToVibeChain(spotify) {
  return {
    danceability: spotify.danceability,
    energy: spotify.energy,
    valence: spotify.valence,
    speechiness: spotify.speechiness,
    acousticness: spotify.acousticness,
    instrumentalness: spotify.instrumentalness,
    liveness: spotify.liveness,
    key: spotify.key / 11,
    loudness: (spotify.loudness + 60) / 60,
    mode: spotify.mode,
    tempo: Math.min(spotify.tempo / 200, 1),
    duration_ms: Math.min(spotify.duration_ms / 600000, 1),
    time_signature: spotify.time_signature / 7,
    hour_of_day: new Date().getHours() / 24,
    day_of_week: new Date().getDay() / 7,
    month: new Date().getMonth() / 12,
    is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
    skip_rate: 0.1,  // Default values
    repeat_count: 0.1,
    playlist_position: 0.5
  };
}
```

### **Basic Song Info to Features**
```javascript
function estimateFeatures(genre, mood = 'neutral') {
  const genres = {
    'electronic': { danceability: 0.8, energy: 0.7, valence: 0.6 },
    'rock': { danceability: 0.6, energy: 0.8, valence: 0.5 },
    'pop': { danceability: 0.7, energy: 0.6, valence: 0.7 },
    'classical': { danceability: 0.2, energy: 0.4, valence: 0.5 },
    'hip-hop': { danceability: 0.9, energy: 0.7, valence: 0.6 }
  };
  
  const base = genres[genre] || genres['pop'];
  
  // Adjust for mood
  if (mood === 'happy') base.valence = Math.min(1, base.valence + 0.3);
  if (mood === 'sad') base.valence = Math.max(0, base.valence - 0.3);
  
  return {
    ...base,
    // Fill in reasonable defaults for other fields
    key: Math.random(),
    loudness: 0.5,
    mode: 1,
    speechiness: 0.1,
    acousticness: genre === 'classical' ? 0.9 : 0.3,
    instrumentalness: 0.1,
    liveness: 0.1,
    tempo: 0.5,
    duration_ms: 0.5,
    time_signature: 0.8,
    hour_of_day: new Date().getHours() / 24,
    day_of_week: new Date().getDay() / 7,
    month: new Date().getMonth() / 12,
    is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
    skip_rate: 0.1,
    repeat_count: 0.1,
    playlist_position: 0.5
  };
}
```

---

## **🎵 Use Cases**

1. **Music Streaming Apps** - Auto-generate playlists with smooth transitions
2. **DJ Software** - Maintain energy flow and crowd engagement
3. **Music Discovery** - Find songs that match desired mood progression
4. **Workout Apps** - Build playlists that match exercise intensity
5. **Mood-based Music** - Create therapeutic or emotional playlists

---

## **📞 Support**

- **GitHub**: [github.com/stephenhung/vibechain](https://github.com/stephenhung/vibechain)
- **Issues**: Report bugs and feature requests on GitHub
- **Model Training**: Use `npm run train` to retrain with new data

**Built with ❤️ and TensorFlow.js**
