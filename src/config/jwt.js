module.exports = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'youraccesstokensecret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'yourrefreshtokensecret',
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || '10m'
};
