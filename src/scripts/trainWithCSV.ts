#!/usr/bin/env node

import { CSVDataLoader } from '@/data/CSVDataLoader';
import { DataProcessor } from '@/data/DataProcessor';
import { SimpleSpotifyModel } from '@/models/SimpleModel';
import { logger } from '@/utils/logger';
// Removed debug logger - using basic logger only
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as tf from '@tensorflow/tfjs-node';

/**
 * REAL TENSORFLOW.JS TRAINING WITH CSV DATA
 * This trains the actual neural network using the downloaded Spotify dataset
 */

interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  validationSplit: number;
  sampleSize: number; // For faster training during development
}

class CSVTrainer {
  private csvLoader: CSVDataLoader;
  private dataProcessor: DataProcessor;
  private model: SimpleSpotifyModel;
  private config: TrainingConfig;

  constructor(config: Partial<TrainingConfig> = {}) {
    this.config = {
      batchSize: 32,
      epochs: 10,
      learningRate: 0.001,
      validationSplit: 0.2,
      sampleSize: 5000, // Start with 5k tracks for faster training
      ...config
    };

    this.csvLoader = new CSVDataLoader();
    this.dataProcessor = new DataProcessor();
    this.model = new SimpleSpotifyModel(20); // 20 input features
  }

  /**
   * Run the complete training pipeline
   */
  async train(): Promise<void> {
    try {
      logger.info('🔥 Starting REAL TensorFlow.js Training with CSV Data!');
      
      // Step 1: Load and analyze data
      await this.loadAndAnalyzeData();
      
      // Step 2: Prepare training data
      const { trainData, validationData } = await this.prepareTrainingData();
      
      // Step 3: Build and compile model
      await this.buildModel();
      
      // Step 4: Train the model
      const history = await this.trainModel(trainData, validationData);
      
      // Step 5: Save the trained model
      await this.saveModel();
      
      // Step 6: Generate training report
      this.generateReport(history);
      
      logger.info('🎉 Training completed successfully!');
      
    } catch (error) {
      logger.error('❌ Training failed:', error);
      throw error;
    }
  }

  /**
   * Load CSV data and show analytics
   */
  private async loadAndAnalyzeData(): Promise<void> {
    logger.info('📊 Loading and analyzing CSV dataset...');
    
    const stats = this.csvLoader.getStats();
    
    logger.info('📈 Dataset Statistics:');
    logger.info(`  • Total tracks: ${stats.total_tracks?.toLocaleString()}`);
    logger.info(`  • Sample size: ${stats.sample_size?.toLocaleString()}`);
    logger.info(`  • Unique artists: ${stats.unique_artists}`);
    logger.info(`  • Avg danceability: ${stats.avg_danceability?.toFixed(3)}`);
    logger.info(`  • Avg energy: ${stats.avg_energy?.toFixed(3)}`);
    logger.info(`  • Avg valence: ${stats.avg_valence?.toFixed(3)}`);
    logger.info(`  • Avg tempo: ${stats.avg_tempo?.toFixed(1)} BPM`);

    // Show sample tracks
    const sampleTracks = this.csvLoader.getSampleTracks(3);
    logger.info('🎵 Sample tracks:');
    sampleTracks.forEach((track, i) => {
      logger.info(`  ${i + 1}. "${track.name}" by ${track.artist}`);
      logger.info(`     Features: danceability=${track.features?.danceability.toFixed(3)}, energy=${track.features?.energy.toFixed(3)}, valence=${track.features?.valence.toFixed(3)}`);
    });
  }

  /**
   * Prepare training and validation data
   */
  private async prepareTrainingData(): Promise<{
    trainData: { inputs: tf.Tensor; labels: tf.Tensor };
    validationData: { inputs: tf.Tensor; labels: tf.Tensor };
  }> {
    logger.info(`🔄 Preparing training data (${this.config.sampleSize} tracks)...`);
    
    // Load tracks from CSV
    const tracks = this.csvLoader.getTracks(this.config.sampleSize);
    
    // Create listening sessions
    const sessions = this.csvLoader.createListeningSessions(tracks, 10);
    logger.info(`✅ Created ${sessions.length} listening sessions`);
    
    // Convert to training examples
    const allInputs: number[][] = [];
    const allLabels: number[][] = [];
    
    for (const session of sessions) {
      for (let i = 0; i < session.tracks.length - 1; i++) {
        const currentTrack = session.tracks[i];
        const nextTrack = session.tracks[i + 1];
        
        if (currentTrack.features && nextTrack.features) {
          // Input: current track features
          const input = this.trackFeaturesToVector(currentTrack.features);
          
          // Label: next track's mood features (valence, energy, danceability)
          const label = [
            nextTrack.features.valence,
            nextTrack.features.energy,
            nextTrack.features.danceability
          ];
          
          allInputs.push(input);
          allLabels.push(label);
        }
      }
    }
    
    logger.info(`✅ Created ${allInputs.length} training examples`);
    
    // Convert to tensors
    const inputsTensor = tf.tensor2d(allInputs);
    const labelsTensor = tf.tensor2d(allLabels);
    
    // Split into training and validation
    const numValidation = Math.floor(allInputs.length * this.config.validationSplit);
    const numTrain = allInputs.length - numValidation;
    
    const trainInputs = inputsTensor.slice([0, 0], [numTrain, -1]);
    const trainLabels = labelsTensor.slice([0, 0], [numTrain, -1]);
    
    const validationInputs = inputsTensor.slice([numTrain, 0], [numValidation, -1]);
    const validationLabels = labelsTensor.slice([numTrain, 0], [numValidation, -1]);
    
    // Cleanup
    inputsTensor.dispose();
    labelsTensor.dispose();
    
    logger.info(`✅ Split data: ${numTrain} training, ${numValidation} validation examples`);
    
    return {
      trainData: { inputs: trainInputs, labels: trainLabels },
      validationData: { inputs: validationInputs, labels: validationLabels }
    };
  }

