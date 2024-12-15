const db = require('../models'); // DB 연결 가져오기
const path = require('path');
const defaultMenus = require(path.join(__dirname, '../data/defaultMenus.json'));    // 메뉴들 json 가져오기

// 그룹 생성
exports.createGroup = async (req, res, next) => {
    try {
        const { groupName, password, category } = req.body;
        const ownerId = req.user.id;    // 현재 session 에 들어있는 유저 id를 넣는다.

        // 그룹 생성
        const query = `
            INSERT INTO user_groups (group_name, password, category, owner_id)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [groupName, password, category, ownerId]);
        const groupId = result.insertId; // 생성된 그룹의 PK 가져오기

        // 그룹 소유자도 멤버로 추가
        const addMemberQuery = `
            INSERT INTO group_members (group_id, user_id)
            VALUES (?, ?)
        `;
        await db.execute(addMemberQuery, [groupId, ownerId]);

        res.redirect('/my-groups'); // 그룹 참여 후 내 그룹 페이지로 리다이렉트
    } catch (error) {
        console.error(error);
        next(error);    // 에러발생시 에러 미들웨어로 이동
    }
};

// 그룹 삭제
exports.deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params; // 파라미터에있는 그룹 아이디를 가져옴
        const query = `
            DELETE FROM user_groups
            WHERE id = ? AND owner_id = ?
        `;
        const [result] = await db.execute(query, [groupId, req.user.id]);   // groupId에서 owner가 내id랑 같으면 delete

        if (result.affectedRows === 0) {    // result 영향x
            return res.status(403).json({ message: '권한이 없거나 그룹이 존재하지 않습니다.' });
        }

        // 삭제완료후 my-groups로 다시 리다이렉트
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

        // 그룹 소유자인지 확인
        const [rows] = await db.execute(
            'SELECT owner_id FROM user_groups WHERE id = ?', [groupId]
        );

        // 그룹이 존재하고, owner_id가 내id랑 같으면 그룹 삭제.
        if (rows.length > 0 && rows[0].owner_id === req.user.id) {
            const deleteGroupQuery = `
                DELETE FROM user_groups
                WHERE id = ? AND owner_id = ?
            `;
            const [result] = await db.execute(deleteGroupQuery, [groupId, req.user.id]);

            // 삭제 못함
            if (result.affectedRows === 0) {
                return res.status(403).json({ message: '권한이 없거나 그룹이 존재하지 않습니다.' });
            }
        } else {
            // 소유자가 아닌 경우 group_members에서 데이터 삭제
            const leaveGroupQuery = `
                DELETE FROM group_members
                WHERE group_id = ? AND user_id = ?
            `;
            await db.execute(leaveGroupQuery, [groupId, req.user.id]);
        }

        // 나가기완료후 내 그룹으로 리다이렉트
        res.redirect('/my-groups');
    } catch (error) {
        console.error('Error in leaveGroup:', error);
        next(error);
    }
};


// 그룹 참여
exports.joinGroup = async (req, res, next) => {
    const { groupId } = req.params; // URL에서 그룹 ID 추출
    const userId = req.user.id; // 현재 로그인한 사용자 ID

    try {
        // 이미 참여한 그룹인지 확인
        const [rows] = await db.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        if (rows.length > 0) {
            return res.redirect('/group-search?error=already_in_group');
        }

        // 그룹에 사용자 추가
        await db.execute(
            'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
            [groupId, userId]
        );

        res.redirect('/my-groups'); // 성공 후 내 그룹으로 리다이렉트하기
    } catch (err) {
        console.error('그룹 참여 중 에러:', err);
        next(err);
    }
};

// 메뉴 제외
exports.excludeMenu = async (req, res, next) => {
    const { groupId } = req.params;
    const { excludedMenus } = req.body;
    const userId = req.user.id;

    try {
        if (!excludedMenus) {
            return res.status(400).send('제외할 메뉴를 선택해주세요.');
        }

        const menus = Array.isArray(excludedMenus) ? excludedMenus : [excludedMenus];

        // 기존 제외 메뉴 삭제
        await db.execute('DELETE FROM excluded_menus WHERE group_id = ? AND user_id = ?', [groupId, userId]);

        // 새로 제외 메뉴 추가 (내가 선택한 제외메뉴 업데이트)
        const values = menus.map((menu) => [groupId, userId, menu]);
        await db.query('INSERT INTO excluded_menus (group_id, user_id, menu_name) VALUES ?', [values]);

        res.sendStatus(200);
    } catch (err) {
        console.error('Error excluding menu:', err);
        next(err);
    }
};

// 메뉴 추천
exports.recommendMenu = async (req, res, next) => {
    const { groupId } = req.params;

    try {
        // 그룹 카테고리 가져오기
        const [groupRows] = await db.execute('SELECT category FROM user_groups WHERE id = ?', [groupId]);
        if (groupRows.length === 0) {
            return res.status(404).send('그룹을 찾을 수 없습니다.');
        }

        const category = groupRows[0].category;
        let menus = [...defaultMenus[category]];   // defaultMenus[카테고리]에있는 메뉴들 리스트

        // 전체 제외 메뉴 가져오기
        const [excludedRows] = await db.execute('SELECT menu_name FROM excluded_menus WHERE group_id = ?', [groupId]);
        const excludedMenus = excludedRows.map((row) => row.menu_name); // 메뉴이름으로 매핑해서 가져옴

        // 제외된 메뉴 제거
        menus = menus.filter((menu) => !excludedMenus.includes(menu));

        // 메뉴길이가 0이면 추천가능 메뉴가없음
        if (menus.length === 0) {
            return res.status(200).json({ recommendedMenu: '추천 가능한 메뉴가 없습니다.' });
        }

        // 메뉴길이만큼의 값(인덱스)를 랜덤으로 뽑아 menus에서 추출한다.
        const recommendedMenu = menus[Math.floor(Math.random() * menus.length)];
        res.json({ recommendedMenu });  // json보낸다.
    } catch (err) {
        console.error('Error recommending menu:', err);
        next(err);
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




