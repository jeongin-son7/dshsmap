const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  console.log('=== validateUser called ===');

  if (event.httpMethod !== 'POST') {
    console.log('잘못된 메서드:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 환경변수 체크
  console.log('NEON_CONNECTION_STRING:', process.env.NEON_CONNECTION_STRING);
  if (!process.env.NEON_CONNECTION_STRING) {
    console.log('환경변수 없음!');
    return { statusCode: 500, body: '환경변수 없음' };
  }

  let studentId, password;
  try {
    ({ studentId, password } = JSON.parse(event.body));
    console.log('입력받은 학번/비번:', studentId, password ? '(비번O)' : '(비번X)');
  } catch (e) {
    console.error('body 파싱 오류:', e);
    return { statusCode: 400, body: '잘못된 요청' };
  }

  const client = new Client({ connectionString: process.env.NEON_CONNECTION_STRING });
  await client.connect();

  try {
    const res = await client.query(
      'SELECT password_hash FROM students WHERE student_id = $1',
      [studentId]
    );
    console.log('DB 쿼리 결과:', res.rows);

    if (res.rowCount === 0) {
      console.log('존재하지 않는 학번:', studentId);
      return { statusCode: 401, body: '학생 정보가 없습니다.' };
    }
    const { password_hash } = res.rows[0];
    console.log('DB에 저장된 해시:', password_hash);

    const valid = await bcrypt.compare(password, password_hash);
    console.log('비번 일치 여부:', valid);

    if (!valid) {
      return { statusCode: 401, body: '비밀번호가 틀렸습니다.' };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('validateUser ERROR:', err);
    return { statusCode: 500, body: 'DB 오류' };
  } finally {
    await client.end();
    console.log('=== validateUser END ===');
  }
};