  /**
   * Convert track features to input vector
   */
  private trackFeaturesToVector(features: any): number[] {
    return [
      features.danceability || 0,
      features.energy || 0,
      features.key || 0,
      features.loudness || 0,
      features.mode || 0,
      features.speechiness || 0,
      features.acousticness || 0,
      features.instrumentalness || 0,
      features.liveness || 0,
      features.valence || 0,
      features.tempo / 200.0 || 0, // Normalize tempo
      features.duration_ms / 300000.0 || 0, // Normalize duration
      features.time_signature / 7.0 || 0, // Normalize time signature
      features.hour_of_day || 0,
      features.day_of_week / 7.0 || 0,
      features.month / 12.0 || 0,
      features.is_weekend || 0,
      features.skip_rate || 0,
      features.repeat_count / 5.0 || 0,
      features.playlist_position || 0
    ];
  }

  /**
   * Build and compile the model
   */
  private async buildModel(): Promise<void> {
    logger.info('🧠 Building neural network model...');
    
    this.model.buildModel();
    this.model.compile(this.config.learningRate);
    
    logger.info('✅ Model built and compiled');
  }

  /**
   * Train the model
   */
  private async trainModel(
    trainData: { inputs: tf.Tensor; labels: tf.Tensor },
    validationData: { inputs: tf.Tensor; labels: tf.Tensor }
  ): Promise<any> {
    logger.info(`🚀 Starting training: ${this.config.epochs} epochs, batch size ${this.config.batchSize}`);
    
    const startTime = Date.now();
    
    try {
      const history = await this.model.train(
        trainData.inputs,
        trainData.labels,
        validationData.inputs,
        validationData.labels,
        this.config.epochs,
        this.config.batchSize
      );
      
      const trainingTime = (Date.now() - startTime) / 1000;
      logger.info(`✅ Training completed in ${trainingTime.toFixed(1)} seconds`);
      
      return history;
      
    } finally {
      // Cleanup tensors
      trainData.inputs.dispose();
      trainData.labels.dispose();
      validationData.inputs.dispose();
      validationData.labels.dispose();
    }
  }

  /**
   * Save the trained model
   */
  private async saveModel(): Promise<void> {
    const modelsDir = join(process.cwd(), 'models');
    
    if (!existsSync(modelsDir)) {
      mkdirSync(modelsDir, { recursive: true });
    }
    
    const modelPath = `file://${modelsDir}/listening_analyzer`;
    
    logger.info(`💾 Saving model to: ${modelPath}`);
    await this.model.save(modelPath);
    
    logger.info('✅ Model saved successfully');
  }

  /**
   * Generate training report
   */
  private generateReport(history: any): void {
    logger.info('\n📊 Training Report:');
    logger.info('==================');
    logger.info(`• Dataset: ${this.config.sampleSize} tracks from Spotify CSV`);
    logger.info(`• Model: Transformer-based neural network`);
    logger.info(`• Training: ${this.config.epochs} epochs, batch size ${this.config.batchSize}`);
    logger.info(`• Validation split: ${(this.config.validationSplit * 100).toFixed(0)}%`);
    
    if (history && history.history) {
      const finalLoss = history.history.loss[history.history.loss.length - 1];
      const finalValLoss = history.history.val_loss[history.history.val_loss.length - 1];
      
      logger.info(`• Final training loss: ${finalLoss.toFixed(4)}`);
      logger.info(`• Final validation loss: ${finalValLoss.toFixed(4)}`);
    }
    
    logger.info(`• Model saved to: models/listening_analyzer/`);
    logger.info('\n🚀 Ready for predictions!');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const config: Partial<TrainingConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--epochs':
        config.epochs = parseInt(args[++i]) || 10;
        break;
      case '--batch-size':
        config.batchSize = parseInt(args[++i]) || 32;
        break;
      case '--sample-size':
        config.sampleSize = parseInt(args[++i]) || 5000;
        break;
      case '--learning-rate':
        config.learningRate = parseFloat(args[++i]) || 0.001;
        break;
    }
  }
  
  logger.info(`🎯 Training configuration: ${JSON.stringify(config, null, 2)}`);
  
  const trainer = new CSVTrainer(config);
  await trainer.train();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Training script failed:', error);
    process.exit(1);
  });
}

export { CSVTrainer };
