const pool = require('../config/database');

const createReply = async (req,res) => {
    const {user_id, comment_id, post_id, body} = req.body;
    try {
        const [create_reply] = await pool.query (`INSERT INTO comment_reply 
            (user_id, comment_id, post_id, body) VALUES(?,?,?,?)`,[user_id,comment_id,post_id,body]);
        
        return res.status(201).json({
            status:'Success',
            message:'Reply created successfully'
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error creating reply'
        })
    }
}
const getAllReply = async (req,res) => {
    try {
        const[get_all_reply] = await pool.query(`SELECT u.user_id AS userID, 
        u.username AS username, 
        p.post_id AS postID,
        p.title AS title, 
        c.body AS comment_content,
        r.reply_id AS replyID,
        r.body AS reply_content,
        r.created_at AS date_created,
        r.updated_at AS date_posted 
        FROM comment_reply r INNER JOIN post_comments c ON r.comment_id = c.comment_id
        INNER JOIN user_posts p ON p.post_id = r.post_id 
        INNER JOIN user_profile u ON r.user_id = u.user_id`)
        if(get_all_reply.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'No reply available'
            })
        }
        return res.status(200).json({
            status:'Error',
            total_reply:get_all_reply.length,
            result:get_all_reply
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all replies'
        })
    }
}
const getAllReplyByComments = async (req,res) => {
    const{id} = req.body
    try {
        const [get_all_reply_by_comment] = await pool.query(`SELECT u.user_id AS userID, 
        u.username AS username, 
        p.title AS title, 
        c.body AS comment_content,
        r.reply_id AS replyID,
        r.body AS reply_content,
        r.created_at AS date_created,
        r.updated_at AS date_posted 
        FROM comment_reply r INNER JOIN post_comments c ON r.comment_id = c.comment_id
        INNER JOIN user_posts p ON p.post_id = r.post_id 
        INNER JOIN user_profile u ON r.user_id = u.user_id WHERE r.comment_id = ?`,[id])

        if(get_all_reply_by_comment.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No reply available'
            })
        }
        else{
            return res.status(200).json({
                status:'Succes',
                total_reply:get_all_reply_by_comment.length,
                result:get_all_reply_by_comment
            })
        }
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all replies'
        })
    }
}
const getAllReplyByUser = async (req,res) => {
    const{id} = req.body;
    try {
        const[get_all_reply_by_user] = await pool.query(`SELECT r.reply_id AS replyID,
        u.username AS username, 
        p.title AS title, 
        c.body AS comment_content,
        r.body AS reply_content,
        r.created_at AS date_created,
        r.updated_at AS date_posted 
        FROM comment_reply r INNER JOIN post_comments c ON r.comment_id = c.comment_id
        INNER JOIN user_posts p ON p.post_id = r.post_id 
        INNER JOIN user_profile u ON r.user_id = u.user_id WHERE r.user_id = ?`,[id]);

        if(get_all_reply_by_user.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'No reply available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_reply:get_all_reply_by_user.length,
            result: get_all_reply_by_user
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all replies'
        })
    }
}
const getReply = async (req,res) => {
    const{id} = req.body;
    try {
        const[get_reply] = await pool.query(`SELECT r.reply_id AS replyID,
        u.user_id AS userID, 
        u.username AS username, 
        p.post_id AS postID,
        p.title AS title, 
        c.comment_id AS commentID,
        c.body AS comment_content,
        r.body AS reply_content,
        r.created_at AS date_created,
        r.updated_at AS date_posted 
        FROM comment_reply r INNER JOIN post_comments c ON r.comment_id = c.comment_id
        INNER JOIN user_posts p ON p.post_id = r.post_id 
        INNER JOIN user_profile u ON r.user_id = u.user_id WHERE r.reply_id = ?`,[id]);

        if(get_reply.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'No reply available'
            })
        }
        return res.status(200).json({
            status:'Success',
            result: get_reply[0]
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting the reply'
        })
    }
}
const updateReply = async (req,res) => {
    const{id} = req.params;
    const{body} = req.body
    try {
        const [update_reply] = await pool.query(`UPDATE comment_reply SET body = ? WHERE reply_id = ?`,[body,id])
        if(update_reply.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Reply is not available to update'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Reply updated successfully'
        })
        
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error updating the reply'
        })
    }
}
const deleteReply = async (req,res) => {
    const{id} = req.params;
    try {
        const[del_reply] = await pool.query(`DELETE FROM comment_reply WHERE reply_id = ?`,[id]);
        if(del_reply.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Reply is not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Reply removed successfully'
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error removing the reply'
        })
    }
}
module.exports = {createReply,getAllReply,getAllReplyByComments,
    getAllReplyByUser,getReply,updateReply,deleteReply}