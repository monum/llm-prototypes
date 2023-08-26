import customs from "../../customizables";

export default function SelectLabel({setLabel}) {
    const labels = customs.fileCategories;
    return (
        <div className="mb-2">
            <div>Select a category</div>
            <select style={{width:"150px"}} onChange={e => setLabel(e.target.value)}>
                {labels.map(label => <option>{label}</option>)}
            </select>
        </div>
    )
}