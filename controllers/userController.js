const db = require('../models');

exports.leaveGroup = async (req, res, next) => {
    const { groupId } = req.body;
    try {
        await db.execute('DELETE FROM user_groups WHERE group_id = ? AND user_id = ?', [groupId, req.user.id]);
        res.redirect('/my-group');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.excludeMenu = async (req, res, next) => {
    const { groupId, menu } = req.body;
    try {
        await db.execute('INSERT INTO exclusions (group_id, menu) VALUES (?, ?)', [groupId, menu]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
