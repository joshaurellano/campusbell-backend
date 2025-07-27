const pool = require ('../config/database');

const addFrienship = async (sender_id, user_id) => {
    try {
        
        const addingFriendship = await Promise.all([
            pool.query(`INSERT INTO user_friendship (user_id,friend_id) VALUES (?,?)`,[user_id,sender_id]),
            pool.query(`INSERT INTO user_friendship (user_id, friend_id) VALUES (?,?)`,[sender_id, user_id])
        ])
        return (addingFriendship)
    } catch (error) {
        throw error
    }
}

module.exports = { addFrienship}