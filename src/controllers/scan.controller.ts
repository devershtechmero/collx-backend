import { FastifyReply, FastifyRequest } from "fastify";
import handleResponse from "../service/handleResponse.service";
import { ximilarScanService } from "../service/card.service";

export const scanACard = async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    const data = await req.file();

    if (!data) {
      return rep.status(400).send({ error: "No file uploaded" });
    }

    if (!data.mimetype.startsWith("image/")) {
      return rep.status(400).send({ error: "Uploaded file must be an image" });
    }

    const buffer = await data.toBuffer();

    if (!buffer.length) {
      return rep.status(400).send({ error: "Uploaded file is empty" });
    }

    const base64Image = buffer.toString("base64");

    const ximilarRes = await ximilarScanService(base64Image);

    return handleResponse(rep, 200, "Scanning completed", {
      filename: data.filename,
      mimetype: data.mimetype,
      ximilar: ximilarRes,
    });
  } catch (err: any) {
    return rep.status(500).send({ error: err.message });
  }
};
