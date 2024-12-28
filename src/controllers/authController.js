const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, TOKEN_EXPIRATION } = require('../config/jwt');
const REFRESH_TOKENS = new Set();

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });
  const refreshToken = jwt.sign({ id }, REFRESH_TOKEN_SECRET);
  REFRESH_TOKENS.add(refreshToken);
  return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).send('ID and password are required.');

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (id, password) VALUES (?, ?)', [id, hashedPassword]);
    const tokens = generateTokens(id);
    res.json(tokens);
  } catch (error) {
    res.status(500).send('Error creating user');
  }
};

exports.signin = async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).send('ID and password are required.');

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(403).send('Invalid credentials');
    }
    const tokens = generateTokens(id);
    res.json(tokens);
  } catch (error) {
    res.status(500).send('Error signing in');
  }
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !REFRESH_TOKENS.has(refreshToken)) {
    return res.status(403).send('Invalid refresh token');
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid refresh token');
    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });
    res.json({ accessToken });
  });
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) REFRESH_TOKENS.delete(refreshToken);
  res.send('Logged out successfully');
};

exports.info = (req, res) => {
  res.json({ id: req.user.id });
}
