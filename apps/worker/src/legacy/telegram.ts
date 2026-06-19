const TELEGRAM_MAX_LENGTH = 4096;

export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'your-bot-token-from-botfather') {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const chunks = splitMessage(text);
  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: chunk }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API error: ${res.status} ${body}`);
    }
  }
}

function splitMessage(text: string): string[] {
  if (text.length <= TELEGRAM_MAX_LENGTH) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, TELEGRAM_MAX_LENGTH));
    remaining = remaining.slice(TELEGRAM_MAX_LENGTH);
  }
  return chunks;
}
