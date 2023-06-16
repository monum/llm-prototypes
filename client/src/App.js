import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import {useState} from 'react'
import Dialogue from './components/Dialogue';
import http from './services/HttpServices';
import NavBar from './components/NavBar';
import Sessions from './components/Sessions';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuIcon from '@mui/icons-material/Menu';
import { Container, Divider, IconButton, InputAdornment, Link, Stack, TextField } from '@mui/material';
import SideBar from './SideBar';
import InputBox from './components/InputBox';
import Response from './components/Response';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

function App() {

  const [dialogues, setDialogues] = useState([]);
  const [question, setQuestion] = useState('');
  const [showSessions, setShowSessions] = useState(false);

  const addQuestion = () => {
    if (question) {
      /* post question */ 
      let newDialogue = {
        question: question,
        response: ""
      }
      setDialogues([...dialogues, newDialogue]);

      /* get response from GPT and post it */
      http.post('/query', {question: question})
      .then((res) => {
        const {data} = res;
        // update newDialogue with the response returned from GPT
        newDialogue.response = data;

        setDialogues([...dialogues, newDialogue])
      })
      .catch((error) => {
        console.error(error);
      });
      setQuestion('');
    }
  }

  return (
    <div className="App">
      <ToastContainer />
      {/* <NavBar/> */}
      <div className='d-flex' >
        {showSessions ? 
          <div className='col-3'> {/* offcanvas offcanvas-start show*/}
            <SideBar showSessions={showSessions} setShowSessions={setShowSessions} />
          </div>
        : 
          <div className="btn" onClick={() => setShowSessions(!showSessions)} style={{height: '50px'}}>
            <PlaylistAddIcon/>
          </div>
        }
        <div className={showSessions ? 'col-8' : 'col-12'}> {/* style={{minHeight: '100%', height:'100%'}} */}
          <div className='d-flex justify-content-center'>
            <div className={showSessions ? 'col-10' : 'col-7'}>
              <h3 class="mt-2"> 🤖 Boston LLM </h3>
              <Stack style={{maxHeight: '650px', height:'800px', overflow: 'auto'}} className="mt-4"> 
                <Response response={{answer: "Hi there! How can I help you?"}}/>
                {dialogues.map((dialogue, i) => <Dialogue dialogue={dialogue} showFeedbackIcons={i == dialogues.length - 1}/>)}
              </Stack>
              {/** style={{position: 'fixed', left: '30%', bottom: '10%'}}*/}
              <InputBox question={question} setQuestion={setQuestion} addQuestion={addQuestion} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
