import TextCard from "./TextCard";

export default function Answer({answer}) {
    return (
        <div className="d-flex justify-content-start">
            <div className="d-flex">
                <h3 className="me-4">Bot </h3>
                <div className="col-10">
                    <TextCard text={answer}/>
                </div>
            </div>
        </div>
    )
}