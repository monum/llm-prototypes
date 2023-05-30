import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import {useState} from 'react'
import Dialogue from './components/Dialogue';
import http from './services/HttpServices';
import NavBar from './components/NavBar';
import Sessions from './components/Sessions';
import { Container, Divider, Link, TextField } from '@mui/material';
import SideBar from './SideBar';

function App() {

  const [dialogues, setDialogues] = useState([]);
  const [question, setQuestion] = useState('');
  const [showSessions, setShowSessions] = useState(true);

  const addQuestion = () => {
    if (question) {
      /* post question */ 
      let newDialogue = {
        question: question,
        answer: ""
      }
      setDialogues([...dialogues, newDialogue]);

      /* get answer from GPT and post it */
      http.get(`/query?question=${question}`)
      .then(({data}) => {
        // update newDialogue with the answer returned from GPT
        newDialogue.answer = data;
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
      {/* <NavBar/> */}
      <div className='d-flex' >
        {showSessions ? 
          <div className='col-3'> {/* offcanvas offcanvas-start show*/}
            <SideBar showSessions={showSessions} setShowSessions={setShowSessions} />
          </div>
        : 
        <div onClick={() => setShowSessions(!showSessions)}>
          {'>'}
        </div>
        }
        <div className={showSessions ? 'col-8 justify-content-center' : 'col-12 justify-content-center'}> {/* style={{minHeight: '100%', height:'100%'}} */}
          <h1> ask me a question! </h1>

          <div className='d-flex justify-content-center'>
            <div className='col-8'>
              {dialogues.map((dialogue) => <Dialogue dialogue={dialogue}/>)}
            </div>
          </div>

          <div class="d-flex col-5" style={{position: 'fixed', left: '30%', bottom: '10%'}}> {/** style={{position: 'fixed', left: '50%', bottom: '10%'}} */}
            <TextField label='Ask me a question!' value={question} onChange={(e) => setQuestion(e.target.value)} style={{ width: "90%" }}/>
            <div className="btn btn-success ms-3 p-3" onClick={addQuestion}> post </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
