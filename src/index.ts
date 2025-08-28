import { VibeChainAPI } from '@/api/server';
import config from '@/config';
import { logger } from '@/utils/logger';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting VibeChain API...');
    
    // Create necessary directories
    const directories = ['logs', 'models', 'data'];
    directories.forEach(dir => {
      const dirPath = join(process.cwd(), dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        logger.info(`Created directory: ${dirPath}`);
      }
    });

    // Initialize API server
    const api = new VibeChainAPI(config);

    // Load model if available
    const modelPath = join(process.cwd(), 'models', 'listening_analyzer', 'model.json');
    if (existsSync(modelPath)) {
      logger.info('Loading pre-trained VibeChain model...');
      await api.loadModel(`file://${modelPath}`);
    } else {
      logger.warn('No pre-trained model found. Train a model first using npm run train');
    }

    // Start the server
    await api.start();
    
    logger.info('🚀 VibeChain API is running successfully!');
    logger.info(`📡 Server: http://${config.api.host}:${config.api.port}`);
    logger.info(`⛓️ Ready to chain your vibes!`);

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main();
}

export { main };
