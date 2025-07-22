/* This controller handles all function related to posts from creating, fetching, updating and deletion*/
const pool = require('../config/database');

const addNotification = async (notification_type,notified_id,notifier_id,post_id) => {
    try {
        const [add_notification] = await pool.query(`INSERT INTO alert_notification (notification_type,notified_userid,notifier_userid,post_id) VALUES (?,?,?,?)`,[notification_type,notified_id,notifier_id,post_id]);    
        // console.log('notification successfully created')
    } catch (error) {
        return res.status(500).json({
            status:'Error',
            message:'There was an error sending notification'
        })
    }
}

const getAllAlerts = async (req,res) => {
    try {
        const[get_all_alert] = await pool.query(`
            SELECT u.user_id,u.username,
            (
                SELECT JSON_ARRAYAGG(notifData) FROM (
                SELECT JSON_OBJECT('postID', p.post_id,'title',p.title,
                'react',
                    (
                        SELECT JSON_ARRAYAGG(reactData) FROM 
                            (
                                SELECT JSON_OBJECT('reactorID',r_an.notifier_userid,
                                'reactorusername', ru.username,
                                'reactTime', r_an.created_at) AS reactData FROM alert_notification r_an JOIN user_profile ru ON r_an.notifier_userid = ru.user_id WHERE r_an.post_id = p.post_id AND r_an.notification_type = 1
                            ) AS postReactNotif
                    ),
                'comment', 
                    (
                        SELECT JSON_ARRAYAGG(commentData) FROM 
                            (
                                SELECT JSON_OBJECT('commenterID',c_an.notifier_userid,
                                'commenterusername',cu.username,
                                'commentTime',c_an.created_at) AS commentData FROM alert_notification c_an JOIN user_profile cu ON c_an.notifier_userid = cu.user_id WHERE c_an.post_id = p.post_id AND c_an.notification_type = 2
                            ) AS postCommentData
                    )
                ) AS notifData 
                    FROM user_posts p WHERE p.user_id = u.user_id AND (
                        EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 1) OR 
                            EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 2) )
                    ) AS posts
            ) AS postData, (SELECT COUNT(*) FROM alert_notification an WHERE an.notified_userid = u.user_id AND an.is_read = FALSE ) AS unreadNotif FROM user_profile u`,
    )

        return res.status(200).json({
            status:'Success',
            total_react:get_all_alert.length,
            result:get_all_alert
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting alerts'
        })
    }

}

const getAlert = async (req,res) => {
    const{id} = req.params;
    try {
        const[get_alert] = await pool.query(
            `SELECT u.user_id,u.username,
            (
                SELECT JSON_ARRAYAGG(notifData) FROM (
                SELECT JSON_OBJECT('postID', p.post_id,'title',p.title,
                'react',
                    (
                        SELECT JSON_ARRAYAGG(reactData) FROM 
                            (
                                SELECT JSON_OBJECT(
                                'notifID',r_an.notification_id,
                                'reactorID',r_an.notifier_userid,
                                'reactorusername', ru.username,
                                'reactTime', r_an.created_at) AS reactData FROM alert_notification r_an JOIN user_profile ru ON r_an.notifier_userid = ru.user_id WHERE r_an.post_id = p.post_id AND r_an.notification_type = 1 AND r_an.is_read = FALSE ORDER BY r_an.created_at DESC
                            ) AS postReactNotif
                    ),
                'comment', 
                    (
                        SELECT JSON_ARRAYAGG(commentData) FROM 
                            (
                                SELECT JSON_OBJECT(
                                'notifID',c_an.notification_id,
                                'commenterID',c_an.notifier_userid,
                                'commenterusername',cu.username,
                                'commentTime',c_an.created_at) AS commentData FROM alert_notification c_an JOIN user_profile cu ON c_an.notifier_userid = cu.user_id WHERE c_an.post_id = p.post_id AND c_an.notification_type = 2 AND c_an.is_read = FALSE ORDER BY c_an.created_at DESC
                            ) AS postCommentData
                    )
                ) AS notifData 
                    FROM user_posts p WHERE p.user_id = u.user_id AND (
                        EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 1 AND an.is_read = FALSE) OR 
                            EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 2 AND an.is_read = FALSE) )
                    ) AS posts
            ) AS postData, (SELECT COUNT(*) FROM alert_notification an WHERE an.notified_userid = u.user_id AND an.is_read = FALSE ) AS unreadNotif FROM user_profile u WHERE u.user_id = ?`
            ,[id]);

        return res.status(200).json({
            status:'Success',
            result:get_alert
        })
    } catch (error) {
        console.error(error)
         return res.status(500).json({
            status:'Error',
            message:'There was an error getting alerts'
        })
    }
}

