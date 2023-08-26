import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import {useState} from 'react'
import Dialogue from './components/q&a/Dialogue';
import http from './services/HttpServices';
import {IconButton, Stack} from '@mui/material';
import SideBar from './components/SideBar';
import InputBox from './components/InputBox';
import Response from './components/q&a/Response';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import ListIcon from '@mui/icons-material/List';
import customs from './customizables';

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
      <div className='d-flex' >
          {showSessions ? 
            <div className='col-2'>
              <SideBar showSessions={showSessions} setShowSessions={setShowSessions} />
            </div>
          : 
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
          }
          <div className='d-flex justify-content-center'>
            <div className="col-7" style={{position: "fixed", right: "20%"}}>
              <Stack style={{maxHeight: '690px', height:'900px', overflow: 'hidden'}} className="mt-4"> 
                <div style={{ 
                  overflowY: 'scroll', 
                  width: '100%', 
                  height: '100%', 
                  paddingRight: '100px', 
                  boxSizing: 'content-box'}}>
                  <Response response={{answer: "Hi there! How can I help you?"}}/>
                  {dialogues.map((dialogue, i) => <Dialogue dialogue={dialogue} showFeedbackIcons={i == dialogues.length - 1}/>)}
                </div>
              </Stack>
              <InputBox question={question} setQuestion={setQuestion} addQuestion={addQuestion} />
            </div>
          </div>
      </div>
    </div>
  );
}

export default App;
