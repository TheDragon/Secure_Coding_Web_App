// Simple mail stub
export async function sendMail({ to, subject, text }) {
  // In real app use nodemailer or provider
  // eslint-disable-next-line no-console
  console.log('[MAIL]', { to, subject, text });
}
