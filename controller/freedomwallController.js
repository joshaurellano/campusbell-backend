const pool = require('../config/database')

const addToWall = async (req,res) => {
    const {body, user_id} = req.body
    
    if(!body || !user_id){
        return res.status(400).json({
            message:'Missing note content or user id'
        })
    }

    try {
        const [add_to_wall] = await pool.query(`INSERT INTO freedom_wall (body, user_id) VALUES (?,?) `,[body, user_id])

        return res.status(201).json({
            message:'User successfully added note to freedom wall'
        })
    } catch (error) {
        //console.log(error)
        return res.status(500).json({
            message:'There was an error adding to freedom wall'
        })
    }
}
const getAllFromWall = async (req,res) => {
    try {
        const[get_all_from_wall] = await pool.query(`
            SELECT fw.id,fw.body, fw.user_id, u.username 
            FROM freedom_wall fw INNER JOIN user_profile u ON fw.user_id = u.user_id`)

            return res.status(200).json({
                message:'Freedom Wall notes fetched',
                result:get_all_from_wall
            })
    } catch (error) {
        //console.log(error)
        return res.status(500).json({
            message:'There was an error fetching data from freedom wall'
        })
    }
}
const getSpecificNotes = async (req,res) => {
    const {id} = req.params
    try {
        const[get_note_from_wall] = await pool.query(`
            SELECT fw.id,fw.body, fw.user_id, u.username 
            FROM freedom_wall fw INNER JOIN user_profile u ON fw.user_id = u.user_id 
            WHERE fw.id = ?`,[id])

            return res.status(200).json({
                message:'Note fetched',
                result:get_note_from_wall[0]
            })
    } catch (error) {
        //console.log(error)
        return res.status(500).json({
            message:'There was an error fetching data from freedom wall'
        })
    }
}
const updateNote = async (req,res) => {
    const{id} = req.params;
    const{body} = req.body;

    try {
        const[update_note] = await pool.query(`UPDATE freedom_wall SET body = ? WHERE id = ?`,[body, id])

        if(update_note.affectedRows === 0){
            return res.status(404).json({
                message:'Note probably missing or not available'
            })
        }
        return res.status(200).json({
            message:'Successfully updated freedom wall note'
        })
    } catch (error) {
        //console.log(error)
        return res.status(500).json({
            message:'There was an error updating data from freedom wall'
        })
    }
}
const deleteNote = async (req,res) => {
    const {id} = req.params
    try {
        const[del_note] = await pool.query(`DELETE FROM freedom_wall WHERE id = ?`,[id])
        
        if(del_note.affectedRows === 0){
        return res.status(404).json({
            message:'Note probably missing or not available'
        })
    }
        return res.status(200).json({
            message:'Successfully removed note from freedom wall'
        })
    } catch (error) {
        //console.log(error)
        return res.status(500).json({
            message:'There was an error removing note from freedom wall'
        })
    }
}


module.exports = {addToWall,getAllFromWall,getSpecificNotes,updateNote,deleteNote}