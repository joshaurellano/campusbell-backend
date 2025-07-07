/* This Controller handle all user based functions */
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const {encrypt, decrypt, hashing} = require('../middleware/encryption')

const getAllUsers = async (req, res) => {
    try {
        const [get_all_users] = await pool.query(`SELECT user_id,username,first_name,middle_name,last_name,
            email,phone_number,yr_level,program,
            region,province,city,town,barangay,street,house_no, 
            role_id FROM user_profile WHERE role_id != 4`);
        
        if(get_all_users.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No Users Available'
            })
        }

        return res.status(200).json({result:get_all_users});

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error retrieving the users'
        })
    }
}
const getUser = async (req, res) => {
    const {id} = req.params;

    try {
        if(id !== req.userId){
            return res.status(403).json({
                status:'Error',
                message:'You dont have permission to view this account'
            })
        }
        const [get_user] = await pool.query(`
           SELECT 
            up.username,
            up.profile_image,
            up.first_name,
            up.middle_name,
            up.last_name,
            up.email,
            up.phone_number,
            up.yr_level,
            up.program,
            up.region,
            up.province,
            up.city,
            up.town,
            up.barangay,
            up.street,
            up.house_no, 
            up.role_id,
            (
				SELECT JSON_ARRAYAGG(post_data) 
                FROM (
					SELECT JSON_OBJECT(
						'postId',p.post_id,
						'topicId',p.topic_id,
                        'topic_name',t.topic_name,
						'post_title',p.title,
						'post_content',p.body,
						'post_posted',p.created_at,
						'post_image',p.image
                    ) AS post_data FROM user_posts p 
                    INNER JOIN forum_topics t ON p.topic_id = t.topic_id 
                    WHERE p.user_id = up.user_id 
                    ORDER BY p.created_at DESC
                    LIMIT 10
                ) AS ordered_posts
			) AS posts
            FROM user_profile up WHERE up.user_id = ?`,[id]);
        if(get_user.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'User Not Available'
            })
        }
            const userAttribute = Object.keys(get_user[0])
            const userInfo = Object.values(get_user[0])
            
            const encryptedUser = {}
            const decryptedUser = {}
            for(let i=0; i<userAttribute.length; i++) {
                
                if(userInfo !== null){
                    try{
                        encryptedUser[userAttribute[i]] = JSON.parse(userInfo[i])
                    } catch (error){
                        encryptedUser[userAttribute[i]] = userInfo[i]
                    }
                } else {
                    encryptedUser[userAttribute[i]] = null
                }
                // console.log(userAttribute[i],encryptedUser[userAttribute[i]])
            
            decryptedUser[userAttribute[i]] = encryptedUser[userAttribute[i]] 
                if(decryptedUser[userAttribute[i]] !== null && typeof(decryptedUser[userAttribute[i]]) ==='object'){
                    if(decryptedUser[userAttribute[i]].encryptedData && decryptedUser[userAttribute[i]].iv){
                        const decryption = decrypt(decryptedUser[userAttribute[i]].encryptedData, decryptedUser[userAttribute[i]].iv)
                        decryptedUser[userAttribute[i]] = decryption
                    }
                }
                get_user[0] = decryptedUser;
            }
            return res.status(200).json({
                status:'Success',
                result:get_user
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error retrieving the user'
        })
    }
}
const updateUser = async (req, res) => {
    const {id} = req.params;
    const {username,first_name,middle_name,last_name,email,phone_number,yr_level,program,region,province,city,town,barangay,street,house_no} = req.body;

    try{
     if(id !== req.userId){
            return res.status(403).json({
                status:'Error',
                message:'You dont have permission to make changes on this account'
            })
        }
        userAttribute = Object.keys(req.body)
        userValue = Object.values(req.body)

        const encrypting = {}
        for (let i=0; i<userAttribute.length; i++){

            if(userAttribute[i] === 'username' || userAttribute[i] === 'password'){
                encrypting[userAttribute[i]] = userValue[i]
            } else {
            encryption = encrypt(userValue[i])
            encrypting[userAttribute[i]] = JSON.stringify(encryption)
            }
            // console.log(userAttribute[i], encrypting)
        }
        
        const hashed = hashing(req.body.email, req.body.phone_number)

    const[update_user] = await pool.query(`UPDATE user_profile 
            SET username = ?,first_name = ?,middle_name = ?,last_name = ?,
            email = ?,phone_number = ?,yr_level = ?,program = ?,
            region = ?,province = ?,city = ?,town = ?,barangay = ?,street = ?,house_no = ?, hashed_email = ?, hashed_phoneNumber = ? WHERE user_id = ?`,
            [username,encrypting.first_name,encrypting.middle_name,encrypting.last_name,encrypting.email,
                encrypting.phone_number,encrypting.yr_level,encrypting.program,encrypting.region,encrypting.province,
                encrypting.city,encrypting.town,encrypting.barangay,encrypting.street,encrypting.house_no,hashed.emailHash,hashed.phoneNumberHash,id]);
            
            if(update_user.affectedRows === 0){
                return res.status(404).json({
                    status:'Error',
                    message:'User not available'
                })
            }
    } catch (err){
         if(err.code === 'ER_DUP_ENTRY'){
            // console.error(err.message)
            if(err.message.includes('email')){
            return res.status(409).json({
                status:'Error',
                message:'Email already in used'
                });
            }
            else if(err.message.includes('phoneNumber' || 'phone_number')){
            return res.status(409).json({
                status:'Error',
                message:'Phone Number already in used'
                });
            }
            else if(err.message.includes('username')){
            return res.status(409).json({
                status:'Error',
                message:'Username already in used'
                });
            }
        }
        //Other database error that is not handled here
        else{
            console.log(err);
            return res.status(500).json({
                status:'Error',
                message:'There was an error processing the request'
            });
        }
    }        
                return res.status(200).json({
                    status:'Success',
                    message:'Update user successful'
                })
}
const updateProfileImage = async (req, res) => {
    const {img_link, user_id} = req.body;
     if(user_id !== req.userId){
            return res.status(403).json({
                status:'Error',
                message:'You dont have permission to make changes on this account'
            })
        }

    try {
        const[update_pfp] = await pool.query(`UPDATE user_profile SET profile_image = ? WHERE user_id = ?`,[img_link, user_id])
        return res.status(200).json({
            status:'Success',
            message:'Successfully updated the profile image'
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was a problem updating the profile image'
        })
        
    }
}
const updateUserPassword = async (req, res) => {
    const {id} = req.params;
    const {password} = req.body;
    const saltRounds = 10;
    
    if(id !== req.userId){
            return res.status(403).json({
                status:'Error',
                message:'You dont have permission to make changes on this account'
            })
    }

    try {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, async function(err,hashedPass) {
                const [update] = await pool.query(`UPDATE user_profile SET password = ? WHERE user_id = ?`,[hashedPass,id]);

                if(update.affectedRows === 0){
                        return res.status(404).json({
                            status:'Error',
                            message:'User not available'
                        })
                    }
                    else{
                        return res.status(200).json({
                            status:'Success',
                            message:'Update user password successful'
                        })
                    }
            })
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error updating your password'
        });
    }
}
const deleteUser = async (req, res) => {
    const{id} = req.params;
    
    if(id !== req.userId){
            return res.status(403).json({
                status:'Error',
                message:'You dont have permission to remove this account'
            })
        }
    try {
        const [del_user] = await pool.query(`DELETE FROM user_profile WHERE user_id = ?`,[id]);
        if(del_user.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'User not available'
            })            
        }
        else {
            return res.status(200).json({
                status:'Success',
                message:'User deleted successfully'
            })
        }
    } catch(error){
        return res.status(500).json({
            status:'Error',
            message:'There was an error deleting this user'
        })
    }

}
module.exports = {getAllUsers,getUser,updateUser,updateProfileImage,updateUserPassword,deleteUser};