import 'dotenv/config';
import createServer from './app';
import connectDatabase from './config/db.config';

const startServer = async () => {
  await connectDatabase();

  const app = await createServer();
  const port = Number(process.env.PORT) || 3000;

  app.listen({ port, host: '0.0.0.0' });
};

startServer().catch((err) => {
  console.error(`Server start failed: ${err}`);
  process.exit(1);
});