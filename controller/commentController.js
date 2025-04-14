const pool = require ('../config/database');

const createComment = async (req,res) => {
    const {user_id,post_id,body} = req.body;
    try {
        const [create_comment] = await pool.query
        (`INSERT INTO post_comments (user_id, post_id, body)
        VALUES (?,?,?)`,[user_id, post_id,body]);
        if(create_comment.affectedRows === 0){
            return res.status(400).json({
                status:'Error',
                message:'Please try again'
            })
        }
        return res.status(201).json({
            status:'Success',
            message:'Comment created succesfully'
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error inserting comment'
        })
    }
}
const getAllComments = async (req,res) => {
    try {
        const [get_all_comments] = await pool.query(`SELECT c.comment_id AS commentID,
        u.user_id AS userID, 
        u.username AS username, 
        p.post_id AS postID,
        p.title AS title, 
        c.body AS content,
        c.created_at AS date_created,
        c.updated_at AS date_updated 
        FROM post_comments c INNER JOIN user_profile u 
        ON c.user_id = u.user_id 
        INNER JOIN user_posts p 
        ON c.post_id = p.post_id`)
        if(get_all_comments.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No comment available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_comments:get_all_comments.length,
            result:get_all_comments
        })

    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all comments'
        })
    }
}
const getCommentByPost = async (req,res) => {
    const {id} = req.params;
    try {
        const [get_comment_by_post] = await pool.query (`SELECT c.comment_id AS commentID,
        u.user_id AS userID, 
        u.username AS username, 
        p.post_id AS postID,
        p.title AS title, 
        c.body AS content,
        c.created_at AS date_created,
        c.updated_at AS date_updated 
        FROM post_comments c INNER JOIN user_profile u 
        ON c.user_id = u.user_id 
        INNER JOIN user_posts p 
        ON c.post_id = p.post_id WHERE c.post_id = ?`,[id]);

        if(get_comment_by_post.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No comment available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_comments:get_comment_by_post.length,
            result:get_comment_by_post
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all comments'
        })
    }
}
const getCommentByUser = async (req,res) => {
    const {id} = req.params;
    try {
        const[get_comment_by_user] = await pool.query(`SELECT c.comment_id AS commentID,
            u.user_id AS userID, 
            u.username, 
            p.post_id AS postID,
            p.title AS title, 
            c.body AS content,
            c.created_at AS date_created,
            c.updated_at AS date_updated 
            FROM post_comments c INNER JOIN user_profile u 
            ON c.user_id = u.user_id 
            INNER JOIN user_posts p 
            ON c.post_id = p.post_id WHERE c.user_id = ?`,[id])

            if(get_comment_by_user.length === 0){
                return res.status(404).json({
                    status:'Error',
                    message:'No comment available'
                })
            }
            return res.status(200).json({
                status:'Success',
                total_comments:get_comment_by_user.length,
                result:get_comment_by_user
            })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all comments'
        })
    }
}
const getComment = async (req,res) => {
    const {id} = req.params;
    try {
        const[get_comment] = await pool.query(`SELECT c.comment_id AS commentID,
        u.user_id AS userID, 
        u.username AS username, 
        p.post_id AS postID,
        p.title AS title, 
        c.body AS content,
        c.created_at AS date_created,
        c.updated_at AS date_updated 
        FROM post_comments c INNER JOIN user_profile u 
        ON c.user_id = u.user_id 
        INNER JOIN user_posts p 
        ON c.post_id = p.post_id WHERE comment_id = ?`,[id]) 

        if(get_comment.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Comment not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            result:get_comment[0]
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting the comment'
        })
    }
}
const updateComment = async (req,res) => {
    const {id} = req.params;
    const{body} = req.body;
    try {
        const[update_comment] = await pool.query(`UPDATE post_comments SET body = ? WHERE comment_id = ?`,[body,id]);
        if(update_comment.affectedRows[0]){
            return res.status(404).json({
                status:'Error',
                message:'Comment not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Comment updated successfully'
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error updating comment'
        })
    }
}
const deleteComment = async (req,res) => {
    const {id} = req.params;
    try {
        const [del_comment] = await pool.query (`DELETE FROM post_comments WHERE comment_id = ?`,[id]);
        if(del_comment.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Comment not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Comment removed successfully'
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error removing comment'
        })
    }
}

module.exports = {createComment,getAllComments,getCommentByPost,
    getCommentByUser,getComment,updateComment,deleteComment}