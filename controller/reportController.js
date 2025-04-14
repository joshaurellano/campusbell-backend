const pool = require ('../config/database');

const createReport = async (req, res) =>{
    const {reporter_user_id, reported_user_id,post_id,comment_id,reply_id,type_id,classification_id,report_details,status_id,admin_id} = req.body;
    try {
        const[create_report] = await pool.query(`INSERT INTO user_reports(reporter_user_id,reported_user_id, 
            post_id, comment_id, reply_id,type_id, classification_id,report_details,status_id,admin_id)`,
            [reporter_user_id,reported_user_id,post_id,comment_id,reply_id, type_id,classification_id,report_details,status_id,admin_id])
            
            return res.status(201).json({
                status:'Success',
                message:'Report successfully created'
            })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error inserting report'
        })
    }
}
//Will handle fetching all reports 
// Accessible by admins only
const getAllReports = async (req,res) => {
   try {
    const[get_all_reports] = await pool.query(`SELECT ur.report_id,
        up.username AS reporter,
        up1.username AS reportedUser,
        upo.title AS postTitle,
        pc.body AS comment,
        cr.body AS reply,
        rt.description AS type,
        rc.description AS classification,
        ur.report_details,
        up1.username AS assignedAdmin,
        rs.description AS status,
        ur.created_at,
        ur.updated_at FROM user_reports ur INNER JOIN report_type rt ON ur.type_id = rt.type_id
        INNER JOIN report_classification rc ON ur.classification_id = rc.classification_id 
        INNER JOIN report_status rs ON ur.status_id = rs.status_id 
        INNER JOIN user_profile up ON ur.reporter_user_id = up.user_id 
        INNER JOIN user_profile up1 ON ur.reported_user_id = up1.user_id
        INNER JOIN user_posts upo ON ur.post_id = upo.post_id
        INNER JOIN post_comments pc ON ur.comment_id = pc.comment_id
        INNER JOIN comment_reply cr ON ur.reply_id = ur.reply_id`)
    
        if(get_all_reports.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'No reports available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_reports:get_all_reports.length,
            result: get_all_reports
        })
   } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reports'
        })
   }

}
// *** FILTERING REPORTS ***
// ** By Status **

// 1 - Pending
// 2 - On review
// 3 - Resolved
// 4 - Closed

const getAllReportsByStatus = async (req,res) => {
    const {id} = req.params;
    try {
        const[get_all_reports_by_status] = await pool.query(`SELECT ur.report_id,
        up.username AS reporter,
        up1.username AS reportedUser,
        upo.title AS postTitle,
        pc.body AS comment,
        cr.body AS reply,
        rt.description AS type,
        rc.description AS classification,
        ur.report_details,
        up1.username AS assignedAdmin,
        rs.description AS status,
        ur.created_at,
        ur.updated_at FROM user_reports ur INNER JOIN report_type rt ON ur.type_id = rt.type_id
        INNER JOIN report_classification rc ON ur.classification_id = rc.classification_id 
        INNER JOIN report_status rs ON ur.status_id = rs.status_id 
        INNER JOIN user_profile up ON ur.reporter_user_id = up.user_id 
        INNER JOIN user_profile up1 ON ur.reported_user_id = up1.user_id
        INNER JOIN user_posts upo ON ur.post_id = upo.post_id
        INNER JOIN post_comments pc ON ur.comment_id = pc.comment_id
        INNER JOIN comment_reply cr ON ur.reply_id = ur.reply_id WHERE ur.status_id = ?`)

        if(get_all_reports_by_status.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No report available'
            })
        }

        return res.status(200).json({
            status:'Success',
            total_reports: get_all_reports_by_status.length,
            result: get_all_reports_by_status
        })
    } catch (error) {
        // console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error gettig all the reports'
        })
    }
}
// ** By Type **
// Filter what type of report would be displayed
// 1 - Post
// 2 - Comment
// 3 - Reply
// 4 - User

