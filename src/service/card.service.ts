import axios from "axios";

const cardHedgerHeaders = {
  accept: "*/*",
  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,af;q=0.7",
  "content-type": "application/json",
  origin: "https://ai.cardhedger.com",
  "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
};

const parseAxiosResponse = (response: { status: number; data: unknown }) => {
  const text =
    typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Card search failed: ${response.status} - ${text}`);
  }

  if (typeof response.data === "object" && response.data !== null) {
    return response.data;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${response.status}): ${text}`);
  }
};

export const ximilarScanService = async (base64Img: string) => {
  const apiKey = process.env.XIMILAR_API_KEY;

  if (!apiKey) {
    throw new Error("Missing XIMILAR_API_KEY");
  }

  const ximilarRes = await fetch("https://api.ximilar.com/photo/tags/v2/tags", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          _base64: base64Img,
        },
      ],
    }),
  });

  const responseText = await ximilarRes.text();
  let result: unknown;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Ximilar returned a non-JSON response (${ximilarRes.status}): ${responseText}`
    );
  }

  if (!ximilarRes.ok) {
    throw new Error(
      `Ximilar request failed with status ${ximilarRes.status}: ${responseText}`
    );
  }

  return result;
};

export const priceService = async (
  query: string,
  limit: number = 200,
  page: string = "1"
) => {
  const url = "https://ai.cardhedger.com/api/search-cards";

  try {
    const response = await axios.post(
      url,
      {
        query,
        limit,
        page,
      },
      {
        headers: cardHedgerHeaders,
        validateStatus: () => true,
      }
    );

    return parseAxiosResponse(response);
  } catch (error: any) {
    throw new Error(`Axios request failed: ${error.message}`);
  }
};

export const fetchDataFromCardHedge = async (
  limit: number,
  page: string
) => {
  const url = "https://ai.cardhedger.com/api/search-cards";

  try {
    const response = await axios.post(
      url,
      {
        limit,
        page,
      },
      {
        headers: cardHedgerHeaders,
        validateStatus: () => true,
      }
    );

    return parseAxiosResponse(response);
  } catch (error: any) {
    throw new Error(`Axios request failed: ${error.message}`);
  }
};

export const fetchCardDetailsById = async (id: string) => {
  try {
    const response = await axios.post(
      "https://ai.cardhedger.com/api/card-details",
      {
        card_id: id,
      },
      {
        headers: cardHedgerHeaders,
        validateStatus: () => true,
      }
    );

    return parseAxiosResponse(response);
  } catch (e: any) {
    console.error(`Error in fetching card by id service - ${e}`);
    throw new Error(e?.message || "Failed to fetch card by id");
  }
};

export const fetchCardPriceHistory = async (
  card_id: string,
  grade: string,
  days: string
) => {
  try {
    const response = await axios.post(
      "https://ai.cardhedger.com/api/price-history",
      {
        card_id,
        grade,
        days,
      },
      {
        headers: cardHedgerHeaders,
        maxBodyLength: Infinity,
        validateStatus: () => true,
      }
    );

    return parseAxiosResponse(response);
  } catch (e: any) {
    console.error(`Error in fetching card price history service - ${e}`);
    throw new Error(e?.message || "Failed to fetch card price history");
  }
};