import { FastifyInstance } from 'fastify';
import { scanACard } from '../controllers/scan.controller';

const scanRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/scan', scanACard);
}