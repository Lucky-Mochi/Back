const express = require("express");
const router = express.Router();
const { Op } = require('sequelize');
const db = require("../models");

const { ChatRoom } = db;
const { User } = db;
const { ChatMessage } = db;

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
        const chatrooms = await ChatRoom.findAll({ 
          where: {
              matchStatus: 'unapplied',
              [Op.or]: [
                  { mentoId: user.id },
                  { menteeId: user.id }
              ]
          }
        });

        // 각 채팅방에 대한 정보를 가져옵니다.
        const chatRooms = await Promise.all(chatrooms.map(async (chatroom) => {
          const lastChatMessage = await ChatMessage.findOne({
            where: { idChatRoom: chatroom.id },
            order: [['createdAt', 'DESC']], // 최신 메시지를 가져오기 위해 정렬
            limit: 1 // 가장 최신 메시지 하나만 가져옵니다.
          });

          // 해당 채팅방에서 읽지 않은 메시지 수를 가져옵니다.
          const noReads = await ChatMessage.count({
            where: {
              idChatRoom: chatroom.id, // 해당 채팅방
              idUser: { [Op.ne]: user.id }, // 자신이 보낸 메시지는 제외 -> 상대방이 보낸 메시지만 가져옵니다.
              isRead: false // 읽지 않은 메시지만 가져옵니다.
            }
          });

          const mento = await User.findOne({ where: { id: chatroom.mentoId } });

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

router.get("/my-mentorings", async (req, res) => {
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
        const chatrooms = await ChatRoom.findAll({ 
          where: {
              matchStatus: 'unapplied',
              [Op.or]: [
                  { mentoId: user.id },
                  { menteeId: user.id }
              ]
          }
        });

        // 각 채팅방에 대한 정보를 가져옵니다.
        const chatRooms = await Promise.all(chatrooms.map(async (chatroom) => {
          const lastChatMessage = await ChatMessage.findOne({
            where: { idChatRoom: chatroom.id },
            order: [['createdAt', 'DESC']], // 최신 메시지를 가져오기 위해 정렬
            limit: 1 // 가장 최신 메시지 하나만 가져옵니다.
          });

          // 해당 채팅방에서 읽지 않은 메시지 수를 가져옵니다.
          const noReads = await ChatMessage.count({
            where: {
              idChatRoom: chatroom.id, // 해당 채팅방
              idUser: { [Op.ne]: user.id }, // 자신이 보낸 메시지는 제외 -> 상대방이 보낸 메시지만 가져옵니다.
              isRead: false // 읽지 않은 메시지만 가져옵니다.
            }
          });

          const mento = await User.findOne({ where: { id: chatroom.mentoId } });

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

router.post("/chat-messages", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;

    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    }

    const user = await User.findOne({ where: { accessToken: tokenValue } });
    if (!user) {
      return res.status(404).json({ success: false, message: "유효하지 않은 토큰입니다." });
    }

    const { chatRoomId } = req.body;

    // 채팅방 정보 가져오기
    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: "존재하지 않는 채팅방입니다." });
    }

    // 채팅 메시지 목록 가져오기
    const chatMessages = await ChatMessage.findAll({
      where: { idChatRoom: chatRoomId },
      attributes: ['id', 'idUser', 'messageContent', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    // 각 메시지 정보를 필요한 형태로 변환
    const messages = chatMessages.map((message) => ({
      writerId: message.idUser,
      messageContent: message.messageContent,
      created_at: message.createdAt
    }));

    // 최종 응답 생성
    return res.status(200).json({
      matchStatus: chatRoom.matchStatus,
      chatMessages: messages
    });

  } catch (error) {
    console.error("채팅 메시지 불러오기 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.post("/read", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;

    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    }

    const user = await User.findOne({ where: { accessToken: tokenValue } });
    if (!user) {
      return res.status(404).json({ success: false, message: "유효하지 않은 토큰입니다." });
    }

    const { chatRoomId } = req.body;

    // 채팅방 정보 가져오기
    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: "존재하지 않는 채팅방입니다." });
    }

    // 읽지 않은 메시지를 업데이트
    await ChatMessage.update(
      { isRead: true },
      {
        where: {
          idChatRoom: chatRoomId,
          idUser: { [Op.ne]: user.id }, // 현재 사용자가 보낸 메시지는 제외
          isRead: false // 읽지 않은 메시지만 업데이트
        }
      }
    );

    // 최종 응답 생성
    return res.status(200).json({ success: true, message: '사용자가 이 채팅방의 모든 메시지를 읽음.' });

  } catch (error) {
    console.error("메시지 읽음 표시 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;