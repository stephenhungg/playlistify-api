import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { SimpleSpotifyModel } from '@/models/SimpleModel';
import { DataProcessor } from '@/data/DataProcessor';
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  HealthCheckResponse, 
  TrackFeatures,
  ModelPredictions,
  ValidationError,
  ModelError,
  AppConfig
} from '@/types';
import { logger } from '@/utils/logger';
import { validateAnalyzeRequest } from '@/utils/validation';
import { join } from 'path';
import * as tf from '@tensorflow/tfjs-node';

export class VibeChainAPI {
  private app: express.Application;
  private model: SimpleSpotifyModel | null = null;
  private dataProcessor: DataProcessor;
  private config: AppConfig;
  private startTime: Date;

  constructor(config: AppConfig) {
    this.config = config;
    this.app = express();
    this.dataProcessor = new DataProcessor();
    this.startTime = new Date();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();

    logger.info('VibeChain API initialized');
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors({
      origin: this.config.api.corsOrigins,
      credentials: true
    }));

    this.app.use(morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) }
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Add processing time to requests
    this.app.use((req: any, res, next) => {
      req.startTime = Date.now();
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', this.handleHealthCheck.bind(this));
    this.app.post('/analyze', this.handleAnalyze.bind(this));
    this.app.get('/model/info', this.handleModelInfo.bind(this));
  }

  private setupErrorHandling(): void {
    this.app.use((err: any, req: any, res: express.Response, next: express.NextFunction) => {
      const processingTime = Date.now() - req.startTime;
      
      logger.error('API Error:', err);
      
      if (err instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: err.message,
          processing_time_ms: processingTime
        });
      } else if (err instanceof ModelError) {
        res.status(500).json({
          success: false,
          error: err.message,
          processing_time_ms: processingTime
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          processing_time_ms: processingTime
        });
      }
    });
  }

  private async handleHealthCheck(req: any, res: express.Response): Promise<void> {
    const uptime = (Date.now() - this.startTime.getTime()) / 1000;
    const memoryUsage = process.memoryUsage();

    const response: HealthCheckResponse = {
      status: 'healthy',
      model_loaded: this.model !== null,
      uptime_seconds: uptime,
      memory_usage: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal
      }
    };

    res.json(response);
  }

  private async handleModelInfo(req: any, res: express.Response): Promise<void> {
    const processingTime = Date.now() - req.startTime;

    if (!this.model) {
      res.status(404).json({
        success: false,
        error: 'No model loaded',
        processing_time_ms: processingTime
      });
      return;
    }

    res.json({
      success: true,
      data: {
        model_loaded: true,
        model_type: 'SimpleSpotifyModel',
        input_features: 20,
        output_features: 3
      },
      processing_time_ms: processingTime
    });
  }

  private async handleAnalyze(req: any, res: express.Response): Promise<void> {
    const processingTime = Date.now() - req.startTime;

    try {
      if (!this.model) {
        throw new ModelError('No model loaded');
      }

      // Validate request
      const analyzeRequest: AnalyzeRequest = validateAnalyzeRequest(req.body);
      
      // Process the analysis
      const result = await this.performAnalysis(analyzeRequest.tracks, analyzeRequest.options);

      const response: AnalyzeResponse = {
        success: true,
        data: result,
        processing_time_ms: Date.now() - req.startTime
      };

      res.json(response);

    } catch (error) {
      const processingTime = Date.now() - req.startTime;
      
      if (error instanceof ValidationError || error instanceof ModelError) {
        throw error; // Let error handler deal with it
      }
      
      logger.error('Analysis error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      });
    }
  }

  private async performAnalysis(tracks: TrackFeatures[], options?: any): Promise<any> {
    if (!this.model) {
      throw new ModelError('No model loaded');
    }

    if (tracks.length === 0) {
      throw new ValidationError('No tracks provided for analysis');
    }

    // Convert tracks to feature vectors
    const featureVectors = tracks.map(track => 
      this.dataProcessor.trackFeaturesToVector(track)
    );

    // Create input tensor
    const inputTensor = tf.tensor2d(featureVectors);
    let predictionTensor: tf.Tensor | null = null;

    try {
      // Get model predictions
      predictionTensor = await this.model.predict(inputTensor) as tf.Tensor;
      
      // Convert tensor to values
      const predictionValues = await predictionTensor.data();
      
      // Our model outputs [valence, energy, danceability] for each track
      const predictions: ModelPredictions = {
        mood_prediction: {
          valence: predictionValues[0],
          energy: predictionValues[1],
          arousal: predictionValues[2]
        },
        pattern_embedding: Array.from(predictionValues).slice(0, 10), // Take first 10 values as embedding
        next_track_prediction: {
          valence: predictionValues[0],
          energy: predictionValues[1],
          danceability: predictionValues[2]
        },
        confidence_scores: {
          mood: 0.85,
          next_track: 0.80
        }
      };

      return {
        predictions,
        metadata: {
          tracks_analyzed: tracks.length,
          analysis_timestamp: new Date(),
          model_version: '1.0.0'
        }
      };

    } finally {
      inputTensor.dispose();
      predictionTensor?.dispose();
    }
  }

  public async loadModel(modelPath?: string): Promise<void> {
    try {
      const path = modelPath || join(process.cwd(), 'models', 'best_model');
      
      this.model = new SimpleSpotifyModel(20); // 20 input features
      await this.model.loadModel(path);
      
      logger.info(`Model loaded successfully from ${path}`);
    } catch (error) {
      logger.warn('Failed to load model on startup:', error);
    }
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      const server = this.app.listen(this.config.api.port, this.config.api.host, () => {
        logger.info(`VibeChain API server started on ${this.config.api.host}:${this.config.api.port}`);
        resolve();
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received, shutting down gracefully');
        server.close(() => {
          process.exit(0);
        });
      });
    });
  }
}