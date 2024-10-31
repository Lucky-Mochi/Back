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

router.put("/", async (req, res) => {
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

    const {
      nickName,
      age,
      mentoType,
      subjectTag,
      etcTag,
      myInfo
    } = req.body;

    // 필수 입력 값 확인
    if (!nickName || !age || !mentoType || !subjectTag || !etcTag || !myInfo) {
      return res.status(400).json({ success: false, message: "필수 입력 값이 없습니다." });
    }

    // 사용자 정보 업데이트
    await User.update({
      nickName,
      age,
      mentoType,
      subjectTag,
      etcTag,
      myInfo
    }, {
      where: { id: user.id }
    });

    return res.status(200).json({ success: true, message: "프로필이 업데이트되었습니다." });

  } catch (error) {
    console.error("프로필 업데이트 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.delete("/mentoring", async (req, res) => {
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

    // 요청 본체에서 mentoringId 추출
    const { mentoringId } = req.body;

    // mentoringId가 없을 경우 처리
    if (!mentoringId) {
      return res.status(400).json({ success: false, message: "멘토링 ID가 제공되지 않았습니다." });
    }

    // 멘토링 삭제
    const deletedCount = await ChatRoom.destroy({
      where: {
        id: mentoringId, // 멘토링 ID로 삭제
        [user.isMento ? 'mentoId' : 'menteeId']: user.id // 사용자 ID로 확인
      }
    });

    // 삭제된 멘토링이 없을 경우 처리
    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: "해당 멘토링을 찾을 수 없습니다." });
    }

    return res.status(200).json({ success: true, message: "멘토링이 삭제되었습니다." });

  } catch (error) {
    console.error("멘토링 삭제 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.post("/review", async (req, res) => {
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

    const {
      mentoId,
      temperature, // rating을 temperature로 변경
    } = req.body;

    // 필수 입력 값 확인
    if (!mentoId || !temperature) {
      return res.status(400).json({ success: false, message: "필수 입력 값이 없습니다." });
    }

    // 리뷰의 유효성 체크 (1 ~ 5)
    if (temperature < 1 || temperature > 5) {
      return res.status(400).json({ success: false, message: "온도는 1에서 5 사이여야 합니다." });
    }

    await User.update({
      temperature
    }, {
      where: { id: mentoId }
    });

    return res.status(200).json({ success: true, message: "멘토/멘티의 후기가 저장되었습니다." });

  } catch (error) {
    console.error("리뷰 작성 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.get('/logout', async (req, res) => {
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

    await User.update({
      accessToken: null
    }, {
      where: { id: user.id }
    });

    return res.status(200).json({ success: true, message: "로그아웃되었습니다." });

  } catch (error) {
    console.error("로그아웃 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

router.delete("/quit", async (req, res) => {
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

    await User.destroy({
      where: { id: user.id }
    });

    return res.status(200).json({ success: true, message: "계정이 삭제되었습니다." });

  } catch (error) {
    console.error("계정 삭제 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;