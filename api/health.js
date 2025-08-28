// Vercel serverless function for health check
module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    model_loaded: true,
    timestamp: new Date().toISOString(),
    vercel_deployment: true
  });
};
