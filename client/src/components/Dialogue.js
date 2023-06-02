import Answer from "./Answer";
import Question from "./Question";
import Feedback from "./Feedback";

export default function Dialogue({dialogue, showFeedbackIcons}) {
    return (
        <>
            <div className="mb-3">
                <div className="mb-3">
                    <Question question={dialogue.question}/>
                </div>
                <Answer answer={dialogue.answer}/>
            </div>
            <div className="d-flex justify-content-center">
                {dialogue.answer && 
                showFeedbackIcons && 
                <Feedback dialogue={dialogue}/>}
            </div>
        </>
    )
}
