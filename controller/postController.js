/* This controller handles all function related to posts from creating, fetching, updating and deletion*/
const pool = require('../config/database');
const {checkIfUserReacted} = require('./reactsController')

//handles post creation function
const createNewPost = async (req,res) => {
    const{title, body, user_id, topic_id, image} = req.body;
    try {
        const [create_post] = await pool.query(`INSERT INTO user_posts (title,body,user_id,topic_id,image) VALUES (?, ?, ?, ?, ?)`,[title,body,user_id,topic_id, image]);    
        return res.status(201).json({
            status:'Success',
            message:'Post successfully created'
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error creating post'
        })
    }
}
//Handles getting all post 

const getAllPost = async (req,res) => {
    const userID = req.userId;
    //const cursor = req.query.cursor;
    const page  = parseInt(req.query.page)
    const limit = parseInt(req.query.limit);
    const lastId = parseInt(req.query.lastId)
    let dbQuery;
    let values;
    let moreItems;
    if(page > 1){
            dbQuery = `SELECT 
            p.post_id AS postID,
            u.username AS username,
            u.profile_image,
            u.first_name,
            u.last_name,
            u.role_id,
            t.topic_name,
            p.title AS title,
            p.body AS content,
            p.created_at AS date_posted,
            p.image,
            (
                    SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
                ) AS commentCount,

                (
                    SELECT JSON_ARRAYAGG(comment_data)
                        
                    FROM
                        (
                            SELECT JSON_OBJECT(
                                'commentID',c.comment_id,
                                'username',cu.username,
                                'body',c.body,
                                'date_posted',c.created_at,
                                'replyCount',
                                (
                                    SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
                                ),
                                'replies', (
                                    SELECT 
                                        JSON_ARRAYAGG(reply_data)
                                        FROM (
                                            SELECT JSON_OBJECT(
                                                'replyID',r.reply_id,
                                                'username',ru.username,
                                                'body',r.body,
                                                'date_posted',r.created_at
                                            ) AS reply_data FROM comment_reply r LEFT JOIN user_profile ru
                                            ON ru.user_id = r.user_id
                                            WHERE r.comment_id = c.comment_id
                                            ORDER BY r.created_at DESC
                                        ) AS ordered_replies
                                )
                            ) AS comment_data FROM post_comments c 
                            LEFT JOIN user_profile cu 
                            ON c.user_id = cu.user_id
                            WHERE c.post_id = p.post_id
                            ORDER BY c.created_at DESC
                        ) AS ordered_comments
                    ) AS comments,(SELECT COUNT(*) FROM post_react WHERE react_post_id = p.post_id ) AS reactCount,(
            SELECT JSON_ARRAYAGG (react_data) FROM 
            (
                SELECT JSON_OBJECT(
                'userId',u.user_id,
                'username',u.username,
                'react_time',react_time) AS react_data FROM user_profile u INNER JOIN post_react ON u.user_id = react_user_id WHERE post_react.react_post_id = p.post_id
                    ) AS ordered_users
            ) AS reactors FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id 
            INNER JOIN forum_topics t ON p.topic_id = t.topic_id
            WHERE p.post_id < ?
            ORDER BY p.created_at DESC LIMIT ?`
            values = [lastId, limit]
    }else {
            dbQuery = `SELECT 
            p.post_id AS postID,
            u.username AS username,
            u.first_name,
            u.last_name,
            u.role_id,
            u.profile_image,
            t.topic_name,
            p.title AS title,
            p.body AS content,
            p.created_at AS date_posted,
            p.image,
            (
                    SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
                ) AS commentCount,

                (
                    SELECT JSON_ARRAYAGG(comment_data)
                        
                    FROM
                        (
                            SELECT JSON_OBJECT(
                                'commentID',c.comment_id,
                                'username',cu.username,
                                'body',c.body,
                                'date_posted',c.created_at,
                                'replyCount',
                                (
                                    SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
                                ),
                                'replies', (
                                    SELECT 
                                        JSON_ARRAYAGG(reply_data)
                                        FROM (
                                            SELECT JSON_OBJECT(
                                                'replyID',r.reply_id,
                                                'username',ru.username,
                                                'body',r.body,
                                                'date_posted',r.created_at
                                            ) AS reply_data FROM comment_reply r LEFT JOIN user_profile ru
                                            ON ru.user_id = r.user_id
                                            WHERE r.comment_id = c.comment_id
                                            ORDER BY r.created_at DESC
                                        ) AS ordered_replies
                                )
                            ) AS comment_data FROM post_comments c 
                            LEFT JOIN user_profile cu 
                            ON c.user_id = cu.user_id
                            WHERE c.post_id = p.post_id
                            ORDER BY c.created_at DESC
                        ) AS ordered_comments
                    ) AS comments,(SELECT COUNT(*) FROM post_react WHERE react_post_id = p.post_id ) AS reactCount,(
            SELECT JSON_ARRAYAGG (react_data) FROM 
            (
                SELECT JSON_OBJECT(
                'userId',u.user_id,
                'username',u.username,
                'react_time',react_time) AS react_data FROM user_profile u INNER JOIN post_react ON u.user_id = react_user_id WHERE post_react.react_post_id = p.post_id
                    ) AS ordered_users
            ) AS reactors FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id 
            INNER JOIN forum_topics t ON p.topic_id = t.topic_id
            ORDER BY p.created_at DESC LIMIT ?`
            values = [limit]
    }
    try {
        const[get_all_post] = await pool.query(dbQuery,values)
        
        if(get_all_post.length === 0){
            moreItems = false
            return res.status(404).json({
                more_items:moreItems,
                status:'Error',
                message:'No data available'
            })
        }
        
        const postsWithReaction = await Promise.all(get_all_post.map(async post => {
        const hasReacted = await checkIfUserReacted(userID, post.postID);
        return {
            ...post,
            reacted: hasReacted
        };
    }));
    
    const nextID = get_all_post.length?get_all_post[get_all_post.length -1].postID: null
        if(nextID > 0){
            moreItems = true
        } else if(nextID === 1) {
            moreItems = false
        }
    if(moreItems === false) {
        return res.json({
            message:'No more data available'
        })
    }

        return res.status(200).json({
            status:'Success',
            total_post:postsWithReaction.length,
            nextID:nextID,
            more_items:moreItems,
            result:postsWithReaction
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all posts'
        })
    }

}
//Get particular post
const getPost = async (req,res) => {
    const{id} = req.params;
    const userID = req.userId;
    try {
        const[get_post] = await pool.query(`SELECT 
        p.post_id AS postID,
        u.username AS username,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.role_id,
        t.topic_name,
        p.title AS title,
        p.body AS content,
        p.created_at AS date_posted,
        p.image,
        (
            SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
        ) AS commentCount,

        (
            SELECT JSON_ARRAYAGG(comment_data)
				
            FROM
				(
					SELECT JSON_OBJECT(
						'commentID',c.comment_id,
						'username',cu.username,
						'body',c.body,
						'date_posted',c.created_at,
                        'replyCount',
						(
							SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
						),
                        'replies', (
							SELECT 
								JSON_ARRAYAGG(reply_data)
                                FROM (
									SELECT JSON_OBJECT(
										'replyID',r.reply_id,
										'username',ru.username,
										'body',r.body,
										'date_posted',r.created_at
                                    ) AS reply_data FROM comment_reply r LEFT JOIN user_profile ru
									ON ru.user_id = r.user_id
									WHERE r.comment_id = c.comment_id
                                    ORDER BY r.created_at DESC
                                ) AS ordered_replies
                        )
                    ) AS comment_data FROM post_comments c 
                    LEFT JOIN user_profile cu 
					ON c.user_id = cu.user_id
					WHERE c.post_id = p.post_id
                    ORDER BY c.created_at DESC
				) AS ordered_comments
            ) AS comments FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id 
            INNER JOIN forum_topics t ON p.topic_id = t.topic_id
            WHERE p.post_id = ?`,[id]);

        if(get_post.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Post not available'
            })
        }
        const postsWithReaction = await Promise.all(get_post.map(async post => {
        const hasReacted = await checkIfUserReacted(userID, post.postID);
        return {
            ...post,
            reacted: hasReacted
        };
    }));

        return res.status(200).json({
            status:'Success',
            result:postsWithReaction
        })
    } catch (error) {
         console.error(error);
         return res.status(500).json({
            status:'Error',
            message:'There was an error getting the post'
        })
    }
}
//Get post by particular user
const getPostBy = async (req,res) => {
    const {id} = req.params;
    try {
        const [get_post_by] = await pool.query(`SELECT 
            u.username AS username,
            u.profile_image,
            u.first_name,
            u.last_name,
            p.title AS title,
            p.body AS content,
            p.created_at AS date_posted,
            p.updated_at AS date_updated,
            p.image
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
    const {id} = req.params;
    try {
        const [get_post_by_topic] = await pool.query(`SELECT 
        p.post_id AS postID,
        u.username AS username,
        u.first_name,
        u.last_name,
        u.profile_image,
        t.topic_name,
        p.title AS title,
        p.body AS content,
        p.created_at AS date_posted,
        p.image,
        (
            SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.post_id
        ) AS commentCount,

        (
            SELECT JSON_ARRAYAGG(comment_data)
				
            FROM
				(
					SELECT JSON_OBJECT(
						'commentID',c.comment_id,
						'username',cu.username,
						'body',c.body,
						'date_posted',c.created_at,
                        'replyCount',
						(
							SELECT COUNT(*) FROM comment_reply r WHERE r.comment_id = c.comment_id
						),
                        'replies', (
							SELECT 
								JSON_ARRAYAGG(reply_data)
                                FROM (
									SELECT JSON_OBJECT(
										'replyID',r.reply_id,
										'username',ru.username,
										'body',r.body,
										'date_posted',r.created_at
                                    ) AS reply_data FROM comment_reply r LEFT JOIN user_profile ru
									ON ru.user_id = r.user_id
									WHERE r.comment_id = c.comment_id
                                    ORDER BY r.created_at DESC
                                ) AS ordered_replies
                        )
                    ) AS comment_data FROM post_comments c 
                    LEFT JOIN user_profile cu 
					ON c.user_id = cu.user_id
					WHERE c.post_id = p.post_id
                    ORDER BY c.created_at DESC
				) AS ordered_comments
            ) AS comments FROM user_posts p INNER JOIN user_profile u ON p.user_id = u.user_id 
            INNER JOIN forum_topics t ON p.topic_id = t.topic_id 
            WHERE p.topic_id = ? ORDER BY p.created_at DESC`,[id])
        if(get_post_by_topic.length === 0) {
            return res.status(404).json({
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
        const [userID] = await pool.query(`SELECT user_id FROM user_posts WHERE post_id = ?`,[id])
        if(userID[0].user_id !== parseInt(req.userId)){
            return res.status(403).json({
                status:'Error',
                message:'You do not have permission to make changes on this post. Post belongs to another user'
            })
        }
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
        console.error(error);
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
        const [userID] = await pool.query(`SELECT user_id FROM user_posts WHERE post_id = ?`,[id])
        if(userID[0].user_id !== parseInt(req.userId)){
            return res.status(403).json({
                status:'Error',
                message:'You do not have permission to remove this post. Post belongs to another user'
            })
        }
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