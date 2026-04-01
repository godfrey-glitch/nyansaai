// Nyansa AI — Gemini proxy
// Free tier: 1,500 req/day — no credit card needed
// Model: gemini-2.0-flash

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'GEMINI_API_KEY not set in Netlify environment variables. See deployment guide.' } })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Convert Anthropic-format request → Gemini format
    const contents = (body.messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : (m.content[0]?.text || '') }]
    }));

    const geminiBody = {
      contents,
      generationConfig: {
        maxOutputTokens: body.max_tokens || 800,
        temperature: 0.7
      }
    };

    if (body.system) {
      geminiBody.systemInstruction = { parts: [{ text: body.system }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 25-second timeout (Netlify functions time out at 26s by default)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || `Gemini API error ${response.status}`;
      // 429 = quota exceeded — friendly message
      const friendly = response.status === 429
        ? 'Daily AI limit reached. Please try again tomorrow or contact your school admin.'
        : errMsg;
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: { message: friendly } })
      };
    }

    // Convert Gemini response → Anthropic-style so app parsing works unchanged
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ type: 'text', text }] })
    };

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      statusCode: 504,
      body: JSON.stringify({
        error: { message: isTimeout ? 'Request timed out. Please try again.' : err.message }
      })
    };
  }
};
