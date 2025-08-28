// Core types for the listening history analyzer

export interface TrackFeatures {
  // Spotify audio features
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
  
  // Temporal features
  hour_of_day: number;
  day_of_week: number;
  month: number;
  is_weekend: number;
  
  // Behavioral features
  skip_rate: number;
  repeat_count: number;
  playlist_position: number;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  played_at: Date;
  duration_ms: number;
  popularity: number;
  features?: TrackFeatures | SpotifyAudioFeatures;
}

export interface ListeningSession {
  tracks: Track[];
  start_time: Date;
  end_time: Date;
  session_id: string;
}

export interface ModelPredictions {
  mood_prediction: {
    valence: number;
    energy: number;
    arousal: number;
  };
  pattern_embedding: number[];
  next_track_prediction: Partial<TrackFeatures>;
  confidence_scores: {
    mood: number;
    next_track: number;
  };
}

export interface ListeningInsights {
  mood: string;
  energy: string;
  timing: string;
  diversity: string;
  patterns: string[];
}

export interface AnalysisResult {
  predictions: ModelPredictions;
  insights: ListeningInsights;
  metadata: {
    tracks_analyzed: number;
    analysis_timestamp: Date;
    model_version: string;
  };
}

// Configuration types
export interface ModelConfig {
  inputDim: number;
  embedDim: number;
  numLayers: number;
  numHeads: number;
  hiddenDim: number;
  dropout: number;
  maxSequenceLength: number;
}

export interface TrainingConfig {
  batchSize: number;
  numEpochs: number;
  learningRate: number;
  weightDecay: number;
  patience: number;
  gradientClip: number;
}

export interface DataConfig {
  sequenceLength: number;
  trainSplit: number;
  minTracksPerSession: number;
}

export interface AppConfig {
  model: ModelConfig;
  training: TrainingConfig;
  data: DataConfig;
  spotify: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  api: {
    port: number;
    host: string;
    corsOrigins: string[];
  };
}

// Spotify API types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: { name: string; id: string };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  id: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
  context?: {
    type: string;
    href: string;
    external_urls: { spotify: string };
    uri: string;
  };
}

// Training data types
export interface TrainingExample {
  sequence: number[][];
  target: number[];
  metadata: {
    session_id: string;
    sequence_start: Date;
    sequence_end: Date;
  };
}

export interface TrainingBatch {
  sequences: number[][][];
  targets: number[][];
  batch_size: number;
}

export interface TrainingMetrics {
  loss: number;
  mood_loss: number;
  next_track_loss: number;
  pattern_loss: number;
  accuracy?: number;
  val_loss?: number;
}

// API request/response types
export interface AnalyzeRequest {
  tracks: TrackFeatures[];
  options?: {
    include_insights?: boolean;
    include_embeddings?: boolean;
    model_version?: string;
  };
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  processing_time_ms: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  model_loaded: boolean;
  uptime_seconds: number;
  memory_usage: {
    used: number;
    total: number;
  };
}

// Error types
export class ListeningAnalyzerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ListeningAnalyzerError';
  }
}

export class SpotifyAPIError extends ListeningAnalyzerError {
  constructor(message: string, public spotifyCode?: string) {
    super(message, 'SPOTIFY_API_ERROR', 502);
    this.name = 'SpotifyAPIError';
  }
}

export class ModelError extends ListeningAnalyzerError {
  constructor(message: string) {
    super(message, 'MODEL_ERROR', 500);
    this.name = 'ModelError';
  }
}

export class ValidationError extends ListeningAnalyzerError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}
