const express = require("express");
const router = express.Router();

const db = require("../models");

const { ChatRoom } = db;
const { User } = db;
const { ChatMessage } = db;
const { MessageRead } = db;

router.get("/", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;
    
    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    } else {
      const user = await User.findOne({ where: { accessToken: tokenValue } });
      if (!user) {
        return res.status(404).json({ success: false, message: "유효하지 않은 토큰입니다." });
      } else {
        // 채팅방을 가져오고, 필요한 데이터 형태로 가공합니다.
        const chatrooms = await ChatRoom.findAll({ where: { matchStatus: 'unapplied' } });

        // 각 채팅방에 대한 정보를 가져옵니다.
        const chatRooms = await Promise.all(chatrooms.map(async (chatroom) => {
          const lastChatMessage = await ChatMessage.findOne({
            where: { idChatRoom: chatroom.id},
            order: [['createdAt', 'DESC']], // 최신 메시지를 가져오기 위해 정렬
            limit: 1 // 가장 최신 메시지 하나만 가져옵니다.
          });

          const Messages = await ChatMessage.findAll({
            where: { 
              idChatRoom: chatroom.id,
              idUser: { [Op.ne]: user.id } // 자신이 보낸 메시지는 제외
            }
          });

          // 해당 유저가 읽지 않은 메시지 수를 가져옵니다.
          const noReads = await MessageRead.count({
            where: {
              idUser: user.id,
              isRead: false // 읽지 않은 메시지 수
            }
          });


          mento = await User.findOne({ where: { id: chatroom.mentoId } });

          return {
            idChatRoom: chatroom.id,
            mentoNick: mento.nickName, // 채팅방의 멘토 이름
            lastChatMessage: lastChatMessage ? lastChatMessage.messageContent : null, // 가장 최근 메시지 내용
            lastChatMessageDate: lastChatMessage ? lastChatMessage.createdAt : null, // 가장 최근 메시지 날짜
            noReads: noReads // 읽지 않은 메시지 수
          };
        }));

        // 최종 응답을 전송합니다.
        return res.status(200).json({
          success: true,
          chatRooms
        });
      }
    }
  } catch (error) {
    console.error("채팅방 불러오기 Error:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;