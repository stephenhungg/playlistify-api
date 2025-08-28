import Joi from 'joi';
import { AnalyzeRequest, TrackFeatures, ValidationError } from '@/types';

// Track features validation schema
const trackFeaturesSchema = Joi.object({
  danceability: Joi.number().min(0).max(1).required(),
  energy: Joi.number().min(0).max(1).required(),
  key: Joi.number().min(0).max(1).required(),
  loudness: Joi.number().min(0).max(1).required(),
  mode: Joi.number().min(0).max(1).required(),
  speechiness: Joi.number().min(0).max(1).required(),
  acousticness: Joi.number().min(0).max(1).required(),
  instrumentalness: Joi.number().min(0).max(1).required(),
  liveness: Joi.number().min(0).max(1).required(),
  valence: Joi.number().min(0).max(1).required(),
  tempo: Joi.number().min(0).max(1).required(),
  duration_ms: Joi.number().min(0).max(1).required(),
  time_signature: Joi.number().min(0).max(1).required(),
  hour_of_day: Joi.number().min(0).max(1).required(),
  day_of_week: Joi.number().min(0).max(1).required(),
  month: Joi.number().min(0).max(1).required(),
  is_weekend: Joi.number().min(0).max(1).required(),
  skip_rate: Joi.number().min(0).max(1).required(),
  repeat_count: Joi.number().min(0).max(1).required(),
  playlist_position: Joi.number().min(0).max(1).required()
});

// Analyze request validation schema
const analyzeRequestSchema = Joi.object({
  tracks: Joi.array().items(trackFeaturesSchema).min(1).max(100).required(),
  options: Joi.object({
    include_insights: Joi.boolean().default(true),
    include_embeddings: Joi.boolean().default(false),
    model_version: Joi.string().default('1.0.0')
  }).optional()
});

/**
 * Validate analyze request
 */
export const validateAnalyzeRequest = (data: any): AnalyzeRequest => {
  const { error, value } = analyzeRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new ValidationError(`Validation failed: ${errorMessage}`);
  }

  return value as AnalyzeRequest;
};

/**
 * Validate track features
 */
export const validateTrackFeatures = (data: any): TrackFeatures => {
  const { error, value } = trackFeaturesSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new ValidationError(`Track features validation failed: ${errorMessage}`);
  }

  return value as TrackFeatures;
};

/**
 * Validate array of track features
 */
export const validateTrackFeaturesArray = (data: any[]): TrackFeatures[] => {
  if (!Array.isArray(data)) {
    throw new ValidationError('Expected an array of track features');
  }

  return data.map((track, index) => {
    try {
      return validateTrackFeatures(track);
    } catch (error) {
      throw new ValidationError(`Track ${index}: ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  });
};

/**
 * Validate Spotify access token format
 */
export const validateSpotifyToken = (token: string): boolean => {
  // Basic validation - Spotify tokens are usually base64-like strings
  const tokenRegex = /^[A-Za-z0-9_-]+$/;
  return tokenRegex.test(token) && token.length > 50;
};

/**
 * Validate model path
 */
export const validateModelPath = (path: string): boolean => {
  // Basic path validation
  const pathRegex = /^[a-zA-Z0-9/_.-]+$/;
  return pathRegex.test(path) && !path.includes('..');
};

/**
 * Validate batch size
 */
export const validateBatchSize = (size: number): boolean => {
  return Number.isInteger(size) && size > 0 && size <= 1000;
};

/**
 * Validate learning rate
 */
export const validateLearningRate = (rate: number): boolean => {
  return typeof rate === 'number' && rate > 0 && rate < 1;
};

/**
 * Validate sequence length
 */
export const validateSequenceLength = (length: number): boolean => {
  return Number.isInteger(length) && length >= 5 && length <= 200;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string, maxLength = 1000): string => {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string');
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, ''); // Remove potentially harmful characters
};

/**
 * Validate and sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') {
    throw new ValidationError('Filename must be a string');
  }
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters with underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .slice(0, 255); // Limit length
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailSchema = Joi.string().email().required();
  const { error } = emailSchema.validate(email);
  return !error;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  const urlSchema = Joi.string().uri().required();
  const { error } = urlSchema.validate(url);
  return !error;
};

/**
 * Validate port number
 */
export const validatePort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * Validate environment
 */
export const validateEnvironment = (env: string): boolean => {
  const validEnvironments = ['development', 'testing', 'staging', 'production'];
  return validEnvironments.includes(env);
};

/**
 * Generic object validation with Joi schema
 */
export const validateWithSchema = <T>(data: any, schema: Joi.ObjectSchema): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new ValidationError(`Validation failed: ${errorMessage}`);
  }

  return value as T;
};

/**
 * Validate configuration object
 */
export const validateConfig = (config: any): void => {
  const configSchema = Joi.object({
    model: Joi.object({
      inputDim: Joi.number().integer().min(1).required(),
      embedDim: Joi.number().integer().min(1).required(),
      numLayers: Joi.number().integer().min(1).max(20).required(),
      numHeads: Joi.number().integer().min(1).max(16).required(),
      hiddenDim: Joi.number().integer().min(1).required(),
      dropout: Joi.number().min(0).max(0.9).required(),
      maxSequenceLength: Joi.number().integer().min(1).max(1000).required()
    }).required(),
    
    training: Joi.object({
      batchSize: Joi.number().integer().min(1).max(1000).required(),
      numEpochs: Joi.number().integer().min(1).required(),
      learningRate: Joi.number().min(0).max(1).required(),
      weightDecay: Joi.number().min(0).max(1).required(),
      patience: Joi.number().integer().min(1).required(),
      gradientClip: Joi.number().min(0).required()
    }).required(),
    
    data: Joi.object({
      sequenceLength: Joi.number().integer().min(1).max(200).required(),
      trainSplit: Joi.number().min(0.1).max(0.9).required(),
      minTracksPerSession: Joi.number().integer().min(1).required()
    }).required(),
    
    spotify: Joi.object({
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      redirectUri: Joi.string().uri().required()
    }).required(),
    
    api: Joi.object({
      port: Joi.number().integer().min(1).max(65535).required(),
      host: Joi.string().required(),
      corsOrigins: Joi.array().items(Joi.string()).required()
    }).required()
  });

  const { error } = configSchema.validate(config);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new ValidationError(`Configuration validation failed: ${errorMessage}`);
  }
};
