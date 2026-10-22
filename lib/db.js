import mongoose from "mongoose";

const globalWithMongoose = globalThis;
const cached =
  globalWithMongoose.mongooseConnection ??
  (globalWithMongoose.mongooseConnection = { connection: null, promise: null });

const connectDB = async () => {
  if (cached.connection && mongoose.connection.readyState === 1) {
    return cached.connection;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((connection) => {
      console.info("MongoDB connected");
      return connection;
    });
  }

  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;