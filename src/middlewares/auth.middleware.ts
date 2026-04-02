import { FastifyReply, FastifyRequest } from "fastify";
import handleResponse from "../service/handleResponse.service";

const isAuth = async (req: FastifyRequest, rep: FastifyReply) => {
  try{
    
  }
  catch(err) {
    console.error(`Error in auth middleware - ${err}`);
    return handleResponse(rep, 500, 'Internal server error');
  }
}

export default isAuth;