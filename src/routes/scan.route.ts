import { FastifyInstance } from 'fastify';
import { searchCards, getData, scanACard, getCardById, getCardPriceHistory } from '../controllers/scan.controller';

const scanRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/scan', { compress: false }, scanACard);
  fastify.post('/card', searchCards); // search cards by query
  fastify.get('/data', getData); // get all data
  fastify.get('/card/:id', getCardById); // get card by id
  fastify.post('/card/price-history', { compress: false }, getCardPriceHistory); // get card price history
};

export default scanRoutes;
