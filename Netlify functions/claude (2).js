// Nyansa AI — AI Proxy (Groq primary, Gemini fallback)
// Groq free tier: ~14,400 req/day — very fast
// Model: llama-3.3-70b-versatile

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'No API key set. Add GROQ_API_KEY or GEMINI_API_KEY in Netlify environment variables.' } })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // ── Try Groq first ──────────────────────────────────────────────────────
    if (groqKey) {
      const messages = [];
      if (body.system) {
        messages.push({ role: 'system', content: body.system });
      }
      (body.messages || []).forEach(m => {
        messages.push({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : (m.content[0]?.text || '')
        });
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      let groqRes;
      try {
        groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: body.max_tokens || 800,
            temperature: 0.7
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const groqData = await groqRes.json();

      if (groqRes.ok) {
        const text = groqData.choices?.[0]?.message?.content || '';
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: [{ type: 'text', text }] })
        };
      }

      if (groqRes.status !== 429 || !geminiKey) {
        const errMsg = groqData.error?.message || `Groq API error ${groqRes.status}`;
        const friendly = groqRes.status === 429
          ? 'AI limit reached for now. Please try again in a moment.'
          : errMsg;
        return {
          statusCode: groqRes.status,
          body: JSON.stringify({ error: { message: friendly } })
        };
      }

      console.log('[Nyansa] Groq rate limited — falling back to Gemini');
    }

    // ── Gemini fallback ─────────────────────────────────────────────────────
    const contents = (body.messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : (m.content[0]?.text || '') }]
    }));

    const geminiBody = {
      contents,
      generationConfig: { maxOutputTokens: body.max_tokens || 800, temperature: 0.7 }
    };

    if (body.system) {
      geminiBody.systemInstruction = { parts: [{ text: body.system }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 25000);

    let geminiRes;
    try {
      geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
        signal: controller2.signal
      });
    } finally {
      clearTimeout(timeoutId2);
    }

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = geminiData.error?.message || `Gemini API error ${geminiRes.status}`;
      const friendly = geminiRes.status === 429
        ? 'Daily AI limit reached. Please try again tomorrow.'
        : errMsg;
      return {
        statusCode: geminiRes.status,
        body: JSON.stringify({ error: { message: friendly } })
      };
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
