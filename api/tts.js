import axios from "axios";

export default async function handler(req, res) {
  // ✅ CORS HEADERS (REQUIRED)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Block non-POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // ✅ Safe body parsing
  const { text } = req.body || {};

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }

  // ❌ Prevent empty ElevenLabs requests
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "Missing ElevenLabs API key" });
  }

  try {
    const elevenResponse = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg"
        },
        responseType: "arraybuffer",
        timeout: 30000 // ✅ prevent hanging
      }
    );

    // ❌ If ElevenLabs returns nothing
    if (!elevenResponse.data || elevenResponse.data.byteLength === 0) {
      throw new Error("Empty audio buffer");
    }

    // ✅ Proper audio headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", elevenResponse.data.byteLength);

    return res.status(200).send(Buffer.from(elevenResponse.data));
  } catch (error) {
    console.error("TTS ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Text-to-Speech generation failed"
    });
  }
}
