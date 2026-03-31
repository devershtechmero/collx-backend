import mongoose from "mongoose";

const connectDatabase = async () => {
  const url = String(process.env.DATABASE_URI);
  const db = String(process.env.DB_NAME);

  await mongoose.connect(url, { dbName: db })
  .then(() => { console.log(`Database connected`) })
  .catch((e) => { console.error(`Database connection error - ${e}`) });
}

export default connectDatabase;