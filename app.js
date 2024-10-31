const express = require('express');
const cors = require("cors");
const app = express();
const port = 4000;

app.use(cors()); // CORS 미들웨어 추가
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
app.use('/profile', require('./router/profile'));


app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
