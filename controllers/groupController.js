const db = require('../models'); // DB 연결 가져오기

// 그룹 생성
exports.createGroup = async (req, res, next) => {
    try {
        const { groupName, password, category } = req.body;
        const ownerId = req.user.id;

        const query = `
            INSERT INTO user_groups (group_name, password, category, owner_id)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(query, [groupName, password, category, ownerId]);
        res.redirect('/group-search');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 그룹 삭제
exports.deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const query = `
            DELETE FROM user_groups
            WHERE id = ? AND owner_id = ?
        `;
        const [result] = await db.execute(query, [groupId, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '권한이 없거나 그룹이 존재하지 않습니다.' });
        }
        res.redirect('/my-groups');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 그룹 나가기
exports.leaveGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const query = `
            DELETE FROM group_members
            WHERE group_id = ? AND user_id = ?
        `;
        await db.execute(query, [groupId, req.user.id]);
        res.redirect('/my-groups');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 메뉴 추천
exports.recommendMenu = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        const query = `
            SELECT menu_name FROM menus
            WHERE group_id = ? AND is_excluded = FALSE
        `;
        const [menus] = await db.execute(query, [groupId]);

        if (menus.length === 0) {
            return res.status(404).json({ message: '추천할 메뉴가 없습니다.' });
        }

        const randomMenu = menus[Math.floor(Math.random() * menus.length)].menu_name;
        res.json({ recommendedMenu: randomMenu });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 분류 변경
exports.changeCategory = async (req, res, next) => {
    const { groupId } = req.params; // URL에서 groupId 추출
    const { newCategory } = req.body; // 폼 데이터에서 newCategory 추출

    try {
        if (!newCategory) {
            return res.status(400).send('새 분류가 누락되었습니다.');
        }

        // 그룹 소유자인지 확인
        const [groupRows] = await db.execute('SELECT owner_id FROM user_groups WHERE id = ?', [groupId]);
        if (groupRows.length === 0) {
            return res.status(404).send('그룹을 찾을 수 없습니다.');
        }

        const group = groupRows[0];
        if (group.owner_id !== req.user.id) {
            return res.status(403).send('그룹의 소유자만 분류를 변경할 수 있습니다.');
        }

        // 분류 업데이트
        await db.execute('UPDATE user_groups SET category = ? WHERE id = ?', [newCategory, groupId]);

        res.redirect(`/my-groups?groupId=${groupId}`);
    } catch (err) {
        console.error('Error changing category:', err);
        next(err);
    }
};

// 메뉴 제외
exports.excludeMenu = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { menu } = req.body;

        const query = `
            UPDATE menus
            SET is_excluded = TRUE
            WHERE group_id = ? AND menu_name = ?
        `;
        await db.execute(query, [groupId, menu]);
        res.redirect(`/my-groups?groupId=${groupId}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
