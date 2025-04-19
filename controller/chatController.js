const pool = require ('../config/database');

const saveChat = async ( sender_id, receiver_id, message ) => {
    try {
        const [save_chat] = await pool.query (`INSERT INTO messages (receiver_id, sender_id, message) VALUES (? ,?, ?)`, [receiver_id,sender_id, message])
    } catch (error) {
        throw (error)
    }
}

const getChat = async (sender_id, receiver_id) => {
    try {
        const[get_chat] = await pool.query(`SELECT m.message_id,rup.username AS receiver,sup.username AS sender, m.message, m.created_at, m.updated_at 
        FROM messages m INNER JOIN user_profile sup ON m.sender_id = sup.user_id
        INNER JOIN user_profile rup ON m.receiver_id = rup.user_id WHERE m.sender_id = ? AND m.receiver_id = ?`,[sender_id, receiver_id])
        
        return get_chat;
    } catch (error){
        throw (error)
    }
}

module.exports = {saveChat, getChat}