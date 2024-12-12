const db = require('../models'); // DB 연결 가져오기
const path = require('path');
const defaultMenus = require(path.join(__dirname, '../data/defaultMenus.json'));

// 그룹 찾기 페이지
exports.renderGroupSearchPage = async (req, res, next) => {
    try {
        const query = `
            SELECT id, group_name AS groupName, category
            FROM user_groups
        `;
        const [groups] = await db.execute(query);
        res.render('groupSearch', {
            title: '그룹 찾기 - 밥머먹꼬',
            user: req.user,
            groups,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 내 그룹 페이지
exports.renderMyGroupsPage = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new Error('로그인된 사용자가 아닙니다.');
        }

        const userId = req.user.id;

        // 사용자가 참여한 그룹 및 생성한 그룹 가져오기
        const query = `
            SELECT g.id, g.group_name AS groupName, g.category
            FROM user_groups AS g
                     LEFT JOIN group_members AS gm ON g.id = gm.group_id
            WHERE gm.user_id = ? OR g.owner_id = ?
        `;
        const [groups] = await db.execute(query, [userId, userId]);

        const selectedGroupId = req.query.groupId;
        let selectedGroup = null;
        let userIsOwner = false;

        if (selectedGroupId) {
            // 선택된 그룹 상세 정보 가져오기
            const groupQuery = `
                SELECT g.group_name AS groupName, g.category, g.id, g.password, g.owner_id AS ownerId, u.username AS ownerName
                FROM user_groups AS g
                         JOIN users AS u ON g.owner_id = u.id
                WHERE g.id = ?
            `;
            const [groupData] = await db.execute(groupQuery, [selectedGroupId]);
            selectedGroup = groupData[0];

            const membersQuery = `
                SELECT u.username
                FROM users AS u
                         JOIN group_members AS gm ON u.id = gm.user_id
                WHERE gm.group_id = ?
            `;
            const [members] = await db.execute(membersQuery, [selectedGroupId]);

            selectedGroup.members = members.map((m) => m.username);
            userIsOwner = selectedGroup.ownerId === req.user.id;

            // JSON에서 category에 따른 메뉴 가져오기
            selectedGroup.menus = defaultMenus[selectedGroup.category] || [];
        }

        res.render('myGroups', {
            title: '내 그룹 - 밥머먹꼬',
            user: req.user,
            groups,
            selectedGroup,
            userIsOwner,
        });
    } catch (error) {
        console.error('Error in renderMyGroupsPage:', error.message);
        next(error);
    }
};


// 식사 로그 페이지
exports.renderMealLogPage = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT g.group_name AS groupName, g.category
            FROM user_groups AS g
            JOIN group_members AS gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
        `;
        const [groups] = await db.execute(query, [userId]);

        res.render('mealLog', {
            title: '식사 로그 - 밥머먹꼬',
            user: req.user,
            groups,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
