const express = require("express");
const axios = require('axios');
const router = express.Router();
const db = require("../models");

const { User } = db;

const GOOGLE_CLIENT_ID = '1039522151820-tpvlul7g4k31equ0becd2qj0t7mpa4nj.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REDIRECT_URI = 'http://localhost:4000/auth/login/redirect';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

router.get("/login", async (req, res) => {
  let url = 'https://accounts.google.com/o/oauth2/v2/auth';
  url += `?client_id=${GOOGLE_CLIENT_ID}`
  url += `&redirect_uri=${GOOGLE_REDIRECT_URI}`
  url += '&response_type=code'
  url += '&scope=email profile'    
	res.redirect(url);
});

router.get("/login/redirect", async (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`); //access token을 받아오기 위한 code
  
  const resp = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${resp.data.access_token}`,
    },
  });

  const user = await User.findOne({ where: { googleId: resp.data.id } });

  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.'});
  } else {
    await User.update({ accessToken: resp.data.access_token }, { where: { googleId : resp.data.id } }); // 재발급한 토큰저장하기
    return res.status(200).json({ success: true, message: "로그인 성공", token: resp.data.access_token });
  }
});

router.post("/signup", async (req, res) => {

  const token = req.headers["authorization"];
  const tokenValue = token ? token.split(" ")[1] : null;
  
  if (!tokenValue) {
    return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const {
      isMento,
      mentoType,
      nickName,
      age,
      country,
      myInfo,
      subjectTag,
      etcTag
    } = req.body;

    // 필수 입력 값 확인
    if (!mentoType || !isMento || !nickName || !age || !country || !myInfo) {
      return res.status(400).json({ success: false, message: "필수 입력 값이 없습니다." });
    }

    // 데이터베이스에 새로운 사용자 생성
    const newUser = await User.create({
      isMento,
      mentoType,
      nickName,
      age,
      country,
      myInfo,
      subjectTag,
      etcTag
    });

    // 토큰 생성 (실제로는 JWT 등을 사용하여 토큰 생성 필요)
    const token = 'generated-token'; // 실제 토큰 생성 로직으로 대체

    res.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token: token
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});


module.exports = router;
