const pool = require ('../config/database');

const addFriendship = async (sender_id, user_id) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        
        const [add_first_way] = await connection.query(`INSERT INTO user_friendship (user_id,friend_id) VALUES (?,?)`,[user_id,sender_id]);
        const [add_second_way] = await connection.query(`INSERT INTO user_friendship (user_id, friend_id) VALUES (?,?)`,[sender_id, user_id]);
        
        await connection.commit();
        console.log('transaction completed');

        return { success: true, add_first_way, add_second_way}
    } catch (error) {
        await connection.rollback();
        if(error.code ==='ER_DUP_ENTRY'){
            return {
                success:false,
                message:'Users already friends'
            }
        }
        throw error;
    } finally {
        await connection.release();
    }
}
const getAllFriends = async (req, res) => {
    const {id} = req.params;
    try {
        const [get_friends] = await pool.query(`
            SELECT u.user_id, u.username,
            (
                SELECT JSON_ARRAYAGG(friend_data) 
                FROM (
                    SELECT JSON_OBJECT(
                        'user_id', f.user_id,
                        'username', f.username,
                        'since', uf.created_at
                    ) AS friend_data FROM user_friendship uf INNER JOIN user_profile f ON uf.friend_id = f.user_id 
                    WHERE uf.user_id = u.user_id
                    ORDER BY uf.created_at DESC
                ) AS friends_info
            ) AS friends
            FROM user_profile u WHERE u.user_id = ?`,[id])
    } catch (error) {
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting your friends'
        })
    }
}
const checkFriendship = async (id, user_id) => {
    try {
        const [check] = await pool.query(`SELECT user_id FROM user_friendship WHERE user_id = ? AND friend_id = ?`,[user_id, id]);
        if(check.length === 0){
            return (false)
        }
        return (true)
    } catch (error) {
        throw error
    }
}

module.exports = { addFriendship, getAllFriends, checkFriendship }