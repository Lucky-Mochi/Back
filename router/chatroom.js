const express = require("express");
const router = express.Router();

// const db = require("../models");

router.get("/", async (req, res) => {
  res.send("chatroom");
});

module.exports = router;