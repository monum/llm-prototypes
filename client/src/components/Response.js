import AvatarIcon from "./Avatar";
import AnswerCard from "./AnswerCard";
import boston_avatar from '../assets/boston_icon.jpg';

export default function Response({response}) {
    return (
            <div className="d-flex">
                <h3>
                    <AvatarIcon img={boston_avatar} size={40}/>
                </h3>
                <div style={{maxWidth: '90%'}}>
                    <AnswerCard response={response}/>
                </div>
        </div>
    )
}