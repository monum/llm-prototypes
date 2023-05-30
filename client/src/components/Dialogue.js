import Answer from "./Answer";
import Question from "./Question";

export default function Dialogue({dialogue}) {
    return (
        <div className="m-4">
            <div className="">
                <div className="mb-4">
                    <Question question={dialogue.question}/>
                </div>
                <Answer answer={dialogue.answer} />
            </div>
        </div>
    )
}
