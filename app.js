const express = require('express');
const cors = require("cors");
const http = require("http");
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
  <h1>채팅방 테스트</h1>
  <div>
      <label for="chatRoomId">채팅방 ID:</label>
      <input type="text" id="chatRoomId" placeholder="채팅방 ID를 입력하세요" />
  </div>
  <div>
      <label for="userId">사용자 ID:</label>
      <input type="text" id="userId" placeholder="사용자 ID를 입력하세요" />
  </div>
  <button onclick="joinRoom()">채팅방 참여</button>

  <div>
      <label for="message">메시지:</label>
      <input type="text" id="message" placeholder="메시지를 입력하세요" />
      <button onclick="sendChat()">메시지 전송</button>
  </div>

  <div id="chatLog" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; height: 200px; overflow-y: scroll;">
      <h2>채팅 로그</h2>
  </div>

  <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
  <script>
      const socket = io("http://localhost:4000");

      function joinRoom() {
          const chatRoomId = document.getElementById("chatRoomId").value;
          const userId = document.getElementById("userId").value;
          socket.emit("joinRoom", chatRoomId, userId);
          alert(\`채팅방 \${chatRoomId}에 참여했습니다.\`);
      }

      function sendChat() {
          const chatRoomId = document.getElementById("chatRoomId").value;
          const userId = document.getElementById("userId").value;
          const message = document.getElementById("message").value;
          socket.emit("sendChat", chatRoomId, userId, message);
      }

      socket.on("newChat", (data) => {
          const chatLog = document.getElementById("chatLog");
          const messageElement = document.createElement("p");
          messageElement.innerText = \`사용자 \${data.writerId}: \${data.messageContent} (보낸 시간: \${data.createdAt})\`;
          chatLog.appendChild(messageElement);
          chatLog.scrollTop = chatLog.scrollHeight;
      });
  </script>
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

io.on("connection", (socket) => {
    console.log("새로운 클라이언트가 연결되었습니다");

    socket.on("joinRoom", async (chatRoomId, userId) => {
        try {
            const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
            if (!chatRoom) {
                console.error("존재하지 않는 채팅방입니다.");
                return;
            }

            socket.join(`chatRoom_${chatRoomId}`);
            console.log(`사용자 ${userId}가 채팅방 ${chatRoomId}에 참여했습니다.`);
        } catch (error) {
            console.error("채팅방 참여 중 오류:", error);
        }
    });

    socket.on("sendChat", async (chatRoomId, userId, newChatMessage) => {
        try {
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
                mentoNick: mento.nickName,
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
