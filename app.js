const express = require('express');
const cors = require("cors");
const http = require('http'); // Socket.IO와 연결할 HTTP 서버
const { Server } = require('socket.io'); // Socket.IO 가져오기
const app = express();
const port = 4000;

const db = require("./models");

const { ChatRoom } = db;
const { User } = db;
const { ChatMessage } = db;

app.use((req, res) => {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인 허용
});

app.use(express.json());

app.get('/', (req, res) => {
	res.send(`
    <h1>Log in</h1>
        <a href="/auth/login">Log in</a>
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

// HTTP 서버 생성 및 Socket.IO 설정
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // 모든 도메인 허용; 필요 시 수정
        methods: ["GET", "POST"]
    }
});

// Socket.IO 연결 및 이벤트 설정
io.on("connection", (socket) => {
    console.log("새로운 클라이언트가 연결되었습니다");

    // 1. 채팅방에 들어오면 -> 소켓 채팅방 참여하기
    socket.on("joinRoom", async (chatRoomId, userId) => {
        try {
            const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
            if (!chatRoom) {
                console.error("존재하지 않는 채팅방입니다.");
                return;
            }

            socket.join(`chatRoom_${chatRoomId}`); // 해당 방에 참여
            console.log(`사용자 ${userId}가 채팅방 ${chatRoomId}에 참여했습니다.`);
            
            // 필요한 경우, 채팅방 참여자 목록 업데이트 등의 추가 로직을 여기에 넣을 수 있습니다.
        } catch (error) {
            console.error("채팅방 참여 중 오류:", error);
        }
    });

    // 2. 채팅이 생기면 'sendChat' 이벤트 수신
    socket.on("sendChat", async (chatRoomId, userId, newChatMessage) => {
        try {
            // 메시지를 DB에 저장
            const chatMessage = await ChatMessage.create({
                idChatRoom: chatRoomId,
                idUser: userId,
                messageContent: newChatMessage,
                isRead: false // 초기 메시지의 읽음 상태는 false로 설정
            });

            // 3. 해당 채팅방에만 새로운 메시지 전송
            io.to(`chatRoom_${chatRoomId}`).emit("newChat", {
                writerId: userId,
                messageContent: newChatMessage,
                createdAt: chatMessage.createdAt
            });

            // 4. 멘토 정보와 읽지 않은 메시지 수 계산
            const mento = await User.findOne({ where: { id: chatRoom.mentoId } });
            const noReads = await ChatMessage.count({
                where: {
                    idChatRoom: chatRoomId,
                    idUser: { [Op.ne]: userId }, // 현재 사용자가 보낸 메시지는 제외
                    isRead: false
                }
            });

            // 5. 채팅방 목록에 표시될 마지막 메시지 전송
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

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
