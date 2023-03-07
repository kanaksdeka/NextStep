import mongoose from "mongoose";

const chatHistory = new mongoose.Schema({
  class: String,
  subject: String,
  section: String,
  semester: String,
  period: String,
  user: String,
  chatText: String
}, { timestamps: true });

//chatHistory.statics.saveMessage = async function (classNm, subject, section, semester, periodnm, user, chatText) {
chatHistory.statics.saveMessage = async function (dataStr) {
  try {

    let _data = this.convertData(dataStr);

    if (!_data) {
      console.log('error on saveMessage() data validation');
      return;
    }

    /*
    let _data = {
      class: "classNm",
      subject: "subject",
      section: "section",
      semester: "semester",
      period: "periodnm",
      user: "user",
      chatText: "chatText"
    }
    */

    const savedChat = await this.create(_data);
    console.log('savedChat: ', savedChat);

    //let foundData = this.fetchChat(_data);
    //console.log('foundData: ', foundData);

    return savedChat;
  } catch (error) {
    console.log('error on saveMessage()', error);
  }
}

chatHistory.statics.convertData = function (rawData) {
  //convertData = async function (rawData) {

  console.log('convertData: ', rawData);
  let _data = {
    class: "",
    subject: "",
    section: "",
    semester: "",
    period: "",
    user: "",
    chatText: ""
  }

  let dataTokens = rawData.split("#@#");
  let count = 0;
  dataTokens.forEach((val) => {

    let fieldValueArray = val.split(":");

    if (fieldValueArray && fieldValueArray.length > 0) {

      if (fieldValueArray[0].toLowerCase() === 'class') {
        _data.class = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'subject') {
        _data.subject = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'section') {
        _data.section = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'semester') {
        _data.semester = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'period') {
        _data.period = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'user') {
        _data.user = fieldValueArray[1];
        count++;
      }
      if (fieldValueArray[0].toLowerCase() === 'chattext') {
        _data.chatText = fieldValueArray[1];
        count++;
      }

    }
  })

  console.log('Converted data: ' + count, _data)
  if (count === 7) {
    return _data;
  }
  else {
    console.log('return empty data');
    return;
  }

}

chatHistory.statics.fetchChatHistory = async function (req) {

  let error = false;
  let requestId = req.id;
  let query = req.body;

  console.log('fetchChatHistory query:', query);

  if (typeof query.class == 'undefined' || query.class.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for class")
    error = true;
  }
  else if (typeof query.subject == 'undefined' || query.subject.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for subject")
    error = true;
  }
  else if (typeof query.section == 'undefined' || query.section.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for section")
    error = true;
  }
  else if (typeof query.semester == 'undefined' || query.semester.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for semester")
    error = true;
  }
  else if (typeof query.period == 'undefined' || query.period.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for period")
    error = true;
  }
  /*
  else if (typeof query.user == 'undefined' || query.user.length < 0) {
    console.log("requestId :: " + requestId + ":: Input validation error for user")
    error = true;
  }
  */
  else {
    console.log("requestId :: " + requestId + ":: All validation fine");
  }

  if (error == true) {
    console.log("requestId :: " + requestId + ":: Input validation error insertAttendance() - " + JSON.stringify(query));
    return ''
  }

  let data;
  try {
    data = await this.find(query,
      {
        '_id': 0,
        'class': 1,
        'subject': 1,
        'section': 1,
        'semester': 1,
        'period': 1,
        'user': 1,
        'chatText': 1
      });

    if (data) {
      console.log('data found: ', data)
    }
  } catch (error) {
    console.log('error on start chat method', error);
    data = 'Error fetching data';
    throw error;
  }

  if (data) {
    return data;
  }
  else {
    return 'No data available';
  }
}



const ChatHistory = mongoose.model('ChatHistory', chatHistory);


//module.exports = ChatHistory;
//exports.ChatHistory = ChatHistory;
//export default mongoose.model("ChatHistory", chatHistory);
export default ChatHistory;
