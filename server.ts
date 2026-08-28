import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Lazy initialize Gemini AI client
  let genAI: GoogleGenAI | null = null;
  function getGenAIClient(): GoogleGenAI | null {
    if (!genAI && process.env.GEMINI_API_KEY) {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return genAI;
  }

  // AI Field Guide Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, sensorReading, cropType = 'general crops', language = 'taglish' } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      let telemetryContext = 'No live drone telemetry reading yet.';
      if (sensorReading) {
        telemetryContext = `Current Drone Soil Telemetry (Unit DR-01):
- Soil Moisture: ${sensorReading.moisture}% (${sensorReading.moistureCond || 'N/A'}) - Recommended: ${sensorReading.moistureDo || 'N/A'}
- Root-Zone Temperature: ${sensorReading.temp}°C (${sensorReading.tempCond || 'N/A'}) - Recommended: ${sensorReading.tempDo || 'N/A'}
- Soil pH: ${sensorReading.ph} (${sensorReading.phCond || 'N/A'}) - Recommended: ${sensorReading.phDo || 'N/A'}
- Overall Assessment: ${sensorReading.overall || 'N/A'}
- Target Crop: ${cropType}`;
      }

      const client = getGenAIClient();

      if (!client) {
        // Fallback intelligent responder if GEMINI_API_KEY is not yet attached in settings
        const lastUserMsg = messages[messages.length - 1]?.content || '';
        const lower = lastUserMsg.toLowerCase();

        let reply = '';
        if (lower.includes('lime') || lower.includes('asim') || lower.includes('acid')) {
          reply = `Para mag-apply ng agricultural lime (calcium carbonate):\n1. Sukatin ang lawak ng taniman at i-target ang 50-100g per square meter depende sa asim.\n2. Ikalat nang pantay sa ibabaw ng tuyong lupa bago magtanim.\n3. Ihalo sa top 10-15cm gamit ang asarol o rototiller.\n4. Diligan nang bahagya para magsimulang mag-react ang apog at maghintay ng 1-2 linggo bago itanim ang binhi.`;
        } else if (lower.includes('dilog') || lower.includes('irrigate') || lower.includes('tubig') || lower.includes('dry')) {
          reply = `Para sa tamang irrigation sa tuyong lupa:\n1. Diligan sa maagang umaga (6:00 AM - 8:00 AM) o bago lumubog ang araw para maiwasan ang mabilis na evaporation.\n2. Mag-drip irrigation o mabagal na pagbuhos sa paligid ng ugat, hindi sa mismong dahon.\n3. Maglagay ng organic mulch (dayami o tuyong damo) para mapanatili ang moisture sa lupa.`;
        } else if (lower.includes('mulch') || lower.includes('shade') || lower.includes('init') || lower.includes('hot')) {
          reply = `Para sa mulching at shading kapag mainit ang lupa:\n1. Maglagay ng 2-3 inches na kapal ng dayami (rice straw), wood chips, o tuyong dahon.\n2. Huwag idikit sa mismong puno ng halaman (mag-iwan ng 1 inch gap) upang maiwasan ang fungus.\n3. Kung lagpas 32°C ang lupa, magkabit ng 50% black/green shade net para mabawasan ang heat stress.`;
        } else if (lower.includes('basa') || lower.includes('wet') || lower.includes('drain') || lower.includes('sunlight')) {
          reply = `Kapag sobrang basa ang lupa (waterlogged):\n1. Itigil muna ang pagdidilig at gumawa ng drainage canal o kanal sa gilid ng plot.\n2. Luwagan ang ibabaw ng lupa gamit ang garden fork para makapasok ang hangin (aeration).\n3. Hayaang maarawan upang mabilis matuyo bago magkaroon ng root rot.`;
        } else {
          reply = `Kumusta! Ayon sa pinakahuling drone scan: Moisture ${sensorReading?.moisture || 38}%, Temp ${sensorReading?.temp || 21}°C, pH ${sensorReading?.ph || 6.5}. Makakatulong ako sa step-by-step soil management, fertilization, at pag-aalaga ng ${cropType}. Ano ang nais mong gawin?`;
        }

        return res.json({ reply });
      }

      const systemInstruction = `You are "Eastee", the cheerful, knowledgeable mascot and AI field guide of EastAi, an advanced drone soil-sensing telemetry system for farmers and growers.
Tone: Warm, encouraging, clear, practical, and farmer-friendly.
Language register: ${language === 'english' ? 'Clear plain English' : 'Taglish (natural conversational Filipino/English mix commonly spoken in Philippine agriculture)'}.
Guidelines:
1. Provide concrete, step-by-step actionable farming advice (e.g., how to apply agricultural lime, mulching methods, drainage canal creation, drip irrigation timing, organic compost application).
2. Directly ground your guidance in the current drone soil telemetry reading provided in context:
${telemetryContext}
3. Keep instructions concise (2-4 brief steps, around 100-140 words max) unless the user asks for deep technical breakdown.
4. If the soil condition is optimal, praise the farmer's soil health and give maintenance tips for ${cropType}.`;

      // Build conversation history
      const promptContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Generate response using Gemini 3.7 Flash
      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text?.trim() || 'Pasensya, hindi ako nakabuo ng sagot. Pakisubukan muli.';
      res.json({ reply });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({
        error: 'Failed to generate response',
        details: error?.message || 'Unknown error',
        fallback: 'May kaunting aberya sa koneksyon. Maaari mo ring tingnan ang aming Gabay sa mga Kondisyon sa ibaba habang inaayos ito.',
      });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EastAi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EastAi server:', err);
});
