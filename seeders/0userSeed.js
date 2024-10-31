'use strict';

const { User } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE Users AUTO_INCREMENT = 1;');
    await queryInterface.bulkInsert('Users', [
      {
        isMento: true,
        mentoType: 'coding',
        nickName: 'LuckyMochi',
        age: 25,
        country: 'Korea',
        myInfo: 'I love coding and mentoring',
        googleId: '110232032347088948527',
        subjectTag: 'JavaScript',
        etcTag: 'Express',
        accessToken: 'ya29.a0AeDClZBicEoZ4hgQ73z32R5HJNJx7wdb5okiNJrX5kCvKEd6HpbeB7-RVNOqpEPY1OA0I-d_rWJ4v9DQThlJ6UHn_iEmbIxefRZzAO06EdqUozVsMrx3V68S4KL4QJlHMVuwDQYeth7JD6xPhs7uRgra4SGV3dWQwp1xdyOkaCgYKATUSARESFQHGX2Mi0j8RZs54Emy9T8re4YXopw0175',
        profileImg: 'https://lh3.googleusercontent.com/a/ACg8ocKaGdN15NhGP06G1HhHrCGsdAyETFnBDCGHz7gWC8INosufNBs=s96-c'
      },
      {
        isMento: true,
        mentoType: 'coding',
        nickName: '이헌도2',
        age: 26,
        country: 'Korea',
        myInfo: 'I love coding and mentoring',
        googleId: '112736174799956644168',
        subjectTag: 'JavaScript',
        etcTag: 'Express',
        accessToken: 'ya29.a0AeDClZDeYA0GdRdFpzFvc5FpxHoLkIyfGAhkmkAyVd7DN2q8bRD5aHtyFRLS9WATgfvyGWGBj2qnbsY9iQUsrRYKTZ4nuh51xuqnuq6qTDcOlnfazZ-DdpgAqskVDRJ9CuN4AG31biOBsQymux1p1v0IU1ddrdUthXbyCgfwaCgYKAdISARASFQHGX2MimxayHRYtKHP8NWi0vq1OlA0175',
        profileImg: 'https://lh3.googleusercontent.com/a/ACg8ocIoxtnabJaMvC_pY92cWg6Z_h-MkVi4jaVdblw-GqFK48AmcJk=s96-c'
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
