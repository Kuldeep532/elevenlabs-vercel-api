export default async function handler(req, res) {

  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).send("POST only");
  }

  // Read text and voiceId from frontend
  const text = req.body.text;
  const voiceId = req.body.voiceId;

  if (!text || !voiceId) {
    return res.status(400).send("Missing text or voiceId");
  }

  try {
    // Send request to ElevenLabs
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    // Get audio as binary
    const audioBuffer = await response.arrayBuffer();

    // Send audio back to browser
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="speech.mp3"'
    );

    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    res.status(500).send("Text to speech failed");
  }
}
