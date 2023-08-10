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
import FolderIcon from '@mui/icons-material/Folder';

const labels = [
    'Education',
    'Electricity',
    'Environment',
    'Finance',
    'Law',
    'Public Libraries',
    'Public Parks',
    'Public Transportation',
    'Public Utilities',
    'Social Services',
    'Technology',
    'Urban Planning'
]

function FilesList({chosenLabel, setChosenLabel, setShowFiles}) {
    return (
        <>
            <div className="btn" onClick={() => setShowFiles(false)}>
                <ArrowBackIcon/>
            </div>
            <List
                sx={{ width: '100%', maxWidth: 360 }} // , bgcolor: 'background.paper'
                component="nav"
                aria-labelledby="nested-list-subheader"
                // subheader={
                //     <ListSubheader component="div" id="nested-list-subheader">
                //         Choose a category:
                //     </ListSubheader>
                // }
                >
                {labels.map((label) => 
                    <ListItemButton onClick={() => {
                        setChosenLabel('what');
                        console.log(label)
                        console.log(chosenLabel)
                    }}>
                        <ListItemIcon>
                        <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={label} />
                    </ListItemButton>
                )}
                
            </List>
        </>
    )
}

export default function Files({setShowFiles}) {

    function LabelFiles({label}) {
        return (
            <div>{label}</div>
        )
    }


    const [chosenLabel, setChosenLabel] = React.useState("");

    return (
        <div className='bg-light'>
            {chosenLabel === "" && <FilesList chosenLabel={chosenLabel} setChosenLabel={setChosenLabel} setShowFiles={setShowFiles}/>}
            {labels.map(label => 
                {chosenLabel === label &&
                    <LabelFiles label={label}/>
                }
            )}
        </div>
    );
}