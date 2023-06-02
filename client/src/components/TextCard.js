import { Card, CardContent } from "@mui/material"
import { Dot } from 'react-animated-dots';

export default function TextCard({text}) {
    return (
        <Card className="ps-3 pe-3 pt-2 pb-2 ms-3 me-3" variant="outlined" style={{textAlign: 'left'}}>
            {text ? text : 
            <span className="mt-0 mb-0" style={{fontSize: '160%'}}>
                <Dot>.</Dot>
                <Dot>.</Dot>
                <Dot>.</Dot>
            </span>
            }
        </Card>
    )
}