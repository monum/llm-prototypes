import { useState } from "react";
import {toastSuccess, toastWarn} from '../../services/NotificationServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon, TextField } from "@mui/material";
import SelectLabel from "./SelectLabel";
import { recordDoc } from "../../services/DocStoreServices";

export default function Wikipedia({setUploadMethod}) {
    const [page, setPage] = useState("");
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("") 

    const handleSubmission = async () => {
        // test wikipedia connection
        if (page === "") {
            toastWarn("Page name cannot be empty!");
            return;
        }
        const page_name = page.split(' ').join('_')
        // const {status} = await fetch("https://en.wikipedia.org/wiki/"+page_name, {
        //     mode: "cors",
        //     method: "GET"
        // });
        // if (status != 200) {
        //     toastWarn('Wikipedia page does not exist!');
        //     return;
        // }
        const formData = new FormData();
        formData.append("page_name", page_name);
        formData.append("label", label);
        formData.append("description", description === "" ? "wikipedia page about"+page : description);
        
        const response = await fetch("http://localhost:5601/upload/wiki", {
            mode: "cors",
            method: "POST",
            body: formData,
        });
        if (response.status == 200) {
            const status = await recordDoc({
                source: "https://en.wikipedia.org/wiki/"+page_name,
                label: label,
                description: description
            })
            if (status == 200) {
                toastSuccess('Page uploaded!');
                setUploadMethod("")
                return;
            }
        } 
        toastWarn(`${response.status}: ${response.statusText}`);
    };
    
    return (
        <>  
            <div className="d-flex">
                <div className="btn" onClick={() => setUploadMethod("")}>
                    <ArrowBackIcon/>
                </div>
                <h2 class="">
                    Wikipedia Page
                </h2>
            </div>
            <TextField label="page name" onChange={(e) => setPage(e.target.value)}/>
            <SelectLabel setLabel={setLabel}/>
            <TextField 
                className="m-3" 
                id="filled-basic" 
                label="Description (optional)" 
                variant="filled" 
                multiline
                rows={8}
                onChange={(e) => setDescription(e.target.value)}/>
            <div>
                <div className="btn btn-primary" onClick={handleSubmission}>Add page</div>
            </div>
        </>
    )
}