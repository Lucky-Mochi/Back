const express = require("express");
require('dotenv').config(); // dotenv 패키지를 사용해 .env 파일 로드
const axios = require('axios');
const router = express.Router();
const db = require("../models");
const { v4: uuidv4 } = require('uuid'); // uuid 패키지의 v4 버전 사용

const { User } = db;

const GOOGLE_CLIENT_ID = '1039522151820-tpvlul7g4k31equ0becd2qj0t7mpa4nj.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REDIRECT_URI = `${process.env.API_URL}/auth/login/redirect`;
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

router.get("/login", async (req, res) => {

  console.log('✅',GOOGLE_REDIRECT_URI)

  let url = 'https://accounts.google.com/o/oauth2/v2/auth';
  url += `?client_id=${GOOGLE_CLIENT_ID}`
  url += `&redirect_uri=${GOOGLE_REDIRECT_URI}`
  url += '&response_type=code'
  url += '&scope=email profile'    
	res.redirect(url);
});

router.get("/auto-login", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;
    
    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    } else {
      const user = await User.findOne({ where: { accessToken: tokenValue} });
      if (!user) {
        return res.status(404).json({ success: false, message: "자동 로그인 실패" });
      } else {
        return res.status(200).json({ success: true, message: "자동 로그인 성공" });
      }
    }
  } catch (error) {
    console.error("Auto-login Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.get("/login/redirect", async (req, res) => {
  try {
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
  
    const user = await User.findOne({ where: { googleId: resp2.data.id } });
  
    if (!user) {
      return res.status(404).json({ success: false, message: '회원이 아님', token: resp.data.access_token, googleId: resp2.data.id, profileImg: resp2.data.picture });
    } else {
      await User.update({ accessToken: resp.data.access_token }, { where: { googleId : resp2.data.id } }); // 재발급한 토큰저장하기
      return res.status(200).json({ success: true, message: "이미 회원입니다.", token: resp.data.access_token, googleId: resp2.data.id, profileImg: resp2.data.picture });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;
    
    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    } else {
      const user = await User.findOne({ where: { accessToken: tokenValue} });
    }
    const {
      isMento,
      mentoType,
      nickName,
      age,
      country,
      myInfo,
      subjectTag,
      etcTag,
      googleId,
      profileImg
    } = req.body;

    // 필수 입력 값 확인
    if (!mentoType || !isMento || !nickName || !age || !country || !myInfo || !googleId || !profileImg) {
      return res.status(400).json({ success: false, message: "필수 입력 값이 없습니다." });
    }

    // 데이터베이스에 새로운 사용자 생성
    await User.create({
      isMento,
      mentoType,
      nickName,
      age,
      country,
      myInfo,
      subjectTag,
      etcTag,
      accessToken: tokenValue,
      googleId,
      profileImg,
    });

    res.status(201).json({ success: true, message: "회원가입이 완료되었습니다.", token: tokenValue });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

// 회원가입 API
router.post('/signup/self', async (req, res) => {
  try {
    const { selfId, password } = req.body;

    // 필수 항목 체크
    if (!selfId || !password) {
      return res.status(400).json({ success: false, message: "아이디와 비밀번호를 모두 입력해야 합니다." });
    }

    // 중복 아이디 확인
    const existingUser = await User.findOne({ where: { selfId } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "이미 존재하는 아이디입니다." });
    }

    // accessToken 생성 (UUID 사용)
    const accessToken = uuidv4();

    // 새 사용자 생성 (비밀번호 해시 처리 없이 저장)
    const newUser = await User.create({
      selfId,
      password,
      accessToken, // 생성된 accessToken 저장
      // 필요한 추가 정보가 있다면 여기서 추가 가능
    });

    res.status(201).json({ success: true, message: "회원가입이 완료되었습니다.", token: accessToken });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.post('/login/self', async (req, res) => {
  try {
    const { selfId, password } = req.body;

    // 필수 항목 체크
    if (!selfId || !password) {
      return res.status(400).json({ success: false, message: "아이디와 비밀번호를 모두 입력해야 합니다." });
    }

    // 사용자 확인
    const user = await User.findOne({ where: { selfId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "존재하지 않는 아이디입니다." });
    }

    // 비밀번호 검증 (비밀번호 해시 처리 없이 단순 비교)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }

    // 로그인 성공 시 기존 accessToken 반환
    res.status(200).json({
      success: true,
      message: "로그인 성공",
      token: user.accessToken // 기존에 발급된 accessToken 반환
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});


// 자체 회원가입 사용자 정보 업데이트 API
router.put('/signup/self/update', async (req, res) => {
  try {
    const token = req.headers["authorization"];  // Authorization 헤더에서 토큰을 가져옵니다.
    const tokenValue = token ? token.split(" ")[1] : null;  // Bearer 부분을 제거하고 실제 토큰 값만 추출합니다.
    
    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });  // 토큰이 없으면 에러 반환
    }

    // 토큰을 사용하여 사용자를 찾습니다.
    const user = await User.findOne({ where: { accessToken: tokenValue } });
    if (!user) {
      return res.status(404).json({ success: false, message: "해당 토큰을 가진 사용자가 존재하지 않습니다." });  // 사용자가 없으면 에러 반환
    }

    // 사용자의 정보 업데이트 (요청 바디의 데이터를 사용하여 업데이트)
    const { isMento, mentoType, nickName, age, country, myInfo, subjectTag, etcTag } = req.body;

    await User.update(
      {
        isMento,
        mentoType,
        nickName,
        age,
        country,
        myInfo,
        subjectTag,
        etcTag
      },
      { where: { accessToken: tokenValue } }  // 토큰을 사용하여 해당 사용자의 정보를 업데이트합니다.
    );

    res.status(200).json({ success: true, message: "사용자 정보가 성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;

