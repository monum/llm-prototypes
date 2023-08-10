import { Button, Card, CardContent, Collapse } from "@mui/material"
import { useState } from "react";
import { Dot } from 'react-animated-dots';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FileCard from "./FileCard";

export default function AnswerCard({response}) {
    const [showSources, setShowSources] = useState(false);
    return (
        <Card className="ps-3 pe-3 pt-2 pb-2 ms-3 me-3" variant="outlined" style={{textAlign: 'left'}}>
            {response ? 
            <div>
                {/* {response.sources && <h5>Answer:</h5>} */}
                <div>{response.answer}</div>
                {response.sources &&
                <div>
                    <div className="d-flex" onClick={() => setShowSources(!showSources)}>
                        <div>show sources</div>
                        {showSources ? <ExpandLess /> : <ExpandMore />}
                    </div>
                    <Collapse in={showSources} timeout="auto" unmountOnExit>
                        {response.sources.map((source) => (<FileCard file={source}/>))}
                    </Collapse>
                </div>}
            </div>
            : 
            <span className="mt-0 mb-0" style={{fontSize: '160%'}}>
                <Dot>.</Dot>
                <Dot>.</Dot>
                <Dot>.</Dot>
            </span>
            }
        </Card>
    )
}