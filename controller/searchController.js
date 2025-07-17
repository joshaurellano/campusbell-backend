const pool = require('../config/database');
const {encrypt, decrypt, hashing, createResetPasswordToken} = require('../middleware/encryption');

const searchUser = async (req, res) => {
    const search = req.query.search;
    if(!search || search.trim() === ''){
        return res.status(400).json({
            status:'Error',
            message:'Search cannot be empty'
        })
    }
    let dbQuery = `SELECT user_id, 
            username, first_name, last_name FROM user_profile 
            WHERE username LIKE ?`

    let dbPostQuery = `SELECT p.post_id,p.title,p.body, p.created_at, 
    u.user_id, u.username FROM user_posts p INNER JOIN user_profile u 
    ON p.user_id = u.user_id WHERE p.title LIKE ? ORDER BY p.created_at DESC LIMIT 5`

    let values = [`${search}%`]
    
    try {
        const [userResult, postResult] = await Promise.allSettled ([
            pool.query(dbQuery, values), 
            pool.query(dbPostQuery, values)])

            const user_result = userResult.status === 'fulfilled' ? userResult.value[0] : []
            const post_result = postResult.status === 'fulfilled' ? postResult.value[0] : []
            
            if(user_result.length === 0 && post_result.length === 0){
                return res.status(404).json({
                    status:'Error',
                    message:'No available information matches the search'
                })
            }
            if(user_result.length > 0){
                for(let i=0; i<user_result.length; i++){
                    
                    try{
                        const parseFirstName = JSON.parse(user_result[i].first_name)
                        const parseLastname = JSON.parse(user_result[i].last_name)
                        const decryptedFirstName = decrypt(parseFirstName.encryptedData, parseFirstName.iv)
                        const decryptedLastName = decrypt(parseLastname.encryptedData, parseLastname.iv)

                        user_result[i].first_name = decryptedFirstName
                        user_result[i].last_name = decryptedLastName
                    } catch (error) {
                        console.error(`Decryption failed for user index ${i}`, error)
                    }
                }
            }
        return res.status(200).json({
            status:'Success',
            totalUser: user_result.length,
            totalPost: post_result.length,
            userResult:user_result,
            postResult:post_result
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