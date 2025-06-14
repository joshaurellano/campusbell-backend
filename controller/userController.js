/* This Controller handle all user based functions */

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const [get_all_users] = await pool.query(`SELECT user_id,username,first_name,middle_name,last_name,
            email,phone_number,yr_level,program,
            region,province,city,town,barangay,street,house_no, 
            role_id FROM user_profile`);
        if(get_all_users.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No Users Available'
            })
        }
        else{
            return res.status(200).json({
                status:'Success',
                totalUSers:get_all_users.length,
                result:get_all_users
            });
        }
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
				SELECT JSON_ARRAYAGG(JSON_OBJECT(
					'postId',p.post_id,
					'topicId',p.topic_id,
					'post_title',p.title,
					'post_content',p.body,
					'post_posted',p.created_at,
					'post_image',p.image)
                    ) FROM user_posts p WHERE p.user_id = up.user_id
			) AS 'posts'
            FROM user_profile up WHERE up.user_id = ?`,[id]);
        if(get_user.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'User Not Available'
            })
        }
        else{
            return res.status(200).json({
                status:'Success',
                result:get_user[0]
            });
        }
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
    const {username,first_name,middle_name,last_name,email,phone_number,yr_lvl,program,region,province,city,town,barangay,street,house_no} = req.body;
    const[update_user] = await pool.query(`UPDATE FROM user_profile 
            SET username = ?,first_name = ?,middle_name = ?,last_name = ?,
            email = ?,phone_number = ?,yr_lvl = ?,program = ?,
            region = ?,province = ?,city = ?,town = ?,barangay = ?,street = ?,house_no = ? WHERE user_id = ?`,
            [username,first_name,middle_name,last_name,email,phone_number,yr_lvl,program,region,province,city,town,barangay,street,house_no,id]);
            
            if(update_user.affectedRows === 0){
                return res.status(404).json({
                    status:'Error',
                    message:'User not available'
                })
            }
            else {
                return res.status(200).json({
                    status:'Success',
                    message:'Update user successful'
                })
            } 
}
const updateUserPassword = async (req, res) => {
    const {id} = req.params;
    const {password} = req.body;
    const saltRounds = 10;
    try {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, async function(err,hashedPass) {
                const [update] = await pool.query(`UPDATE user_profile SET password = ? WHERE user_id = ?`,[hashedPass,id]);

                if(update.affectedRows = 0){
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
module.exports = {getAllUsers,getUser,updateUser,updateUserPassword,deleteUser};