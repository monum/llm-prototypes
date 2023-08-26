import {fileCategories} from "../../customizables";

export default function SelectOrg({org, setOrg}) {

    return (
        <>
            <div>File's organization </div>
            <input type="text" value={org} onChange={(e) => setOrg(e.target.value)}/>
        </>
    )
}