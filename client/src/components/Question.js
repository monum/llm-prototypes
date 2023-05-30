import TextCard from "./TextCard";

export default function Question({question}) {
    return (
        <div className="d-flex justify-content-end">
            <div className="d-flex">
                <div className="">
                    <TextCard text={question}/>
                </div>
                <h3 className="ms-4">User</h3>
            </div>
        </div>
    )
}
