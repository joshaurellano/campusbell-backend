/* This controller handles all function related to posts from creating, fetching, updating and deletion*/
const pool = require('../config/database');

//handles post creation function
const createNewPost = async (req,res) => {
    const{title, body, user_id} = req.body;
    try {
        const [create_post] = await pool.query(`INSERT INTO user_posts (title,body,user_id) VALUES (?, ?, ?)`,[title,body,user_id]);    
        return res.status(201).json({
            status:'Success',
            message:'Post successfully created'
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error editing post'
        })
    }
}
//Handles getting all post 
//This handles all post only

/*For function holding all content(post + comments + reply), there is another controller holding that*/
const getAllPost = async (req,res) => {
    try {
        const[get_all_post] = await pool.query(`SELECT 
        p.post_id AS postID,
        u.username AS username,
        p.title AS title,
        p.body AS content,
        p.created_at AS date_posted,
        (
            SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
        ) AS commentCount,

        (
            SELECT JSON_OBJECTAGG(comment_id,JSON_OBJECT(
            'commentID',c.comment_id,
            'replyCount',
            (
                SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
            ),
            'username',cu.username,
            'body',c.body,
            'date_posted',c.created_at,
            'replies',
                (
                    SELECT JSON_OBJECTAGG(reply_id,
                    JSON_OBJECT(
                    'replyID',r.reply_id,
                    'username',ru.username,
                    'body',r.body,
                    'date_posted',r.created_at)) 
                    FROM comment_reply r LEFT JOIN user_profile ru
                    ON ru.user_id = r.user_id
                    WHERE r.comment_id = c.comment_id
                )
            ))
            FROM post_comments c LEFT JOIN user_profile cu 
            ON c.user_id = cu.user_id
            WHERE c.post_id = p.post_id
        ) AS comments FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id`
    )

        if(get_all_post.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No post available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_post:get_all_post.length,
            result:get_all_post
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all posts'
        })
    }

}
//Get particular post
const getPost = async (req,res) => {
    const{id} = req.params;
    try {
        const[get_post] = await pool.query(`SELECT 
        p.post_id AS postID,
        u.username AS username,
        p.title AS title,
        p.body AS content,
        p.created_at AS date_posted,
        (
            SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
        ) AS commentCount,
        (
            SELECT JSON_OBJECTAGG(comment_id,JSON_OBJECT(
            'commentID',c.comment_id,
            'replyCount',
            (
                SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
            ),
            'username',cu.username,
            'body',c.body,
            'date_posted',c.created_at,
            'replies',
                (
                    SELECT JSON_OBJECTAGG(reply_id,
                    JSON_OBJECT(
                    'replyID',r.reply_id,
                    'username',ru.username,
                    'body',r.body,
                    'date_posted',r.created_at)) 
                    FROM comment_reply r LEFT JOIN user_profile ru
                    ON ru.user_id = r.user_id
                    WHERE r.comment_id = c.comment_id
                )
            ))
            FROM post_comments c LEFT JOIN user_profile cu 
            ON c.user_id = cu.user_id
            WHERE c.post_id = p.post_id
        ) AS comments FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id
            WHERE p.post_id = ?`,[id]);

        if(get_post.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Post not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            result:get_post[0]
        })
    } catch (error) {
         // console.error(error);
         return res.status(500).json({
            status:'Error',
            message:'There was an error getting all posts'
        })
    }
}
//Get post by particular user
const getPostBy = async (req,res) => {
    const {id} = req.params;
    try {
        const [get_post_by] = await pool.query(`SELECT 
            u.username AS username,
            p.title AS title,
            p.body AS content,
            p.created_at AS date_posted,
            p.updated_at AS date_updated 
            FROM user_profile u INNER JOIN user_posts p ON u.user_id = p.user_id 
            WHERE p.user_id = ?`,[id]);
            
        if(get_post_by.length === 0){
                return res.status(404).json({
                    status:'Error',
                    message:'No post available'
                })
        }
        return res.status(200).json({
            status:'Success',
            total_post: get_post_by.length,
            result: get_post_by
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all posts'
        })
    }
}
const getPostByTopic = async (req,res) => {
    const {id} = req.body;
    try {
        const [get_post_by_topic] = await pool.query(`SELECT 
            u.username AS username,
            p.title AS title,
            p.body AS content,
            p.created_at AS date_posted,
            p.updated_at AS date_updated 
            FROM user_profile u INNER JOIN user_posts p ON u.user_id = p.user_id 
            WHERE p.topic_id = ?`)
        if(get_post_by_topic.length === 0) {
            return res.statustus(404).json({
                status:'Error',
                message:'No Post available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_post:get_post_by_topic.length,
            result:get_post_by_topic
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all post'
        })
    }
}
//Update post
const updatePost = async (req,res) => {
    const {id} = req.params;
    const {title, body} = req.body;
    try {
        const[update_post] = await pool.query(`UPDATE user_posts SET title = ?, body = ? WHERE post_id = ?`,[title, body,id]);
        if(update_post.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Post not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Post updated successfully'
        })
    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error processing your request'
        })
    } 
}
//Delete post
const deletePost = async (req,res) => {
    const {id} = req.params;
    try {
        const[del_post] = await pool.query(`DELETE FROM user_posts WHERE post_id = ?`,[id]);
        if(del_post.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Post not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Post removed successful'
        })
    } catch (error) {
         // console.error(error);
         return res.status(500).json({
            status:'Error',
            message:'There was an error processing your request'
        })
    }
}
module.exports = {createNewPost,getAllPost,getPost,getPostBy,getPostByTopic,updatePost,deletePost};