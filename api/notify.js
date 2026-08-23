// Серверная функция Vercel: пересылает заявку с сайта в Telegram.
//
// Токен бота и ID чата НЕ хранятся в коде — они читаются из защищённых
// переменных окружения (Vercel → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
//
// Если переменные ещё не заданы, функция просто отвечает "не настроено"
// и ничего не ломает — письмо на почту при этом всё равно уходит
// через отдельный сервис (FormSubmit), эта функция от него не зависит.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(200).json({ skipped: true, reason: 'Telegram not configured yet' });
    return;
  }

  try {
    const data = req.body || {};
    const lines = Object.keys(data)
      .filter((k) => data[k])
      .map((k) => `*${k}:* ${data[k]}`);
    const text = `📩 Новая заявка с сайта Precision Metalworks\n\n${lines.join('\n')}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      res.status(502).json({ error: 'Telegram API error', details: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