const getAlertByPost = async (req,res) => {
    const{id} = req.params;
    try {
        const[get_alert] = await pool.query(`SELECT u.user_id,u.username,
        (
            SELECT JSON_ARRAYAGG(notifData) FROM (
            SELECT JSON_OBJECT('postID', p.post_id,'title',p.title,
            'react',
                (
                    SELECT JSON_ARRAYAGG(reactData) FROM 
                        (
                            SELECT JSON_OBJECT('reactorID',r_an.notifier_userid,
                            'reactorusername', ru.username,
                            'reactTime', r_an.created_at) AS reactData FROM alert_notification r_an JOIN user_profile ru ON r_an.notifier_userid = ru.user_id WHERE r_an.post_id = p.post_id AND r_an.notification_type = 1
                        ) AS postReactNotif
                ),
            'comment', 
                (
                    SELECT JSON_ARRAYAGG(commentData) FROM 
                        (
                            SELECT JSON_OBJECT('commenterID',c_an.notifier_userid,
                            'commenterusername',cu.username,
                            'commentTime',c_an.created_at) AS commentData FROM alert_notification c_an JOIN user_profile cu ON c_an.notifier_userid = cu.user_id WHERE c_an.post_id = p.post_id AND c_an.notification_type = 2
                        ) AS postCommentData
                )
            ) AS notifData 
                FROM user_posts p WHERE p.user_id = u.user_id AND p.post_id = ? AND (
                    EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 1) OR 
                        EXISTS(SELECT 1 FROM alert_notification an WHERE p.post_id = an.post_id AND an.notification_type = 2) )
                ) AS posts
        ) AS postData, (SELECT COUNT(*) FROM alert_notification an WHERE an.notified_userid = u.user_id AND an.is_read = FALSE ) AS unreadNotif 
        FROM user_profile u`,[id]);

        return res.status(200).json({
            status:'Success',
            result:get_alert[0]
        })
    } catch (error) {
         //console.error(error);
         return res.status(500).json({
            status:'Error',
            message:'There was an error getting the post'
        })
    }
}


const updateAlert = async (req,res) => {
    const {id} = req.params;
    let {ids} = req.body;
    
    try {
        if (!Array.isArray(ids)) {
            ids = [parseInt(ids)];
        } else {
            ids = ids.map(ids => parseInt(ids))
        }
        const [checkUserId] = await pool.query(`SELECT notified_userid FROM alert_notification WHERE notification_id IN (?)`,[ids])
        if(checkUserId.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No matching alerts found'
            })
        }
        for(let i=0;i<checkUserId.length;i++){
            if(checkUserId[i].notified_userid !== parseInt(id)){
                return res.status(400).json({
                    status:'Error',
                    message:'id dont match our records'
                })
            }
        }
        const [update_post] = await pool.query(`UPDATE alert_notification SET is_read = TRUE WHERE notification_id IN (?)`,[ids]);
        return res.status(200).json({
            status:'Success',
            message:'Alerts updated'
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error processing your request'
        })
    } 
}

module.exports = {addNotification,getAllAlerts,getAlert,getAlertByPost,updateAlert};