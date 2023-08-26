import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import File from './upload/File';
import http from '../services/HttpServices';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Home from '@mui/icons-material/Home';
import People from '@mui/icons-material/People';
import PermMedia from '@mui/icons-material/PermMedia';
import Dns from '@mui/icons-material/Dns';
import Public from '@mui/icons-material/Public';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import customs from "../customizables";
import ListIcon from '@mui/icons-material/List';
import FolderIcon from '@mui/icons-material/Folder';
import Webpage from './upload/Webpage';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const FireNav = styled(List)({
    '& .MuiListItemButton-root': {
      paddingLeft: 24,
      paddingRight: 24,
    },
    '& .MuiListItemIcon-root': {
      minWidth: 0,
      marginRight: 16,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    },
  });
export default function SideBar({showSessions, setShowSessions}) {
      const [openAddFiles, setOpenAddFiles] = React.useState(false);
      const [openSeeFiles, setOpenSeeFiles] = React.useState(false);
      const [uploadMethod, setUploadMethod] = React.useState("");
      return (
        <Box sx={{ display: 'flex', height: '1200px', maxHeight:"100%"}}>
          <ThemeProvider
            theme={createTheme({
              components: {
                MuiListItemButton: {
                  defaultProps: {
                    disableTouchRipple: true,
                  },
                },
              },
              palette: {
                mode: 'dark',
                primary: { main: customs.sidebarTitleColor },
                background: { paper: customs.sidebarBackgroundColor },
              },
            })}
          >
            <Paper elevation={0} sx={{ width: 500, height:"100%", borderRadius: '0'}}>
              <FireNav component="nav" disablePadding>
                <div className='d-flex'>
                <IconButton style={{
                  borderRadius: 0,
                  color:"#ffffff",
                  backgroundColor: customs.sidebarToggleButtonColor,
                  padding: "18px 18px",
                  height: "50px",
                  width: "50px",
                  fontSize: "18px"
              }} variant="contained" onClick={() => setShowSessions(!showSessions)}>
                  <ListIcon/>
                </IconButton>
                <ListItemButton component="a" onClick={() => setShowSessions(false)}>
                  <ListItemIcon sx={{ fontSize: 20 }}>{customs.appEmoji}</ListItemIcon>
                  <ListItemText
                    sx={{ my: 0 }}
                    primary={customs.appName}
                    primaryTypographyProps={{
                      fontSize: 20,
                      fontWeight: 'medium',
                      letterSpacing: 0,
                    }}
                  />
                </ListItemButton>
                </div>
                <Divider />
                <ListItem component="div" disablePadding>
                  <ListItemButton sx={{ height: 56 }}>
                    <ListItemIcon>
                      <Home color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={customs.sidebarTitleText}
                      primaryTypographyProps={{
                        color: 'primary',
                        fontWeight: 'medium',
                        variant: 'body2',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                {uploadMethod === "" && 
                    <AddFileList 
                        open={openAddFiles} 
                        setOpen={setOpenAddFiles} 
                        setUploadMethod={setUploadMethod}/>}
                {uploadMethod === "url" &&
                  <Webpage setUploadMethod={setUploadMethod}/>}
                {uploadMethod === "file" &&
                  <File setUploadMethod={setUploadMethod}/>}
                <SeeFileList open={openSeeFiles} setOpen={setOpenSeeFiles}/>
              </FireNav>
            </Paper>
          </ThemeProvider>
        </Box>
      );
    }
  
function AddFileList({open, setOpen, setUploadMethod}) {
    const data = [
        { icon: <People />, label: 'pdf', type: "file" },
        { icon: <Dns />, label: 'txt', type: "file" },
        { icon: <PermMedia />, label: "png", type: "file" },
        { icon: <Public />, label: 'url', type: "url"},
      ];
    return (
        <Box
            sx={{
            bgcolor: open ? 'rgba(71, 98, 130, 0.2)' : null,
            pb: open ? 2 : 0,
            }}
        >
            <ListItemButton
            alignItems="flex-start"
            onClick={() => setOpen(!open)}
            sx={{
                px: 3,
                pt: 2.5,
                pb: open ? 0 : 2.5,
                '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
            }}
            >
            <ListItemText
                primary="Add Files"
                primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 'medium',
                lineHeight: '20px',
                mb: '2px',
                }}
                secondary="pdf, txt, png, url, ..."
                secondaryTypographyProps={{
                noWrap: true,
                fontSize: 12,
                lineHeight: '16px',
                color: open ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.5)',
                }}
                sx={{ my: 0 }}
            />
            <KeyboardArrowDown
                sx={{
                mr: -1,
                opacity: 0,
                transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                transition: '0.2s',
                }}
            />
            </ListItemButton>
            <div>
            {open &&
            data.map((item) => (
                <ListItemButton
                key={item.label}
                sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
                onClick={() => setUploadMethod(item.type)}
                >
                <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                </ListItemIcon>
                <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                />
                </ListItemButton>
            ))}
            </div>
        </Box>
    )
}

function SeeFileList({open, setOpen}) {
    
    const data = customs.fileCategories;

    const [chosenLabel, setChosenLabel] = React.useState("");
    const [files, setFiles] = React.useState([]);

    return (
        <Box
            sx={{
            bgcolor: open ? 'rgba(71, 98, 130, 0.2)' : null,
            pb: open ? 2 : 0,
            }}
        >
            <ListItemButton
            alignItems="flex-start"
            onClick={() => setOpen(!open)}
            sx={{
                px: 3,
                pt: 2.5,
                pb: open ? 0 : 2.5,
                '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
            }}
            >
            <ListItemText
                primary="View Files"
                primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 'medium',
                lineHeight: '20px',
                mb: '2px',
                }}
                secondary="by category"
                secondaryTypographyProps={{
                noWrap: true,
                fontSize: 12,
                lineHeight: '16px',
                color: open ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.5)',
                }}
                sx={{ my: 0 }}
            />
            <KeyboardArrowDown
                sx={{
                mr: -1,
                opacity: 0,
                transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                transition: '0.2s',
                }}
            />
            </ListItemButton>
            <div>
            {open &&
            data.map((category) => (
                <FileCategory category={category}/>
            ))}
            </div>
        </Box>
    )
}

function FileCategory({category}) {
  const [open, setOpen] = React.useState(false);
  const [chosenLabel, setChosenLabel] = React.useState("");
  const [files, setFiles] = React.useState([]);

  function handleExpandCategory() {
    setOpen(!open); // expand the list to show files
    http.get(`/get_files?label=${category}`)
    .then((res) => {
        setFiles(res.data)
    })
    .catch((error) => {
        console.error(error);
    });
  }

  return (
    <>
      <ListItemButton
          key={category}
          sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
          onClick={handleExpandCategory}
          >
          <ListItemIcon sx={{ color: 'inherit' }}>
              <FolderIcon/>
          </ListItemIcon>
          <ListItemText
              primary={category}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
          />
            <KeyboardArrowDown
                sx={{
                mr: -1,
                opacity: 1,
                transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                transition: '0.2s',
                }}
            />
            </ListItemButton>
            <div>
            {open &&
            files.map((file) => (
              <ListItemButton
                key={file.name}
                sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)'}}
                >
                <ListItemText
                    primary={file.name}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 'medium',paddingLeft:'18%' }}
                />
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <a href={file.url}> <FileDownloadIcon/> </a>
                </ListItemIcon>
            </ListItemButton>
            ))
            }
            </div>
    </>
  )
}