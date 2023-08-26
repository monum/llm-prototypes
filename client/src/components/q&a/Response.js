import AvatarIcon from "./Avatar";
import AnswerCard from "./AnswerCard";
import customs from "../../customizables";

export default function Response({response}) {
    return (
            <div className="d-flex">
                <h3>
                    <AvatarIcon img={customs.modelAvatar} size={40}/>
                </h3>
                <div style={{maxWidth: '90%'}}>
                    <AnswerCard response={response}/>
                </div>
        </div>
    )
}