import axios from "axios";

export default async function handler(req, res) {

  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        text,
        model_id: "eleven_monolingual_v1"
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg"
        },
        responseType: "arraybuffer"
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "TTS failed" });
  }
}
