import { FastifyReply, FastifyRequest } from "fastify";
import handleResponse from "../service/handleResponse.service";

export const scanACard = async (req: FastifyRequest, rep: FastifyReply) => {
  const img = await req.file();
  if (!img) {
    return handleResponse(rep, 400, "Scanning the card is required");
  }

  

  return handleResponse(rep, 200, "Image uploaded successfully", {
    filename: img.filename,
    mimetype: img.mimetype,
  });
}
