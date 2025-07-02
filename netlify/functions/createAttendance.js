// netlify/functions/createAttendance.js
const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { studentId } = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.NEON_CONNECTION_STRING });
  await client.connect();

  try {
    await client.query(
      'INSERT INTO attendance (student_id) VALUES ($1)',
      [studentId]
    );
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'DB 오류' };
  } finally {
    await client.end();
  }
};