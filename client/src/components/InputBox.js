import { IconButton, InputAdornment, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import customs from "../customizables";

export default function InputBox({question, setQuestion, addQuestion}) {
    const handleKeyDown = (key) => {
      if (key === 'Enter') {
        addQuestion();
      }
    }

    return (
        <TextField 
        className="mt-4"
        label='' 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
        onKeyDown={(e) => handleKeyDown(e.key)}
        style={{width:'87%', boxShadow:'10px'}}
        // multiline
        // focused
        InputProps={{
          endAdornment: 
          <InputAdornment position="end">
            <IconButton
              aria-label="ask question"
              onClick={addQuestion}
              edge="end"
              style={{
                color: question === "" ? "" : customs.sidebarToggleButtonColor
              }}
            >
              <SendIcon/>
            </IconButton>
          </InputAdornment>
        }}/>
    )
}