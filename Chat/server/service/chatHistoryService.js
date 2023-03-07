import ChatMessageModel from '../service/chatHistoryService.js';
import ChatHistoryModel from '../models/ChatHistory.js';

exports.saveChatHistory = function (req, res) {
    let _model = new ChatHistoryModel();
    _model.class = req.body.class.trim();
    _model.subject = req.body.subject.trim();
    _model.section = req.body.section.trim();
    _model.semester = req.body.semester.trim();
    _model.period = req.body.period.trim();
    _model.user = req.body.user.trim();

    _model.save( (err, data) => {
        if(err) {
            
        }
    })
}