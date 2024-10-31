const express = require("express");
const router = express.Router();
const db = require("../models");

const { User, ChatRoom } = db;

router.get("/", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const tokenValue = token ? token.split(" ")[1] : null;

    // 토큰이 없거나 유효하지 않은 경우 처리
    if (!tokenValue) {
      return res.status(400).json({ success: false, message: "토큰이 제공되지 않았습니다." });
    }

    const user = await User.findOne({ where: { accessToken: tokenValue } });

    if (!user) {
      return res.status(404).json({ success: false, message: "유효하지 않은 토큰입니다." });
    }

    // 사용자 기본 정보
    const userInfo = {
      nickName: user.nickName,
      age: user.age,
      mentoType: user.mentoType,
      subjectTag: user.subjectTag,
      etcTag: user.etcTag,
      myInfo: user.myInfo,
      picture: user.profileImg // 구글 프로필 사진
    };

    // 사용자 멘토링 목록 가져오기
    let mentorings;
    
    // 멘티인 경우
    if (user.isMento === false) {
      mentorings = await ChatRoom.findAll({
        where: { menteeId: user.id }, // 멘티가 해당 사용자
        include: [
          {
            model: User,
            as: 'mentor', // 멘토와 연결된 사용자
            attributes: ['nickName', 'age', 'mentoType', 'subjectTag', 'etcTag', 'myInfo']
          }
        ]
      });
    } 
    // 멘토인 경우
    else {
      mentorings = await ChatRoom.findAll({
        where: { mentoId: user.id }, // 멘토가 해당 사용자
        include: [
          {
            model: User,
            as: 'mentee', // 멘티와 연결된 사용자
            attributes: ['nickName', 'age', 'mentoType', 'subjectTag', 'etcTag', 'myInfo']
          }
        ]
      });
    }

    // 멘토링 정보 가공
    const Mentorings = mentorings.map((mentoring) => ({
      mentoringId: mentoring.id,
      matchStatus: mentoring.matchStatus,
      userNick: user.isMento ? mentoring.mentee.nickName : mentoring.mentor.nickName,
      userAge: user.isMento ? mentoring.mentee.age : mentoring.mentor.age,
      userType: user.isMento ? mentoring.mentee.mentoType : mentoring.mentor.mentoType,
      subjectTag: user.isMento ? mentoring.mentee.subjectTag : mentoring.mentor.subjectTag,
      etcTag: user.isMento ? mentoring.mentee.etcTag : mentoring.mentor.etcTag,
      myInfo: user.isMento ? mentoring.mentee.myInfo : mentoring.mentor.myInfo
    }));

    // 최종 응답 생성
    return res.status(200).json({
      success: true,
      userInfo,
      Mentorings
    });
    
  } catch (error) {
    console.error("프로필 불러오기 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;