const { Client } = require('pg');

exports.handler = async (event) => {
  const query = (event.queryStringParameters.query || '').trim();
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: "No query" }) };
  }
  const client = new Client({ connectionString: process.env.NEON_CONNECTION_STRING });
  await client.connect();
  try {
    const sql = `SELECT building, floor FROM room_map WHERE search_key ILIKE $1 LIMIT 1`;
    const values = [query];
    const result = await client.query(sql, values);
    if (result.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.toString() }) };
  } finally {
    await client.end();
  }
};