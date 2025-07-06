export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // ✅ Clear the JWT cookie
    res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`);

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('❌ Error during logout:', error.message);
    return res.status(500).json({ error: 'Logout failed', details: error.message });
  }
}
