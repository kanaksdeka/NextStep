var errormapping = function () {
    return {
        upload:{
            501: {
                resCode: "500-FUP-001",
                resDesc: "File upload aborted"
            },
            400: {
                resCode: "400-FUP-001",
                resDesc: "Bad resquest, file upload failed"
            },
            200: {
                resCode: "200-FUP-001",
                resDesc: "Document updation success"
            },
            204: {
                resCode: "204-FDL-001",
                resDesc: "Unable to find a matching reference for download"
            },
            502: {
                resCode: "500-FDL-001",
                resDesc: "Error encountered while downloading document"
            },
            503: {
                resCode: "500-FDL-003",
                resDesc: "This document cannot be viewed currently" 
            },
            504: {
                resCode: "500-FDL-004",
                resDesc: "This document requested for download cannot be found" 
            },
            504: {
                resCode: "500-UPL-004",
                resDesc: "Unable to find the profile trying to submit the assignment" 
            },


        },
        createperiod: {
            401: {
                resCode: "500-CRP-001",
                resDesc: "Invalid Start Date"
            },
            402: {
                resCode: "500-CRP-002",
                resDesc: "Invalid End Date"
            },
            403: {
                resCode: "500-CRP-003",
                resDesc: "Input Validation failed"
            },
            501: {
                resCode: "500-CRP-001",
                resDesc: "Failed while Period Creation"
            },
            502: {
                resCode: "500-CRP-002",
                resDesc: "Days requested for class doesn't align to the dates passed"
            },
            503: {
                resCode: "500-CRP-003",
                resDesc: "Failed while Period Deletion"
            }

        },
        metadata:{
            401: {
                resCode: "400-MET-001",
                resDesc: "Unauthorized"
            },
            422: {
                resCode: "400-MET-001",
                resDesc: "Input Validation failed"
            },
            402: {
                resCode: "402-MET-001",
                resDesc: "Invalid Start Date"
            },
            403: {
                resCode: "403-MET-002",
                resDesc: "Invalid End Date"
            },
            501: {
                resCode: "500-MET-001",
                resDesc: "Failed while creating record"
            },
            502: {
                resCode: "500-MET-002",
                resDesc: "Error encountered while performing DB operation"
            },
            503: {
                resCode: "500-MET-003",
                resDesc: "Duplicate entry found"
            },
            504: {
                resCode: "500-MET-004",
                resDesc: "No data found"
            },
            200: {
                resCode: "200-MET-001",
                resDesc: "Operation Success"
            },            
            204: {
                resCode: "204-MET-001",
                resDesc: "No matching record found"
            },


        },
        updateperiod: {
            204: {
                resCode: "204-UPP-001",
                resDesc: "Unable to find a matching reference "
            },
            401: {
                resCode: "400-UPP-001",
                resDesc: "Invalid Start Date"
            },
            402: {
                resCode: "400-UPP-002",
                resDesc: "Invalid End Date"
            },
            403: {
                resCode: "400-UPP-003",
                resDesc: "Input Validation failed"
            },
            404: {
                resCode: "400-UPP-004",
                resDesc: "Unable to find details for the Class"
            },
            500: {
                resCode: "500-UPP-001",
                resDesc: "Exception while upating Period"
            },
            501: {
                resCode: "501-UPP-001",
                resDesc: "Failed while Updating Period"
            },
            502: {
                resCode: "502-UPP-001",
                resDesc: "Failed while trying to readjust Periods"
            },
            503: {
                resCode: "503-UPP-001",
                resDesc: "Start Date and End Date should be provided for this operation"
            },
            504: {
                resCode: "504-UPP-001",
                resDesc: "Failed to update Status, Invalid Document Reference"
            },
            505: {
                resCode: "504-UPP-001",
                resDesc: "Readjusting dates would require days to be mentioned"
            },
            200: {
                resCode: "200-UPP-001",
                resDesc: "Updation successful"
            },
            506: {
                resCode: "500-UPP-006",
                resDesc: "File size exceeded the expected limit"
            }

        },
        getperiods:{
            401: {
                resCode: "401-GPR-000",
                resDesc: "Rejecting, Unauthorised"
            },
            204: {
                resCode: "204-GPR-001",
                resDesc: "No Periods found"
            },
            500: {
                resCode: "500-GPR-000",
                resDesc: "Exception while fetching Periods"
            },
            501: {
                resCode: "501-GPR-001",
                resDesc: "Error in fetching period information"
            },
            502: {
                resCode: "502-GPR-001",
                resDesc: "Fatal exception check log for details"
            }

        },
        scheduler:{
            500: {
                resCode: "500-SCH-000",
                resDesc: "Exception while fetching Periods"
            },
            501: {
                resCode: "501-SCH-001",
                resDesc: "Error in fetching period information"
            },
            502: {
                resCode: "502-SCH-001",
                resDesc: "Fatal exception check log for details"
            },
            204: {
                resCode: "204-SCH-001",
                resDesc: "No data found"
            }

        },
        studentclass:{
            204: {
                resCode: "204-ICS-001",
                resDesc: "Unable to find a matching Student Profile"
            },
            500: {
                resCode: "500-ICS-000",
                resDesc: "Error while executing DB operation"
            },
            501: {
                resCode: "501-GPR-001",
                resDesc: "Error in fetching period information"
            },
            502: {
                resCode: "502-GPR-001",
                resDesc: "Fatal exception check log for details"
            }

        },
        metaDataList: {
            500: {
                resCode: "500-MDL-001",
                resDesc: "Error while fetching config data"
            },
            204: {
                resCode: "204-MDL-001",
                resDesc: "Config failed to be fetched, due to wrong search key"
            }
        },
        authentication: {
            3070: {
                resCode: "500-AUTH-001",
                resDesc: "Unable to find user with the provided authorization"
            },
            500: {
                resCode: "500-AUTH-002",
                resDesc: "Internal Server error"
            },
            401: {
                resCode: "401-AUTH-001",
                resDesc: "Token validation failure,forbidden"
            },
            402: {
                resCode: "402-AUTH-001",
                resDesc: "Authentication Failure, Session Expired"
            },
            403: {
                resCode: "403-AUTH-001",
                resDesc: "You dont have enough Privilege "
            },
            404: {
                resCode: "404-AUTH-001",
                resDesc: "Authentication token not passed"
            },
            501: {
                resCode: "500-AUTH-001",
                resDesc: "Fatal error while authenticating, cannot proceed"
            }

        },
        updateReference: {
            3000: {
                resCode: "500-UPR-001",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-UPR-002",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-UPR-003",
                resDesc: "DB Exception encountered"
            },

            500: {
                resCode: "500-UPR-004",
                resDesc: "Update Reference Server error"
            }
        },
        getMetadata: {
            3070: {
                resCode: "204-QRP-001",
                resDesc: "No data found"
            },

            500: {
                resCode: "500-QRP-002",
                resDesc: "Internal Server error"
            }
        },
        getRefTime: {
            3070: {
                resCode: "204-GRT-001",
                resDesc: "No Reference found"
            },

            500: {
                resCode: "500-GRT-002",
                resDesc: "Internal Server error"
            }
        },
        bestRates: {
            3070: {
                resCode: "204-BRT-001",
                resDesc: "No TDU found found for the ZIP"
            },

            500: {
                resCode: "500-BRT-002",
                resDesc: "Internal Server error"
            },
            501: {
                resCode: "500-BRT-003",
                resDesc: "No TDU server the ZIP"
            },
            502: {
                resCode: "500-BRT-004",
                resDesc: "Invalid Texas ZipCode "
            },            
            503: {
                resCode: "500-BRT-005",
                resDesc: "Input must be between 1 and 10000 kWh"
            }
        },
        deleteMetadata: {
            500: {
                resCode: "500-DLP-001",
                resDesc: "Aborting Plan Deletion due to error"
            },
            204: {
                resCode: "204-DLP-002",
                resDesc: "No record found for deletion"
            },
            3030: {
                resCode: "500-DLP-003",
                resDesc: "Error while deleting Plan"
            },
            3050: {
                resCode: "500-DLP-004",
                resDesc: "Fatal Error while deleting Plan , Check Log!"
            }
        },
        truncate: {
            500: {
                resCode: "500-TRUNC-001",
                resDesc: "Aborting Collection Truncation due to error"
            },
            3060: {
                resCode: "500-TRUNC-002",
                resDesc: "Error while Truncating Collection"
            }
        },
        fetchfromsmt:{
            500: {
                resCode: "500-FFSMT-001",
                resDesc: "Aborting due to failure while fetching user details from SMT"
            }
        },
        fetchesiid:{
            400: {
                resCode: "400-FESIID-001",
                resDesc: "Address should contain only [A-Z a-z 0-9]"
            },
            401: {
                resCode: "400-FESIID-001",
                resDesc: "Supported Premise type Residential|Commercial"
            },
            501: {
                resCode: "500-FESIID-001",
                resDesc: "Invalid Texas ZipCode "
            },
            502: {
                resCode: "500-FESIID-002",
                resDesc: "Failed to fetch ESIID"
            },
        },
        premiseDetails:{
            500: {
                resCode: "500-PDSMT-001",
                resDesc: "Aborting due to failure while fetching premise details from SMT"
            }
        },
        meterDetails:{
            500: {
                resCode: "500-MDSMT-001",
                resDesc: "Aborting due to failure while fetching meter details from SMT"
            },
            400: {
                resCode: "400-MDSMT-001",
                resDesc: "Approval required to fetch meter informaiton form SMT"
            }
        },      
        agreement:{
            500: {
                resCode: "500-AGSMT-001",
                resDesc: "Aborting due to failure while submitting agreement to SMT"
            }
        },
        httpcall: {
            500: {
                resCode: "500-HTTP-001",
                resDesc: "HTTP Request failed"
            },
            501: {
                resCode: "500-HTTP-002",
                resDesc: "Exception occured while making HTTP request "
            }
        },
        httpscall: {
            500: {
                resCode: "500-HTTPS-001",
                resDesc: "HTTPS response error"
            },
            501: {
                resCode: "500-HTTPS-002",
                resDesc: "HTTPS response non ending error"
            },
            502: {
                resCode: "500-HTTPS-003",
                resDesc: "HTTPS request error"
            },
            503: {
                resCode: "500-HTTPS-004",
                resDesc: "HTTPS request timeout"
            },
            504: {
                resCode: "500-HTTPS-005",
                resDesc: "HTTPS socket timeout"
            },
            505: {
                resCode: "500-HTTPS-006",
                resDesc: "Exception occured while making HTTPS request "
            },
            400: {
                resCode: "400-HTTPS-001",
                resDesc: "SMT dint get an approval from the ESIID to fetch data"
            },

        },
        tempSignUp:{
            200:{
                resCode: "200-TUS-001",
                resDesc: "Activation mail sent,kindly activate your account"
            },
            201:{
                resCode: "200-TUS-002",
                resDesc: "User successfully activated, please check your mail for credentials"
            },
            401:{
                resCode: "400-TUS-001",
                resDesc: "Rejecting, Unauthorised"
            },
            402:{
                resCode: "400-TUS-002",
                resDesc: "Registration Data Sanity Failed"
            },
            403:{
                resCode: "400-TUS-003",
                resDesc: "Invalid format of Email/Password"
            },
            404:{
                resCode: "400-TUS-004",
                resDesc: "Temporary user registration failed"
            },
            405:{
                resCode: "400-TUS-005",
                resDesc: "An account with the provided mail id already exists"
            },
            406:{
                resCode: "400-TUS-006",
                resDesc: "You have already signed up. Please check your email to verify your account"
            },
            407:{
                resCode: "400-TUS-007",
                resDesc: "Invalid email format"
            },
            408:{
                resCode: "400-TUS-008",
                resDesc: "Password must be 6-10 characters long"
            },
            409:{
                resCode: "400-TUS-009",
                resDesc: "Passwords do not match"
            },
            410:{
                resCode: "400-TUS-010",
                resDesc: "First name is Mandatory"
            },
            411:{
                resCode: "400-TUS-011",
                resDesc: "Last name is Mandatory"
            },
            501:{
                resCode: "500-TUS-001",
                resDesc: "Sequence generation error"
            },
            502:{
                resCode: "500-TUS-002",
                resDesc: "Failed to send Verification mail"
            },
            503:{
                resCode: "500-TUS-003",
                resDesc: "Fatal error user signup "
            },
            504:{
                resCode: "500-TUS-004",
                resDesc: "User activation failed"
            },
            505:{
                resCode: "500-TUS-005",
                resDesc: "Fatal error during account verification"
            }

        },
        forgotpassword:{
            200:{
                resCode: "200-FPWD-001",
                resDesc: "Password reset mail sent"
            },
            501:{
                resCode: "501-FPWD-001",
                resDesc: "Internal DB Error"
            },
            501:{
                resCode: "501-FPWD-002",
                resDesc: "Invalid email"
            },
            502:{
                resCode: "502-FPWD-001",
                resDesc: "Error while sending mail"
            },
            503:{
                resCode: "503-FPWD-001",
                resDesc: "Fatal operation error ,check logs"
            },
            204:{
                resCode: "204-FPWD-001",
                resDesc: "Unable to find a matching email id for password reset"
            }
        },
        changepassword:{
            500:{
                resCode: "500-CPWD-001",
                resDesc: "Server Error please check log"
            },
            501:{
                resCode: "501-CPWD-001",
                resDesc: "Internal DB Error"
            },
            502:{
                resCode: "502-CPWD-001",
                resDesc: "Error while sending confirmation mail for password change"
            },
            503:{
                resCode: "503-CPWD-001",
                resDesc: "Fatal operation error , check logs"
            },
            504:{
                resCode: "504-CPWD-001",
                resDesc: "Reset token provided for password change is expired"
            },
            200:{
                resCode: "200-CPWD-001",
                resDesc: "Password change success, please check your email"
            },
            204:{
                resCode: "204-CPWD-001",
                resDesc: "Unable to find a matching profile for password reset"
            },
            205:{
                resCode: "205-CPWD-001",
                resDesc: "Invalid token, kindly reinitiate the reset"
            },
            401:{
                resCode: "401-CPWD-001",
                resDesc: "Rejecting, Unauthorised"
            },
            403:{
                resCode: "403-CPWD-001",
                resDesc: "Forbidden"
            },
            402:{
                resCode: "402-CPWD-001",
                resDesc: "Validation Failure. Incorrect Current Password"
            },
            404:{
                resCode: "404-CPWD-001",
                resDesc: "New Password cannot be same as Current Password"
            },
            405:{
                resCode: "405-CPWD-001",
                resDesc: "New Password and Confirm Password doesnt match"
            },
            406:{
                resCode: "406-CPWD-001",
                resDesc: "Password should be more than 6 characters"
            },
        },
        login:{
            204:{
                resCode: "204-PL-001",
                resDesc: "Unable to find a matching email id / user disabled"
            },
            401:{
                resCode: "401-PL-001",
                resDesc: "Rejecting, Unauthorised"
            },
            403:{
                resCode: "403-PL-001",
                resDesc: "Forbidden"
            },
            501:{
                resCode: "501-PL-001",
                resDesc: "Fatal Error Cannot Proceed"
            },
            500:{
                resCode: "500-PL-001",
                resDesc: "Fatal Error"
            },
            502:{
                resCode: "502-PL-001",
                resDesc: "Exception Caught"
            },
            3000: {
                resCode: "500-PL-001",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-PL-002",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-PL-003",
                resDesc: "DB Exception encountered"
            },
        },
        sequenceNumber: {
            501: {
                resCode: "500-SNUM-001",
                resDesc: "Sequence Number Generation "
            },

            502: {
                resCode: "500-SNUM-002",
                resDesc: "Error while generating Sequence Number"
            }

        },
        logout:{
            200:{
                resCode: "200-LOUT-001",
                resDesc: "Logout success"
            },
            501:{
                resCode: "500-LOUT-001",
                resDesc: "Unable to logout the user"
            },
            502:{
                resCode: "500-LOUT-002",
                resDesc: "Invalid format cannot proceed"
            },
            503:{
                resCode: "500-LOUT-003",
                resDesc: "Exception while logging out user"
            },
            3000: {
                resCode: "500-LOUT-004",
                resDesc: "Update failed due to library error"
            },
            3010: {
                resCode: "500-LOUT-005",
                resDesc: "Failed to update reference time"
            },
            3020: {
                resCode: "500-LOUT-006",
                resDesc: "DB Exception encountered"
            }
        },
        updateuser: {
            422: {
                resCode: "422-UUR-000",
                resDesc: "Rejecting, empty payload received for update"
            },
            401:{
                resCode: "401-UUR-000",
                resDesc: "Rejecting, Unauthorised"
            },
            204: {
                resCode: "401-UUR-000",
                resDesc: "Unable to find a matching profile for update"
            },
            200: {
                resCode: "200-UUR-000",
                resDesc: "Profile updation success"
            },
            500: {
                resCode: "500-UUR-000",
                resDesc: "Exception while updating profile information"
            },
            501: {
                resCode: "500-UUR-001",
                resDesc: "Error in updating profile information"
            },
            502: {
                resCode: "500-UUR-001",
                resDesc: "Fatal exception check log for details"
            },
            504: {
                resCode: "500-UUR-004",
                resDesc: "Updated for Profile image error"
            },
            505: {
                resCode: "500-UUR-004",
                resDesc: "Something went wrong check logs"
            },
            506: {
                resCode: "500-UUR-006",
                resDesc: "File size exceeded the expected limit"
            }
        },
        sendnotification: {
            200: {
                resCode: "200-SNN-001",
                resDesc: "Notification/Update done successful"
            },
            501: {
                resCode: "501-SNN-001",
                resDesc: "Sender missing for notificaiton"
            },
            500: {
                resCode: "500-SNN-000",
                resDesc: "Exception while updating user with notificaiton"
            },
            401:{
                resCode: "401-SNN-001",
                resDesc: "Profile is not authorised to send notification"
            },

        },
        updatenotification: {
            200: {
                resCode: "200-UNN-001",
                resDesc: "Updation successful"
            },
            501: {
                resCode: "501-UNN-001",
                resDesc: "Error updating notificaiton status"
            },
            500: {
                resCode: "500-UNN-001",
                resDesc: "Exception while updating notificaiton for user"
            },
            502: {
                resCode: "500-DNN-001",
                resDesc: "Error while deleting"
            },
            502: {
                resCode: "503-DNN-001",
                resDesc: "unsupported notification status"
            }

        },
        getNotifications:{
            204: {
                resCode: "204-GNN-001",
                resDesc: "No notification found"
            },
            500: {
                resCode: "500-GNN-000",
                resDesc: "Exception while fetching notification"
            },
            501: {
                resCode: "501-GNN-001",
                resDesc: "Error in fetching notifications"
            },
            502: {
                resCode: "502-GNN-001",
                resDesc: "Fatal exception check log for details"
            }

        },
        updateSpecificStdAssignment: {
            200: {
                resCode: "200-USA-001",
                resDesc: "Updation successful"
            },
            501: {
                resCode: "501-USA-001",
                resDesc: "Error updating assignment with teachers input"
            },
            500: {
                resCode: "500-USA-001",
                resDesc: "Exception while updating status for assignment"
            },
            502: {
                resCode: "500-USA-001",
                resDesc: "Error while deleting"
            },
            503: {
                resCode: "503-USA-001",
                resDesc: "Unable to update student with the allocated Grade"
            },
            504: {
                resCode: "504-USA-001",
                resDesc: "Unable to update the class record with grade"
            }

        },        
        getscores:{
            403: {
                resCode: "400-GSC-001",
                resDesc: "Authorization failure for performing the operation"
            },
            501: {
                resCode: "500-GSC-001",
                resDesc: "Failed while fetching record"
            },
            502: {
                resCode: "500-GSC-002",
                resDesc: "No data found"
            },
            503: {
                resCode: "500-GSC-003",
                resDesc: "Duplicate entry found"
            },
            504: {
                resCode: "500-GSC-004",
                resDesc: "No record matched the search criteria"
            },
            200: {
                resCode: "200-GSC-001",
                resDesc: "Operation Success"
            },

        },
        getmyAssignments:{
            403: {
                resCode: "400-GMA-001",
                resDesc: "Authorization failure for performing the operation"
            },
            501: {
                resCode: "500-GMA-001",
                resDesc: "Failed while creating record"
            },
            502: {
                resCode: "500-GMA-002",
                resDesc: "No data found"
            },
            503: {
                resCode: "500-GMA-003",
                resDesc: "Duplicate entry found"
            },
            504: {
                resCode: "500-GMA-004",
                resDesc: "No record matched the search criteria"
            },
            200: {
                resCode: "200-GMA-001",
                resDesc: "Operation Success"
            },
        },
        submitfinalgrade:{
            403: {
                resCode: "400-SFG-001",
                resDesc: "Authorization failure for performing the operation"
            },
            501: {
                resCode: "500-SFG-001",
                resDesc: "Failed while creating record"
            },
            502: {
                resCode: "500-SFG-002",
                resDesc: "No data found"
            },
            503: {
                resCode: "500-SFG-003",
                resDesc: "Duplicate entry found"
            },
            504: {
                resCode: "500-SFG-004",
                resDesc: "No record matched the search criteria"
            },
            200: {
                resCode: "200-SFG-001",
                resDesc: "Operation Success"
            },

        },
        attendance:{
            412: {
                resCode: "412-TAT-001",
                resDesc: "Input Validation failed"
            },
            501: {
                resCode: "500-TAT-001",
                resDesc: "Failed while creating record"
            },
            502: {
                resCode: "500-TAT-002",
                resDesc: "Error encountered while performing DB operation"
            },
            503: {
                resCode: "500-TAT-003",
                resDesc: "Duplicate entry found"
            },
            504: {
                resCode: "500-TAT-004",
                resDesc: "No data found"
            },
            200: {
                resCode: "200-TAT-001",
                resDesc: "Operation Success"
            },

        },
        updateprofile: {
            422: {
                resCode: "422-UPR-000",
                resDesc: "Rejecting, payload received for update"
            },
            401: {
                resCode: "401-UPR-000",
                resDesc: "Unable to find a matching profile for update"
            },
            200: {
                resCode: "200-UPR-000",
                resDesc: "Updation success"
            },
            500: {
                resCode: "500-UPR-000",
                resDesc: "Exception while updating profile information"
            },
            501: {
                resCode: "501-UPR-001",
                resDesc: "Error in updating profile information"
            },
            502: {
                resCode: "502-UPR-001",
                resDesc: "Fatal exception check log for details"
            },
            201: {
                resCode: "201-UPR-001",
                resDesc: "Profile update in progress"
            },
            202: {
                resCode: "202-UPR-001",
                resDesc: "Profile updated without input data rejected "
            },
            203: {
                resCode: "203-UPR-001",
                resDesc: "Pending "
            },
            204: {
                resCode: "203-UPR-001",
                resDesc: "No data found "
            },
            205: {
                resCode: "205-UPR-001",
                resDesc: "Active Congratulation"
            },

        },
        getprofile: {
            204:{
                resCode: "204-GPR-000",
                resDesc: "Unable to find a matching profile"
            },
            401: {
                resCode: "401-AUTH-001",
                resDesc: "Aunauthorised, forbidden"
            },
            500: {
                resCode: "500-GPR-000",
                resDesc: "Exception while fetching profile information"
            },
            501: {
                resCode: "501-GPR-001",
                resDesc: "Error in fetching profile information"
            },
            502: {
                resCode: "502-GPR-001",
                resDesc: "Fatal exception check log for details"
            }
            
        },
        mynotes: {
            204:{
                resCode: "204-MNT-000",
                resDesc: "Unable to find a matching record"
            },
            401: {
                resCode: "401-MNT-001",
                resDesc: "Aunauthorised, forbidden"
            },
            500: {
                resCode: "500-MNT-000",
                resDesc: "Exception while fetching notes"
            },
            501: {
                resCode: "501-MNT-001",
                resDesc: "Error in fetching notes"
            },
            502: {
                resCode: "502-MNT-001",
                resDesc: "Fatal exception check log for details"
            }
            
        },

    }
}

module.exports = new errormapping();
