// Vercel serverless function for analyze endpoint
module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
    return;
  }
  
  // Simple mock response for now (we can enhance this later)
  const mockPrediction = {
    success: true,
    data: {
      predictions: {
        mood_prediction: {
          valence: 0.5 + Math.random() * 0.5,
          energy: 0.5 + Math.random() * 0.5,
          arousal: 0.5 + Math.random() * 0.5
        },
        confidence_scores: {
          mood: 0.85,
          next_track: 0.80
        }
      },
      metadata: {
        tracks_analyzed: 1,
        analysis_timestamp: new Date().toISOString(),
        model_version: '1.0.0-vercel'
      }
    },
    processing_time_ms: 15
  };
  
  res.status(200).json(mockPrediction);
};
