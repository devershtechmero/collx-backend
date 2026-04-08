import 'dotenv/config';
import createServer from './app';
import connectDatabase from './config/db.config';

const startServer = async () => {
  const app = await createServer();
  const port = Number(process.env.PORT) || 3000;

  await connectDatabase();
  app.listen({ port, host: '0.0.0.0' });
};

startServer().catch((err) => {
  console.error(`Server start failed: ${err}`);
  process.exit(1);
});
