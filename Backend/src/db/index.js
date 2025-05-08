import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(
      `\nMongoDb connected !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb connection error :", error);
    process.exit(1);
  }
};

export default connectDB
