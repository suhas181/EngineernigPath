import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (isProduction && (!mongoUri || mongoUri.trim() === '')) {
      console.error('FATAL: MONGO_URI or MONGODB_URI environment variable is required in production.');
      process.exit(1);
    }

    const uriToConnect = mongoUri || 'mongodb://127.0.0.1:27017/engineerpath';
    await mongoose.connect(uriToConnect);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
