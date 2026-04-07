import { FastifyReply } from 'fastify';

const handleResponse = (rep: FastifyReply, status: number, message: string, data: any = null) => {
  rep.code(status).send({
    status, message, data
  });
}

export default handleResponse;