import { FastifyReply, FastifyRequest } from "fastify";
import handleResponse from "../service/handleResponse.service";
import { fetchCardDetailsById, fetchDataFromCardHedge, priceService, ximilarScanService } from "../service/card.service";

type CardPriceBody = {
  query?: string;
  page?: string | number;
  limit?: string | number;
};

type PaginationQuery = {
  page?: string | number;
  limit?: string | number;
};

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

export const searchCards = async (
  req: FastifyRequest<{ Body: CardPriceBody }>,
  rep: FastifyReply
) => {
  try {
    const { query, page = "1", limit = 200 } = req.body ?? {};

    if (typeof query !== "string" || !query.trim()) {
      return rep.status(400).send({
        success: false,
        error: "query is required",
      });
    }

    const result = await priceService(
      query.trim(),
      Number(limit) || 200,
      String(page)
    );

    return rep.status(200).send(result);
  } catch (e: any) {
    console.error(`card pricing error - ${e}`);
    return rep.status(500).send({
      success: false,
      error: e?.message || "Failed to fetch card prices",
    });
  }
};

export const getData = async (
  req: FastifyRequest<{ Querystring: PaginationQuery }>,
  rep: FastifyReply
) => {
  try {
    const { limit = 40, page = "1" } = req.query ?? {};

    const result = await fetchDataFromCardHedge(Number(limit) || 40, String(page));
    return rep.status(200).send(result);
  } catch (e: any) {
    console.error(`Error in getting data - ${e}`);
    return rep.status(500).send({
      success: false,
      error: e?.message || "Failed to fetch data",
    });
  }
};

export const getCardById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  rep: FastifyReply
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return handleResponse(rep, 404, "Card id not found in parameter");
    }

    const result = await fetchCardDetailsById(id);
    return rep.status(200).send(result);
  } catch (e: any) {
    console.error(`Error in getting card by id - ${e}`);
    return rep.status(500).send({
      success: false,
      error: e?.message || "Failed to fetch card by id",
    });
  }
};
