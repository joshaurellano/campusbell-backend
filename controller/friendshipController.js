const pool = require ('../config/database');

const sendFriendRequest = async (req,res) => {
    const {receiver_id} = req.body

    try {
        const sender_id = req.userId;
        const status_id = 1
       
        const [send_request] = await pool.query(`INSERT INTO friend_request (sender_id, receiver_id, status_id) VALUES (?, ?, ?)`,[sender_id, receiver_id, status_id])

        return res.status(200).json({
            status:'Success',
            message:'Successfully sent a friend request'
        })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({
                status:'Error',
                message:'Friend requst already sent'
            })
        } else {
            console.error(error)
            return res.status(500).json({
                status:'Error',
                message:'There was an error processing your request'
            })
        }
    }
}
const getFriendRequest = async (sender_id, receiver_id) => {
    try {
        const [get_request] = await pool.query(`SELECT sender_id, receiver_id, status_id FROM friend_request WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`, [sender_id, receiver_id, receiver_id, sender_id ])
        if(get_request.length === 0) {
            return (null);
        }

        if(get_request[0].sender_id === sender_id && get_request[0].status_id === 1) {
            return ('waiting')
        } else if(get_request[0].sender_id === receiver_id && get_request[0].status_id === 1){
            return ('pending reply')
        } else if (get_request[0].status_id === 2) {
            return ('accepted')
        } else if (get_request[0].status_id === 3) {
            return ('rejected')
        }  

    } catch (error) {
        console.error(error);
        throw error 
    }
}
const acceptFriendRequest = async (req,res) => {
    const {sender_id} = req.body;
    const user_id = req.userId
    try {
        const [add_friend] = await pool.query(`INSERT INTO user_friendship (user_id,friend_id) VALUES (?,?)`,[user_id,sender_id]);
        const [add_to_friend] = await pool.query(`INSERT INTO user_friendship (user_id, friend_id)`,[sender_id, user_id]);

        const [update_friend_request] = await pool.query(`UPDATE friend_request SET status_id = 2 WHERE (sender_id = ? AND receiver_id = ?)`,[sender_id, user_id]);

        return res.status(200).json({
            status:'Success',
            message:'Successfully accepted the friend request'
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error accepting the friend request'
        })
    }
}
module.exports = {sendFriendRequest, getFriendRequest, acceptFriendRequest}