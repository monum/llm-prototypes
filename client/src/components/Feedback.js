import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FlagIcon from '@mui/icons-material/Flag';
import { Button, Card, Icon, Modal, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function Feedback({dialogue}) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleThumbUp = () => {
        alert(`user liked this following dialogue: \n ${dialogue.question} ${dialogue.answer}`)
    }

    const handleThumpDown = () => {
        alert(`user disliked this following dialogue: \n ${dialogue.question} ${dialogue.answer}`)
    }


    return (
        <>
        <Stack spacing={3} direction='row'>
            <ThumbUpOffAltIcon onClick={handleThumbUp}/>
            <ThumbDownOffAltIcon onClick={handleThumpDown}/>
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