const getAllReportsByType = async (req,res) => {
    const {id} = req.body
    try {
        const [get_all_reports_by_type] = await pool.query (`SELECT ur.report_id,
        up.username AS reporter,
        up1.username AS reportedUser,
        upo.title AS postTitle,
        pc.body AS comment,
        cr.body AS reply,
        rt.description AS type,
        rc.description AS classification,
        ur.report_details,
        up1.username AS assignedAdmin,
        rs.description AS status,
        ur.created_at,
        ur.updated_at FROM user_reports ur INNER JOIN report_type rt ON ur.type_id = rt.type_id
        INNER JOIN report_classification rc ON ur.classification_id = rc.classification_id 
        INNER JOIN report_status rs ON ur.status_id = rs.status_id 
        INNER JOIN user_profile up ON ur.reporter_user_id = up.user_id 
        INNER JOIN user_profile up1 ON ur.reported_user_id = up1.user_id
        INNER JOIN user_posts upo ON ur.post_id = upo.post_id
        INNER JOIN post_comments pc ON ur.comment_id = pc.comment_id
        INNER JOIN comment_reply cr ON ur.reply_id = ur.reply_id WHERE ur.type_id = ?`,[id])

        if(get_all_reports_by_type.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'No report available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_reports:get_all_reports_by_type.length,
            result: get_all_reports_by_type
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reports'
        })
    }
}
// ** By classification **

// Filter reports according to classification
// Classifications can be modified  according to needs
// 1 - Hate speech
// 2 - Offensive
// 3 - harmful/threatening
// 4 - Illegal
// 5 - other

const getAllReportsByClassification = async (req,res) => {
    const{id} = req.params;
    try {
        const [get_all_reports_by_classification] = await pool.query(`SELECT ur.report_id,
        up.username AS reporter,
        up1.username AS reportedUser,
        upo.title AS postTitle,
        pc.body AS comment,
        cr.body AS reply,
        rt.description AS type,
        rc.description AS classification,
        ur.report_details,
        up1.username AS assignedAdmin,
        rs.description AS status,
        ur.created_at,
        ur.updated_at FROM user_reports ur INNER JOIN report_type rt ON ur.type_id = rt.type_id
        INNER JOIN report_classification rc ON ur.classification_id = rc.classification_id 
        INNER JOIN report_status rs ON ur.status_id = rs.status_id 
        INNER JOIN user_profile up ON ur.reporter_user_id = up.user_id 
        INNER JOIN user_profile up1 ON ur.reported_user_id = up1.user_id
        INNER JOIN user_posts upo ON ur.post_id = upo.post_id
        INNER JOIN post_comments pc ON ur.comment_id = pc.comment_id
        INNER JOIN comment_reply cr ON ur.reply_id = ur.reply_id WHERE ur.classification_id = ?`,[id])
        if(get_all_reports_by_classification.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No reports available'
            })
        }
        return res.status(200).json({
            status:'Success',
            total_reports:get_all_reports_by_classification.length,
            result:get_all_reports_by_classification
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all reports'
        })
    }
}

const updateReports = async (req,res) => {
    const{id} = req.params;
    const {type_id} = req.body;
    try{
        const[update_report] = await pool.query(`UPDATE user_reports SET type_id = ? WHERE report_id = ?`,[type_id, id]);

        if(update_report.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Report not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Report updated successfully'
        }) 
    } catch (error){
        returnres.status(500).json({
            status:'Error',
            message:'There was an error updating the report'
        })
    }
}
const deleteReports = async (req,res) => {
    const {id} = req.params;
    try {
        const [del_report] = await pool.query(`DELETE FROM user_reports WHERE report_id = ?`,[id]);
        if(del_report.affectedRows === 0) {
            return res.status(404).json({
                status:'Error',
                message:'Report is not available'
            })
        }
        return res.status(200).json({
            status:'Success',
            message:'Report removed successfully'
        })
    } catch (error) {
        //console.error(errror)
        return res.status(500).json({
            status:'Error',
            message:'There was an error removing the report'
        })
    }
}
module.exports = {createReport,getAllReports,getAllReportsByStatus, 
    getAllReportsByType, getAllReportsByClassification,updateReports,deleteReports}  