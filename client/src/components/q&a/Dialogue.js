import Response from "./Response";
import Question from "./Question";
import Feedback from "../Feedback";

export default function Dialogue({dialogue, showFeedbackIcons}) {
    return (
        <>
            <div className="mb-3">
                <div className="mb-3">
                    <Question question={dialogue.question}/>
                </div>
                <Response response={dialogue.response}/>
            </div>
            <div className="d-flex justify-content-center">
                {dialogue.response && 
                showFeedbackIcons && 
                <Feedback dialogue={dialogue}/>}
            </div>
        </>
    )
}
