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

module.exports = { addFriendship }