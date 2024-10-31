const express = require("express");
const router = express.Router();
const db = require("../models");

const { User } = db;

// FindMentos 엔드포인트 구현
router.get("/", async (req, res) => {
  try {
    // 쿼리 파라미터에서 멘토 유형 및 태그를 가져옵니다.
    const { mentoringType, subjectTag } = req.query;

    // 기본 쿼리 조건
    let whereConditions = {};
    
    // 멘토링 유형 필터링
    if (mentoringType && mentoringType !== "전체") {
      whereConditions.mentoType = mentoringType;
    }

    // 과목 태그 필터링
    if (subjectTag) {
      whereConditions.subjectTag = subjectTag;
    }

    // 멘토 정보 조회
    const mentors = await User.findAll({
      where: {
        isMento: true, // 멘토인 사용자만 검색
        ...whereConditions
      },
      attributes: ['id', 'nickName', 'mentoType', 'subjectTag', 'etcTag', 'myInfo'] // 반환할 속성 지정
    });

    // 결과가 없을 경우 처리
    if (mentors.length === 0) {
      return res.status(404).json({ success: false, message: "멘토를 찾을 수 없습니다." });
    }

    // 최종 응답 생성
    const FindMentos = mentors.map((mentor) => ({
      mentoId: mentor.id,
      mentoNick: mentor.nickName,
      mentoType: mentor.mentoType,
      subjectTag: mentor.subjectTag,
      etcTag: mentor.etcTag,
      mentoInfo: mentor.myInfo,
    }));

    return res.status(200).json({ success: true, FindMentos });
  } catch (error) {
    console.error("멘토 검색 에러:", error);
    res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});


module.exports = router;