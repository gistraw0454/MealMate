const db = require('../models'); // DB 연결 가져오기
const bcrypt = require('bcrypt');

// 프로필 페이지 렌더링
exports.renderProfilePage = async (req, res, next) => {
    try {
        const { username, email } = req.user; // 닉네임 제거
        res.render('profile', {
            title: '프로필 관리',
            user: { username, email }
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// 프로필 수정
exports.updateProfile = async (req, res, next) => {
    const { email, password } = req.body;
    const userId = req.user.id;

    try {
        let updateFields = { email };

        // 비밀번호 변경 시 처리
        if (password) {
            const hash = await bcrypt.hash(password, 12);
            updateFields.password = hash;
        }

        // DB 업데이트
        const query = `
            UPDATE users
            SET email = ?${password ? ', password = ?' : ''}
            WHERE id = ?
        `;
        const params = password ? [email, updateFields.password, userId] : [email, userId];
        await db.execute(query, params);

        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        next(err);
    }
};
