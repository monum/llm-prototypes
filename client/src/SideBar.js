import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import File from './components/upload/File';
import Wikipedia from './components/upload/Wikipedia';
import Webpage from './components/upload/Webpage';

export default function SideBar({showSessions, setShowSessions}) {
    function UploadMethodSelectPanel() {
        //   const handleClick = () => {
        //     setOpen(!open);
        //   };

        return (
            <>
                <div className="btn" onClick={() => setShowSessions(!showSessions)}>
                <ArrowBackIcon/>
                </div>
                <List
                    sx={{ width: '100%', maxWidth: 360 }} // , bgcolor: 'background.paper'
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Choose a upload method:
                        </ListSubheader>
                    }
                    >
                    <ListItemButton onClick={() => setUploadMethod('file')}>
                        <ListItemIcon>
                        <SendIcon />
                        </ListItemIcon>
                        <ListItemText primary="File" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setUploadMethod('wikipedia')}>
                        <ListItemIcon>
                        <DraftsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Wikipedia" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setUploadMethod('url')}>
                        <ListItemIcon>
                        <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary="Web page" />
                        {/* {open ? <ExpandLess /> : <ExpandMore />} */}
                    </ListItemButton>
                        {/* <Collapse in={open} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => setUploadMethod('')}>
                                <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon>
                                <ListItemText primary="Starred" />
                            </ListItemButton>
                            </List>
                        </Collapse> */}
                </List>
            </>
        )
    }


    const [uploadMethod, setUploadMethod] = React.useState("");

    return (
        <div className='bg-light'>
            {uploadMethod === "" && <UploadMethodSelectPanel/>}
            {uploadMethod === "file" && <File setUploadMethod={setUploadMethod}/>}
            {uploadMethod === "wikipedia" && <Wikipedia setUploadMethod={setUploadMethod}/>}
            {uploadMethod === "url" && <Webpage setUploadMethod={setUploadMethod}/>}
        </div>
    );
}
