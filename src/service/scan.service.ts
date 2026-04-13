import 'dotenv/config';
import axios from "axios";

const extractJSON = (text: string) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

const buildSearchString = (data: any) => {
  if (data?.search_string) return data.search_string;

  return [
    data?.name,
    data?.player,
    data?.team,
    data?.set,
    data?.year,
    data?.category,
    "card"
  ]
    .filter(Boolean)
    .join(" ");
};

const scanService = async (IMAGE_URL: string) => {
  try {
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    const payload = {
      model: "mistralai/mistral-large-3-675b-instruct-2512",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are a trading card recognition system.

Analyze the given image and extract card details.

Supported categories:
- Pokemon
- Sports cards (NBA, NFL, etc.)
- Magic The Gathering
- Yu-Gi-Oh

Return ONLY valid JSON. No explanation.

JSON format:
{
  "name": "",
}

Rules:
- Fill the name only and return it
          `
            },
            {
              type: "image_url",
              image_url: {
                url: IMAGE_URL
              }
            }
          ]
        }
      ],
      max_tokens: 512,
      temperature: 0.1,
      top_p: 1,
      stream: false
    };

    const headers = {
      Authorization: `Bearer ${process.env.NIM_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    };


    const response = await axios.post(invokeUrl, payload, {
      headers
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content received");
      return;
    }

    const parsed = extractJSON(content);
    if (!parsed) {
      console.error("Failed to parse JSON");
      return;
    }

    parsed.search_string = buildSearchString(parsed);
    return parsed;

  } catch (error: any) {
    console.error("API Error:", error?.response?.data || error.message);
  }
};

export default scanService;