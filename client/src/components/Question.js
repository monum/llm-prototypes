import Avatar from "./Avatar";
import TextCard from "./AnswerCard";
import dino_avatar from '../assets/dino.jpg';
import { Card } from "@mui/material";

export default function Question({question}) {
    return (
        <div className="d-flex justify-content-end">
            <div className="d-flex">
                <div className="">
                    <Card className="ps-3 pe-3 pt-2 pb-2 ms-3 me-3" variant="outlined" style={{textAlign: 'left'}}>{question}</Card>
                </div>
                <h3 className="">
                    <Avatar img={dino_avatar} size={40}/>
                </h3>
            </div>
        </div>
    )
}
