const express = require('express');
const cors = require("cors");
const http = require("http");
const { Op } = require('sequelize');
const socketIo = require("socket.io");

const app = express();
const port = 4000;

const db = require("./models");

const { ChatRoom } = db;
const { User } = db;
const { ChatMessage } = db;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    르키모찌하자나~~!!
  `);
});

const authRouter = require('./router/auth');
const chatroomRouter = require('./router/chatroom');
const findMentoRouter = require('./router/find-mento');
const profileRouter = require('./router/profile');

app.use('/auth', authRouter);
app.use('/chatrooms', chatroomRouter);
app.use('/find-mento', findMentoRouter);
app.use('/profile', profileRouter);

// HTTP 서버와 Socket.IO 초기화
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", async (socket) => {
  // 클라이언트에서 전달한 인증 토큰(accessToken) 받기
  const token = socket.handshake.headers["authorization"];
  console.log("💕접속한 클라이언트의 인증 토큰:", token);

  if (!token) {
      console.error("접근 권한이 없습니다. 인증 토큰이 필요합니다.");
      socket.disconnect();  // 토큰이 없을 경우 연결 해제
      return;
  } else {
      const user = await User.findOne({ where: { accessToken: token } });

      if (!user) {
          console.error("유효하지 않은 토큰입니다.");
          socket.disconnect();
          return;
      }

      // socket 객체에 userId를 저장하여 이후 이벤트에서 사용
      socket.userId = user.id;
  }

  console.log("새로운 클라이언트가 연결되었습니다");

  // 클라이언트가 특정 채팅방에 참여 요청할 때
  socket.on("joinRoom", async ({ chatRoomId }) => {
      try {
          const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
          if (!chatRoom) {
              console.error("존재하지 않는 채팅방입니다.");
              return;
          }

          // userId를 socket에서 가져와 사용
          const userId = socket.userId;
          socket.join(`chatRoom_${chatRoomId}`);
          console.log(`사용자 ${userId}가 채팅방 ${chatRoomId}에 참여했습니다.`);
      } catch (error) {
          console.error("채팅방 참여 중 오류:", error);
      }
  });

  // 클라이언트가 메시지를 보낼 때
  socket.on("sendChat", async ({ chatRoomId, newChatMessage }) => {
      try {
          const userId = socket.userId; // userId를 socket에서 가져와 사용

          console.log("채팅방 ID:", chatRoomId);
          console.log("사용자 ID:", userId);
          console.log("메시지:", newChatMessage);

          const chatMessage = await ChatMessage.create({
              idChatRoom: chatRoomId,
              idUser: userId,
              messageContent: newChatMessage,
              isRead: false
          });

          io.to(`chatRoom_${chatRoomId}`).emit("newChat", {
              writerId: userId,
              messageContent: newChatMessage,
              createdAt: chatMessage.createdAt
          });

          const mento = await User.findOne({ where: { id: chatRoomId } }); // 채팅방 멘토 찾기
          const noReads = await ChatMessage.count({
              where: {
                  idChatRoom: chatRoomId,
                  idUser: { [Op.ne]: userId },
                  isRead: false
              }
          });

          io.emit("newChatRoomMessage", {
              chatRoomId,
              mentoNick: mento ? mento.nickName : "Unknown",
              lastMessage: newChatMessage,
              lastMessageDate: chatMessage.createdAt,
              noReads: noReads
          });
      } catch (error) {
          console.error("메시지 전송 중 오류:", error);
      }
  });
});

// 서버 시작 (Socket.IO와 함께 실행)
server.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
