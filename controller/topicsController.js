const pool = require ('../config/database');

const getTopics = async (req,res) => {
    try {
        const [get_all_topics] = await pool.query(`SELECT topic_id, topic_name FROM forum_topics`);
        if(get_all_topics.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'No topics available'
            })
        }
        return res.status(200).json({
            status:'Success',
            result: get_all_topics
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting all topics'
        })
    }

}

const addTopics = async (req, res) => {
    const {topic_name, admin_id} = req.body;
    try {
        const [add_topics] = await pool.query(`INSERT INTO forum_topics (topic_name, admin_id) VALUES (?,?)`,[topic_name, admin_id])
        return res.status(200).json({
            status:'Success',
            message:`New topic successfully added`
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error adding topic'
        })
    }
}
const updateTopics = async (req,res) => {
    const {id} = req.params;
    const {topic_name} = req.body;
    try {
        const[update_topic] = await pool.query(`UPDATE forum_topics SET topic_name = ? WHERE topic_id = ?`,[topic_name,id]);
        if(update_topic.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Topic not available'
            });
        }
        return res.status(200).json({
            status:'Success',
            message:'Topic succesfully updated'
        })
    } catch (error) {
        //console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error updating topic'
        })
    }
}
const deleteTopics = async (req,res) => {
    const {id} = req.params;

    try {
        const [del_topic] = await pool.query(`DELETE FROM forum_topics WHERE topic_id = ?`,[id])
        if(del_topic.affectedRows === 0){
            return res.status(404).json({
                status:'Error',
                message:'Topic not available'
            });
        }
        return res.status(200).json({
            status:'Success',
            message:'Topic succesfully removed'
        })
        
    } catch (error) {
         //console.error(error)
         return res.status(500).json({
            status:'Error',
            message:'There was an error removing the topic'
        })
    }
}
module.exports = {getTopics,addTopics,updateTopics,deleteTopics}