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
  res.json(resp2.data);
});

module.exports = router;
