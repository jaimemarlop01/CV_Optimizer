module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages, max_tokens } = req.body;
  if (!system || !messages) return res.status(400).json({ error: 'Invalid payload' });

  const userMessage = messages.find(m => m.role === 'user')?.content || '';

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: max_tokens || 1500,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: userMessage }
      ]
    })
  });

  const groqData = await groqRes.json();

  if (!groqRes.ok) {
    return res.status(groqRes.status).json({ error: groqData.error?.message || 'API error' });
  }

  const text = groqData.choices?.[0]?.message?.content || '';
  return res.status(200).json({ content: [{ type: 'text', text }] });
};
