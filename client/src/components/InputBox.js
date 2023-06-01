import { IconButton, InputAdornment, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

export default function InputBox({question, setQuestion, addQuestion}) {
    return (
        <TextField 
        className="mt-4"
        label='Ask us a question!' 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
        style={{width:'87%'}}
        InputProps={{
          endAdornment: 
          <InputAdornment position="end">
            <IconButton
              aria-label="ask question"
              onClick={addQuestion}
              edge="end"
            >
              <SendIcon/>
            </IconButton>
          </InputAdornment>
        }}/>
    )
}