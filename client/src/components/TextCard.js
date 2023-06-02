import { Card, CardContent } from "@mui/material"

export default function TextCard({text}) {
    return (
        <Card className="ps-3 pe-3 pt-2 pb-2 ms-3 me-3" variant="outlined" style={{textAlign: 'left'}}>
                {text}
        </Card>
    )
}