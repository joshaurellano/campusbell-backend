const pool = require('../config/database');
const {encrypt, decrypt, hashing, createResetPasswordToken} = require('../middleware/encryption');

const searchUser = async (req, res) => {
    const username = req.query.username;

    let dbQuery = `SELECT user_id, 
            username, first_name, last_name FROM user_profile 
            WHERE username LIKE ? OR username LIKE ?`
    let values = [`%${username}`, `%${username}%`]

    try {
        const [result] = await pool.query(dbQuery,values)

        if(result.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No matching information on database'
            })
        }
        return res.status(200).json({
            status:'Success',
            result:result
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error processing your request'
        })
    }
}

module.exports = {searchUser}