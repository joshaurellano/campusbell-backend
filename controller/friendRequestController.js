const pool = require ('../config/database');
const {addFriendship} = require('../controller/friendController');

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
                message:'Friend reqeust already sent'
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
const getFriendRequest = async (id, user_id) => {
    const receiver_id = user_id;
    const sender_id = id
    try {
        const [get_request] = await pool.query(`
            SELECT fr.request_id, fr.sender_id, fr.receiver_id, fr.status_id, rs.status_name, fr.created_at, fr.updated_at FROM friend_request fr 
            INNER JOIN request_status rs ON fr.status_id = rs.status_id
            WHERE ((fr.sender_id = ? AND fr.receiver_id = ?) OR (fr.sender_id = ? AND fr.receiver_id = ?)) AND (fr.status_id = 1 OR fr.status_id = 3)`, [sender_id, receiver_id, receiver_id, sender_id ])
        if(get_request.length === 0) {
            return (null);
        }
        if(get_request[0].status_id === 3){
            const rejectTime = new Date(get_request[0].updated_at);
            const rejectExpiry = new Date(rejectTime + 48 * 60 * 60 * 1000);
            const timeNow = new Date();
            if (timeNow >= rejectExpiry) {
                await pool.query(`DELETE FROM friend_request WHERE request_id = ?`, [get_request[0].request_id]);
            }
        }
        if(get_request[0].sender_id === parseInt(sender_id) && get_request[0].receiver_id === parseInt(receiver_id) && get_request[0].status_id === 1) {
            get_request[0].status_name = 'pending reply'
        }
        return(get_request[0].status_name)
        
    } catch (error) {
        console.error(error);
        throw error 
    }
}
const acceptFriendRequest = async (req,res) => {
    const {id} = req.params;
    const user_id = req.userId
    const sender_id = id;
    try {
        const [update_friend_request] = await pool.query(`UPDATE friend_request SET status_id = 2 WHERE (sender_id = ? AND receiver_id = ?)`,[sender_id, user_id]);
        await addFriendship(sender_id, user_id)

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
const rejectFriendRequest = async (req,res) => {
    const {id} = req.params;
    const user_id = req.userId
    const sender_id = id;
    try {
        const [update_friend_request] = await pool.query(`UPDATE friend_request SET status_id = 3 WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,[sender_id, user_id, user_id, sender_id]);

        return res.status(200).json({
            status:'Success',
            message:'Friend request rejected'
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error rejecting friend request'
        })
    }
}
module.exports = {sendFriendRequest, getFriendRequest, acceptFriendRequest, rejectFriendRequest}