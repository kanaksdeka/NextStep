var co = require('co');
var path = require('path');
var appRoot = path.join(require('app-root-dir').get(), '/server/');
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));
const { resolve } = require('path');
var logger = getLogger('mapper-Service');

const async = require('async');
const { appendFile } = require('fs/promises');
const Subject = require(path.join(appRoot, 'api/models/Subject'));
const Section = require(path.join(appRoot, 'api/models/Section'));
const Semester = require(path.join(appRoot, 'api/models/semester'));
const Grade = require(path.join(appRoot, 'api/models/Grade'));
const Teacher=require(path.join(appRoot, 'api/models/User'));
const Student=require(path.join(appRoot, 'api/models/User'));


let requestId=""

class Mapper {
    constructor(){
        this.subjectmap = new Map();
        this.sectionmap = new Map();
        this.semestermap = new Map();
        this.grademap = new Map();
        this.teachermap=new Map();
        this.studentmap=new Map();
    }

    fillStudentMap=()=> {
        const logger = getLogger('fillStudentMap');
        logger.debug(" Fill the Student map");
        this.studentmap.clear();
        try {
            Student.find({"category.categoryType":"S"}
            ,(err, student) => {
                if (student.length > 0) {
                    logger.debug(" Student found with provided input - " + student.length);
                    //Fill the student map
                    student.forEach((studentIndexObj) =>{
                        logger.debug(" Type of key  - ", typeof studentIndexObj._id.toString());
                        logger.debug(" students name is   - ", studentIndexObj.profile.fullname);
                        this.studentmap.set(studentIndexObj._id.toString(), studentIndexObj.profile.fullname)
                    })
                    logger.debug(" student Map after filling - ",this.studentmap);

                } else if (err) {
                    logger.error(" student search encountered error  - " + JSON.stringify(err));
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" student search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fillstudentMap Exception -" + err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }



    fillTeacherMap=()=> {
        const logger = getLogger('fillTeacherMap');
        logger.debug(" Fill the teacher map");
        this.teachermap.clear();
        try {
            Teacher.find({ $or: [ {"category.categoryType":"T"}, {"category.categoryType":"A"} ] }
            ,(err, teacher) => {
                if (teacher.length > 0) {
                    logger.debug(" Teacher found with provided input - " + JSON.stringify(teacher));
                    //Fill the teacher map
                    teacher.forEach((teacherIndexObj) =>{
                        logger.debug(" Type of key  - ", typeof teacherIndexObj._id.toString());
                        logger.debug(" Teachers name is   - ", teacherIndexObj.profile.fullname);
                        this.teachermap.set(teacherIndexObj._id.toString(), teacherIndexObj.profile.fullname)
                    })
                    logger.debug(" teacher Map after filling - ",[...this.teachermap.entries()]);

                } else if (err) {
                    logger.error(" teacher search encountered error  - " + JSON.stringify(err));
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" teacher search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fillTeacherMap Exception -" + err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }

    fillSubjectMap=()=> {
        const logger = getLogger('fillSubjectMap');
        logger.debug(" Fill the class map");
        this.subjectmap.clear();
        try {
            Subject.find({},(err, subject)=>{
                if (subject.length > 0) {
                    logger.debug(" Subject found with provided input - " + JSON.stringify(subject));
                    //Fill the subject map
                    subject.forEach((subjectIndexObj) =>{
                        logger.debug(" Type of key  - ", typeof subjectIndexObj._id.toString());
                        this.subjectmap.set(subjectIndexObj._id.toString(), subjectIndexObj.subject)
                    })
                    logger.debug(" Subject Map after filling - ",this.subjectmap);

                } else if (err) {
                    logger.error(" Subject search encountered error  - " + JSON.stringify(err));
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" Subject search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fetchsubject Exception -" + err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }

    fillSemesterMap=()=> {
        const logger = getLogger('fillSemesterMap');
        logger.debug(" Fill the semester map"); try {
        this.semestermap.clear();

            Semester.find({ 'isactive': true },(err, semester)=>{
                if (semester.length > 0) {
                    logger.debug(" semester found with provided input - " + semester);
                    //Fill the semester map
                    semester.forEach((semesterIndexObj)=>{
                        this.semestermap.set(semesterIndexObj._id.toString(), semesterIndexObj.semester)
                    })
                    logger.debug(" Semester Map after filling - ",[...this.semestermap.entries()]);

                } else if (err) {
                    logger.error(" semester search encountered error  - ", err);
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" semester search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fetchSemester Exception -" + err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }

    fillClassMap=()=> {
        const logger = getLogger('fillClassMap');
        logger.debug(" Fill the class map");
        this.grademap.clear();

        try {

            Grade.find({}, (err, grade)=>{
                if (grade.length > 0) {
                    logger.debug(" grade found with provided input - ", grade);
                    //Fill the grade map
                    grade.forEach((gradeIndexObj)=> {
                        this.grademap.set(gradeIndexObj._id.toString(), gradeIndexObj.grade)
                    })
                    logger.debug(" Grade Map after filling - ",[...this.grademap.entries()]);

                } else if (err) {
                    logger.error(" grade search encountered error  - ", err);
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" grade search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fetchgrade Exception -" + err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }

    fillSectionMap=() =>{
        const logger = getLogger('fillSectionMap');
        logger.debug(" Fill the section map");
        this.sectionmap.clear();

        try {

            Section.find({}, (err, section)=>{
                if (section.length > 0) {
                    logger.debug(" section found with provided input - " + JSON.stringify(section));
                    //Fill the section map
                    section.forEach((sectionIndexObj)=> {
                        this.sectionmap.set(sectionIndexObj._id.toString(), sectionIndexObj.section)
                    })
                    logger.debug(" Section Map after filling - ",[...this.sectionmap.entries()]);

                } else if (err) {
                    logger.error(" section search encountered error  - ", err);
                    return mapError.errorCodeToDesc(requestId, '502', "metadata")
                } else {
                    logger.error(" section search No data found");
                    return mapError.errorCodeToDesc(requestId, '504', "metadata")
                }
            })
        } catch (err) {
            logger.error("fetchsection Exception -", err);
            return mapError.errorCodeToDesc(requestId, '502', "metadata")
        }
    }

    classMap=(grade)=>{
        logger.debug("Class map is -",[...this.grademap.entries()]);
        logger.debug(new Date()+"Class map to fetch is -",grade);

        return this.grademap.get(grade)
    }


}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            logger.debug("No instance found initiating ...");
            Singleton.instance = new Mapper();
        }
    }

    getInstance() {
        logger.debug("Returning existing instance");
        return Singleton.instance;
    }

}

module.exports = Singleton;