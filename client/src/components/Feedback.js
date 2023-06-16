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

    const handleFeedback = async (positive) => {
        const d = new Date();
        const data = {
            "fields" :{
                "Id": ""+d.getTime(),
                "Question": dialogue.question,
                "Answer": dialogue.response.answer,
                "Source": dialogue.response.sources,
                "Positive": positive
            }
        }
        try {
            fetch(`https://api.airtable.com/v0/${config.baseId}/${config.tableName}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Authorization": "Bearer " + config.api_key,
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
                    <h5>"{dialogue.answer}"</h5>
                {/* </Card> */}
                <h3>Your feedback</h3>
                <TextField multiline style={{width: '100%'}} rows={8}></TextField>
                <Button>Submit Feedback</Button>
            </Card>
        </Modal>
        </>
    )
}