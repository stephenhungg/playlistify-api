import { AppConfig } from '@/types';
import { parseBoolean, parseNumber } from '@/utils/helpers';
import { validateConfig } from '@/utils/validation';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 */
const config: AppConfig = {
  model: {
    inputDim: parseNumber(process.env.MODEL_INPUT_DIM, 20),
    embedDim: parseNumber(process.env.MODEL_EMBED_DIM, 512),
    numLayers: parseNumber(process.env.MODEL_NUM_LAYERS, 6),
    numHeads: parseNumber(process.env.MODEL_NUM_HEADS, 8),
    hiddenDim: parseNumber(process.env.MODEL_HIDDEN_DIM, 2048),
    dropout: parseNumber(process.env.MODEL_DROPOUT, 0.1),
    maxSequenceLength: parseNumber(process.env.MODEL_MAX_SEQUENCE_LENGTH, 100)
  },

  training: {
    batchSize: parseNumber(process.env.TRAINING_BATCH_SIZE, 32),
    numEpochs: parseNumber(process.env.TRAINING_NUM_EPOCHS, 100),
    learningRate: parseNumber(process.env.TRAINING_LEARNING_RATE, 0.001),
    weightDecay: parseNumber(process.env.TRAINING_WEIGHT_DECAY, 0.01),
    patience: parseNumber(process.env.TRAINING_PATIENCE, 10),
    gradientClip: parseNumber(process.env.TRAINING_GRADIENT_CLIP, 1.0)
  },

  data: {
    sequenceLength: parseNumber(process.env.DATA_SEQUENCE_LENGTH, 50),
    trainSplit: parseNumber(process.env.DATA_TRAIN_SPLIT, 0.8),
    minTracksPerSession: parseNumber(process.env.DATA_MIN_TRACKS_PER_SESSION, 10)
  },

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8080/callback'
  },

  api: {
    port: parseNumber(process.env.PORT || process.env.API_PORT, 8080),
    host: process.env.HOST || process.env.API_HOST || '0.0.0.0',
    corsOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:8080']
  }
};

// Validate configuration
try {
  validateConfig(config);
} catch (error) {
  console.error('Configuration validation failed:', error);
  process.exit(1);
}

export default config;

// Export individual config sections for convenience
export const {
  model: modelConfig,
  training: trainingConfig,
  data: dataConfig,
  spotify: spotifyConfig,
  api: apiConfig
} = config;
