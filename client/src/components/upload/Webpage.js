import { useState } from "react";
import {toastSuccess, toastWarn} from '../../services/NotificationServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon, IconButton, TextField } from "@mui/material";
import SelectLabel from "./SelectLabel";
import SelectOrg from "./SelectOrg"
import http from "../../services/HttpServices";

export default function Webpage({setUploadMethod}) {
    const [url, setUrl] = useState("");
    const [label, setLabel] = useState("")
    const [org, setOrg] = useState("")
    const [description, setDescription] = useState("") 
    const [waiting, setWaiting] = useState(false);

	const changeHandler = (event) => {
		setUrl(event.target.value);
	};

    const handleSubmission = async () => {
        if (!url) {
            toastWarn("Must specify a url to upload!");
            return;
        }
        if (org === "") {
            toastWarn("File's organization must not be empty!");
            return;
        }
        setWaiting(true);
        const formData = new FormData();
        formData.append("url", url);
        formData.append("label", label);
        formData.append("org", org);
        formData.append("description", description);

        http.post("upload/url", formData)
        .then((res) => {
            setWaiting(false);
            if (res.status == 200) {
                setUrl("");
                toastSuccess("File uploaded!");
            }
            else {
                toastWarn(`${res.status}: ${res.data}`);
            }
        });
    };
    
    return (
        <div className="p-2" >
            <div className="d-flex">
                <IconButton onClick={() => setUploadMethod("")}>
                    <ArrowBackIcon/>
                </IconButton>
            </div>

            {waiting && <div>Uploading url content...</div>}

            {!waiting && 
                <div>
                    <div>Paste url here:</div>
                    <input style={{width:"200px"}} type="text" name="url" onChange={changeHandler} />
                </div>}

            {url !== "" && !waiting && (
				<div className="ms-2 mt-3">
                    <SelectLabel setLabel={setLabel}/>
                    <SelectOrg org={org} setOrg={setOrg}/>
                    <TextField 
                        className="mt-3 mb-3" 
                        id="filled-basic" 
                        label="Description" 
                        variant="filled" 
                        multiline
                        rows={8}
                        onChange={(e) => setDescription(e.target.value)}/>
                    <div>
                        <div className="btn btn-primary" style={{width:"180px"}} onClick={handleSubmission}>Submit</div>
                    </div>
				</div>
			) }
        </div>
    )
}