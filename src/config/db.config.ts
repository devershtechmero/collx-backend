import mongoose from "mongoose";

const connectDatabase = async () => {
  try{
    await mongoose.connect(String(process.env.MONGO_URI), {dbName: process.env.DB_NAME})
    .then(() => console.info(`Database connected`))
    .catch((e) => console.error(`Database connection error - ${e}`));
  }
  catch(e) {
    console.error('db config error', e);
    return null;
  }
}

export default connectDatabase;