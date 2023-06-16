import { Card, CardContent } from "@mui/material"
import { Dot } from 'react-animated-dots';

export default function AnswerCard({response}) {
    console.log(response)
    return (
        <Card className="ps-3 pe-3 pt-2 pb-2 ms-3 me-3" variant="outlined" style={{textAlign: 'left'}}>
            {response ? 
            <div>
                {/* {response.sources && <h5>Answer:</h5>} */}
                <div>{response.answer}</div>
                {response.sources && 
                <>
                    <div className="d-flex">
                        <div className="me-2" style={{fontWeight: 'bold'}}>Source: </div>
                        <div>{` ${response.sources}`}</div>
                    </div>
                    <div className="d-flex">
                        <div className="me-2" style={{fontWeight: 'bold'}}>Id: </div>
                        <div>{` ${response.id}`}</div>
                    </div>
                    <div className="d-flex">
                        <div className="me-2" style={{fontWeight: 'bold'}}>Label: </div>
                        <div>{` ${response.label[0]}`}</div>
                    </div>
                    <div className="d-flex">
                        <div className="me-2" style={{fontWeight: 'bold'}}>Description: </div>
                        <div>{` ${response.description[0]}`}</div>
                    </div>
                    <div className="d-flex">
                        <div className="me-2" style={{fontWeight: 'bold'}}>Last uploaded: </div>
                        <div>{` ${response.date[0]}`}</div>
                    </div>
                </>
                }
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