const pool = require ('../config/database');

const getConvoID = async (req,res) => {
    const {id} = req.params;
    const user_id = req.userId
    
    try {
        const [conversation_id] = await pool.query(`
            SELECT conversation_id AS conversationID 
            FROM user_conversation WHERE 
            (first_participant_id = ? AND second_participant_id = ?) OR 
            (first_participant_id = ? AND second_participant_id = ?)`,[user_id, id, id, user_id])
        
            if (conversation_id.length > 0) {
                return res.status(200).json({
                status:'success',
                result: conversation_id[0].conversationID
            })
        } else {
            const [create_conversation] = await pool.query(`INSERT INTO user_conversation 
                (first_participant_id, second_participant_id) VALUES (?, ?)`, [user_id, id])

            return res.status(201).json({
                status:'Success',
                result: create_conversation.insertId
            })
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error fetching conversation'
        })
    }
}

const saveChat = async ( conversation_id, sender_id, receiver_id, message ) => {
    try {
        const [save_chat] = await pool.query (`INSERT INTO messages (conversation_id, receiver_id, sender_id, message) VALUES (?, ?, ?, ?)`, [conversation_id,receiver_id,sender_id, message])
    } catch (error) {
        throw (error) 
    }
}

const getChat = async (conversation_id) => {
    try {
        const[get_chat] = await pool.query(`SELECT m.message_id,m.receiver_id, rup.username AS receiver,m.sender_id,sup.username AS sender, m.message, m.created_at, m.updated_at 
        FROM messages m INNER JOIN user_profile sup ON m.sender_id = sup.user_id
        INNER JOIN user_profile rup ON m.receiver_id = rup.user_id WHERE m.conversation_id = ? ORDER BY m.created_at ASC`,[conversation_id])
       
        return get_chat;
    } catch (error){
        throw (error)
    }
}

module.exports = {saveChat, getChat, getConvoID}