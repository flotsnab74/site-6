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
    // navigator.sendBeacon() и обычный fetch() могут доставить тело
    // запроса по-разному (готовый объект, строка JSON или сырые байты
    // Buffer) — приводим к обычному объекту в любом из этих случаев,
    // чтобы разбор данных не зависел от способа отправки.
    let data = req.body;
    if (Buffer.isBuffer(data)) data = data.toString('utf-8');
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = {}; }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};

    const lines = Object.keys(data)
      .filter((k) => typeof data[k] === 'string' && data[k].trim())
      .map((k) => `${k}: ${data[k]}`);

    let text = lines.length
      ? `📩 Новая заявка с сайта Precision Metalworks\n\n${lines.join('\n')}`
      : '📩 Новая заявка с сайта Precision Metalworks (детали не распознаны, проверьте почту)';

    if (text.length > 3900) text = text.slice(0, 3900) + '…';

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error('Telegram sendMessage failed:', tgRes.status, errText);
      res.status(502).json({ error: 'Telegram API error', status: tgRes.status, details: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify.js error:', err);
    res.status(500).json({ error: err.message });
  }
}
