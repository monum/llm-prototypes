import Avatar from "./Avatar";
import TextCard from "./TextCard";
import dino_avatar from '../assets/dino.jpg';

export default function Question({question}) {
    return (
        <div className="d-flex justify-content-end">
            <div className="d-flex">
                <div className="">
                    <TextCard text={question}/>
                </div>
                <h3 className="">
                    <Avatar img={dino_avatar} size={40}/>
                </h3>
            </div>
        </div>
    )
}
