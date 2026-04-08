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

export const priceService = async () => {
  try{

  }
  catch(e) {
    console.error(`Error in price service - ${e}`);
    return null
  }
}