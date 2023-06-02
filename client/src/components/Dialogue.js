import Answer from "./Answer";
import Question from "./Question";

export default function Dialogue({dialogue}) {
    return (
        <div className="mb-3">
            <div className="mb-3">
                <Question question={dialogue.question}/>
            </div>
            <Answer answer={dialogue.answer} />
        </div>
    )
}
