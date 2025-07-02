const { Client } = require('pg');

exports.handler = async () => {
  const client = new Client({ connectionString: process.env.NEON_CONNECTION_STRING });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW() as now');
    await client.end();
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  } catch (err) {
    console.error('TEST-CONNECTION ERROR:', err);
    return { statusCode: 500, body: err.toString() };
  }
};