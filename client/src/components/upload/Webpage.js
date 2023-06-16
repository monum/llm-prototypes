import { useState } from "react";
import {toastSuccess, toastWarn} from '../../services/NotificationServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon, TextField } from "@mui/material";
import SelectLabel from "./SelectLabel";

export default function Webpage({setUploadMethod}) {
    const [url, setUrl] = useState("");
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("") 

    const handleSubmission = async () => {
        // test wikipedia connection
        if (url === "") {
            toastWarn("URL name cannot be empty!");
            return;
        }
        // const {status} = await fetch("https://en.wikipedia.org/wiki/"+page_name, {
        //     mode: "cors",
        //     method: "GET"
        // });
        // if (status != 200) {
        //     toastWarn('Wikipedia page does not exist!');
        //     return;
        // }
        const formData = new FormData();
        formData.append("url", url);
        formData.append("label", label);
        formData.append("description", description);
        
        const response = await fetch("http://localhost:5601/upload/url", {
            mode: "cors",
            method: "POST",
            body: formData,
        });

        console.log(response)
        if (response.status == 200) {
            toastSuccess('Page added!');
        } else {
            toastWarn(`${response.status}: ${response.statusText}`);
        }
        return;
    };
    
    return (
        <>  
            <div className="d-flex">
                <div className="btn" onClick={() => setUploadMethod("")}>
                    <ArrowBackIcon/>
                </div>
                <h2 class="">
                    Web Page
                </h2>
            </div>
            <TextField label="URL" onChange={(e) => setUrl(e.target.value)}/>
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