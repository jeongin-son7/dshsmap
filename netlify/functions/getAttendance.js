const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).toISOString().slice(0, 10);
console.log("오늘(today):", today);

const { Client } = require('pg');

exports.handler = async (event) => {
  const client = new Client({ connectionString: process.env.NEON_CONNECTION_STRING });
  await client.connect();

  try {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }))
  .toISOString().slice(0, 10);
    let result;
    if (event.queryStringParameters.all) {
      // 교사용(오늘 전체 명단)
     result = await client.query(
  `SELECT student_id, timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' as kst_time
     FROM attendance
   WHERE (timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date = $1
   ORDER BY student_id`,
  [today]
);
    } else {
      // 학생 본인용
      const { studentId } = event.queryStringParameters;
      // 학생용: 오늘 출석 중 1회(가장 최근)만 반환
result = await client.query(
  `SELECT timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul' as kst_time
   FROM attendance
   WHERE student_id = $1
     AND (timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')::date = $2
   ORDER BY timestamp DESC
   LIMIT 1`,
  [studentId, today]
);
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (err) {
    return { statusCode: 500, body: 'DB Error: ' + err.toString() };
  } finally {
    await client.end();
  }
};
