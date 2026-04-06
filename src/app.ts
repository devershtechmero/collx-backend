import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import compress from '@fastify/compress';
import handleResponse from './service/handleResponse.service';

const createServer = async () => {
  const app = Fastify({ logger: true });
  const clientUrl = process.env.CLIENT_URL;

  await app.register(helmet);
  await app.register(compress);

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'supersecret',
  });

  await app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true
  });

  app.get("/", (req: FastifyRequest, rep: FastifyReply) => {
    return rep.code(200).send({
      success: true,
      message: "healthy",
      uptime: process.uptime(),
      allowedOrigin: clientUrl
    });
  });

  app.get("/check", async (req: FastifyRequest, rep: FastifyReply) => {
    handleResponse(rep, 200, 'route checking...');
  });

  return app;
}

export default createServer;
