import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FlagIcon from '@mui/icons-material/Flag';
import { Button, Card, Icon, Modal, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { toastSuccess, toastWarn } from '../services/NotificationServices';
const config = require('../config.json');

export default function Feedback({dialogue}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

    const checkIfTableExists = () => {
        try {
            fetch(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${config.AIRTABLE_TABLE_NAME}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Authorization": "Bearer " + config.AIRTABLE_API_KEY,
                    "Content-Type": "application/json"
                }
            }).then((res) => {
                return true;
            })
        } catch (e) {
            toastWarn(`Table ${config.AIRTABLE_TABLE_NAME} does not exist, creating table...`);
            return false;
        }
    }

    const createTable = () => {
        try {
            fetch(`https://api.airtable.com/v0/meta/bases/${config.AIRTABLE_BASE_ID}/tables`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Authorization": "Bearer " + config.AIRTABLE_API_KEY,
                    "Content-Type": "application/json"
                },
                body: {
                        "description": "A table for storing user feedbacks",
                        "fields": [
                          {
                            "description": "unique key field of the table",
                            "name": "Id",
                            "type": "singleLineText"
                          },
                          {
                            "name": "Question",
                            "type": "singleLineText"
                          },
                          {
                            "name": "Answer",
                            "type": "longText"
                          },
                          {
                            "name": "Source",
                            "type": "longText"
                          },
                          {
                            "name": "Positive",
                            "options": {
                              "color": "blueBright",
                              "icon": "check"
                            },
                            "type": "checkbox"
                          },
                          {
                            "name": "Comment",
                            "type": "longText"
                          }
                        ],
                        "name": config.AIRTABLE_TABLE_NAME
                }
            }).then((res) => {
                return true;
            })
        } catch (e) {
            console.log(e)
            toastWarn("Failed to create table: "+e);
            return false;
        }
    }

    const handleFeedback = async (positive) => {
        const d = new Date();
        const data = {
            "fields" :{
                "Id": ""+d.getTime(),
                "Question": dialogue.question,
                "Answer": dialogue.response.answer,
                "Source": JSON.stringify(dialogue.response.sources),
                "Positive": positive
            }
        }
        try {
            if (!checkIfTableExists()) createTable();
            fetch(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${config.AIRTABLE_TABLE_NAME}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Authorization": "Bearer " + config.AIRTABLE_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then((res) => res.json()).then((res) => {
                console.log(res);
                toastSuccess("Thank you for your feedback!")
            })
        } catch (e) {
            toastWarn("error: "+e);
        }
    }

    function handleDetailedFeedback() {
        if (modalContent === "") {
            toastWarn("Feedback cannot be empty!");
            return;
        }
        const d = new Date();
        const data = {
            "fields" :{
                "Id": ""+d.getTime(),
                "Question": dialogue.question,
                "Answer": dialogue.response.answer,
                "Source": JSON.stringify(dialogue.response.sources),
                "Comment": modalContent
            }
        }
        try {
            if (!checkIfTableExists()) createTable();
            fetch(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${config.AIRTABLE_TABLE_NAME}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Authorization": "Bearer " + config.AIRTABLE_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then((res) => res.json()).then((res) => {
                console.log(res);
                toastSuccess("Thank you for your feedback!")
            })
        } catch (e) {
            toastWarn("error: "+e);
        }
    }

    return (
        <>
        <Stack spacing={3} direction='row'>
            <ThumbUpOffAltIcon onClick={() => handleFeedback(true)}/>
            <ThumbDownOffAltIcon onClick={() => handleFeedback(false)}/>
            <DriveFileRenameOutlineIcon onClick={() => setModalOpen(true)}/>
        </Stack>
        <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
            <Card className="p-4" 
                style={{position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',}}>
                {/* <Card className="p-3"> */}
                    <h5>"{dialogue.question}"</h5>
                {/* </Card> */}
                <h3>Your feedback</h3>
                <TextField multiline style={{width: '100%'}} rows={8} value={modalContent} onChange={(e) => setModalContent(e.target.value)}></TextField>
                <Button onClick={handleDetailedFeedback}>Submit Feedback</Button>
            </Card>
        </Modal>
        </>
    )
}