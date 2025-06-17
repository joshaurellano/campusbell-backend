const pool = require ('../config/database');
const{addNotification} = require('./notificationController');

const addReact = async (req, res) => {
    const {user_id,post_id} = req.body;

    try {
        //check first of user already reacted to post
        
        const check_react = await checkIfUserReacted(user_id, post_id)
        if (check_react === false)
        {
        const[add_react,post_owner_result] = await Promise.all([
            pool.query(`INSERT INTO post_react (react_post_id, react_user_id) VALUES (?,?)`,[post_id, user_id]),
            pool.query(`SELECT user_id FROM user_posts WHERE post_id = ?`,[post_id])
        ]);

        const post_owner = post_owner_result[0]; 
        const notification_type = 1;
        const notifier_id = user_id;
        const notified_id = post_owner[0].user_id;

        const add_alert = await addNotification(notification_type,notified_id,notifier_id,post_id);

        return res.status(201).json({
            status:'Success',
            message:'Post reacted successfully',
            reacted: true 
        })
    } else if(check_react === true) {

        const remove_react = await delReact(user_id, post_id);
        return res.status(200).json({
            status:'Success',
            message:'Successfully removed the reaction',
            reacted: false 
        })
    }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error reacting to the post'
        })
    }
}
const delReact = async (user_id, postId) => {
    try {
        const [delete_react] = await pool.query(`DELETE FROM post_react WHERE react_user_id = ? AND react_post_id = ?`,[user_id, postId]);
    } catch (error) {
        console.error(error);
    }
}
const viewPostReact = async (req, res) => {
    const {id} = req.params;
    try {
        const [view_post_react] = await pool.query(`
            SELECT up.post_id AS postId, up.title AS postTitle,(SELECT COUNT(*) FROM post_react WHERE react_post_id = up.post_id ) AS reactCount,(
            SELECT JSON_ARRAYAGG (react_data) FROM 
            (
                SELECT JSON_OBJECT(
                'userId',u.user_id,
                'username',u.username,
                'react_time',react_time) AS react_data FROM user_profile u INNER JOIN post_react ON u.user_id = react_user_id WHERE post_react.react_post_id = up.post_id
            ) AS ordered_users
        ) AS reactors FROM user_posts up WHERE up.post_id = ?`,[id])
         if(view_post_react.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No data available'
            })
         }
         return res.status(200).json({
            status:'Success',
            result:view_post_react
         })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reacts from post'
        })
    }
}
const viewUserReact = async (req, res) => {
    const {id} = req.params;
    try {
        const [view_user_react] = await pool.query(`
           SELECT u.user_id AS 'userId', u.username AS 'username',
            (
                SELECT JSON_ARRAYAGG(post_data) FROM
                (
                    SELECT JSON_OBJECT(
                    'postID',p.post_id,
                    'postTitle',p.title,
                    'react_time', react_time) AS post_data FROM user_posts p INNER JOIN post_react ON p.post_id = react_post_id WHERE post_react.react_user_id = u.user_id
                ) AS ordered_posts
            ) AS reacted_posts FROM user_profile u 
            WHERE u.user_id = ?`,[id])
         if(view_user_react.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No data available'
            })
         }
         return res.status(200).json({
            status:'Success',
            result:view_user_react
         })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reacts of user'
        })
    }
}
const viewAllPostReact = async (req, res) => {
    try {
        const [view_all_post_react] = await pool.query(`
            SELECT up.post_id AS postId, up.title AS postTitle,(SELECT COUNT(*) FROM post_react WHERE react_post_id = up.post_id ) AS reactCount,(
            SELECT JSON_ARRAYAGG (react_data) FROM 
            (
                SELECT JSON_OBJECT(
                'userId',u.user_id,
                'username',u.username,
                'react_time',react_time) AS react_data FROM user_profile u INNER JOIN post_react ON u.user_id = react_user_id WHERE post_react.react_post_id = up.post_id
            ) AS ordered_users
        ) AS reactors FROM user_posts up`)
         if(view_all_post_react.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No data available'
            })
         }
         return res.status(200).json({
            status:'Success',
            result:view_all_post_react
         })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reacts from all posts'
        })
    }
}
const viewAllUserReact = async (req, res) => {
    try {
        const [view_all_user_react] = await pool.query(`
           SELECT u.user_id AS 'userId', u.username AS 'username',
            (
                SELECT JSON_ARRAYAGG(post_data) FROM
                (
                    SELECT JSON_OBJECT(
                    'postID',p.post_id,
                    'postTitle',p.title,
                    'react_time', react_time) AS post_data FROM user_posts p INNER JOIN post_react ON p.post_id = react_post_id WHERE post_react.react_user_id = u.user_id
                ) AS ordered_posts
            ) AS reacted_posts FROM user_profile u`)
         if(view_all_user_react.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No data available'
            })
         }
         return res.status(200).json({
            status:'Success',
            result:view_all_user_react
         })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reacts of all users'
        })
    }
}
const checkIfUserReacted = async (user_id, post_id) => {
    try {
        const[check_if_reacted] = await pool.query(`SELECT react_user_id FROM post_react WHERE react_post_id = ? AND react_user_id = ?`,[post_id, user_id])
        if(check_if_reacted.length === 0) {
            return false
        }else {
            return true
        }

    } catch (error) {
        console.error(error)
    }
}

module.exports = {addReact,viewPostReact,viewUserReact,viewAllPostReact,viewAllUserReact,checkIfUserReacted}