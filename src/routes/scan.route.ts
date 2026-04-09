import { FastifyInstance } from 'fastify';
import { searchCards, getData, scanACard, getCardById } from '../controllers/scan.controller';

const scanRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/scan', { compress: false }, scanACard);
  fastify.post('/card', searchCards); // search cards by query
  fastify.get('/data', getData); // get all data
  fastify.get('/card/:id', getCardById); // get card by id
  fastify.post('/card/:id', getCardById); // get card by id
};

export default scanRoutes;
