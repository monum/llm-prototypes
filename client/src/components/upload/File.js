import { useState } from "react";
import {toastSuccess, toastWarn} from '../../services/NotificationServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon, IconButton, TextField } from "@mui/material";
import SelectLabel from "./SelectLabel";
import SelectOrg from "./SelectOrg"
import http from "../../services/HttpServices";

export default function File({setUploadMethod}) {
    const [selectedFile, setSelectedFile] = useState();
	const [isSelected, setIsSelected] = useState(false);
    const [label, setLabel] = useState("")
    const [org, setOrg] = useState("")
    const [description, setDescription] = useState("") 
    const [waiting, setWaiting] = useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsSelected(true);
	};

    const handleSubmission = async () => {
        if (!selectedFile) {
            toastWarn("Must select a file to upload!");
            return;
        }
        if (org === "") {
            toastWarn("File's organization must not be empty!");
            return;
        }
        setWaiting(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("label", label);
        formData.append("org", org);
        formData.append("description", description);
        
        http.post("upload/file", formData)
        .then((res) => {
            setWaiting(false);
            if (res.status == 200) {
                setIsSelected(false);
                toastSuccess("File uploaded!");
            }
            else {
                toastWarn(`${res.status}: ${res.data}`);
            }
        });
        // const response = await fetch("http://localhost:5601/upload/file", {
        //     mode: "cors",
        //     method: "POST",
        //     body: formData,
        // });
    };
    
    return (
        <div className="p-2" >
            <div className="d-flex">
                <IconButton onClick={() => setUploadMethod("")}>
                    <ArrowBackIcon/>
                </IconButton>
            </div>

            {waiting && <div>Uploading file...</div>}

            {!waiting && <input style={{width:"100px"}} type="file" name="file" onChange={changeHandler} />}

            {isSelected && !waiting && (
				<div className="ms-2 mt-3">
					<p style={{width:"200px"}}>Filename: {selectedFile.name}</p>
					<p style={{width:"200px"}}>Filetype: {selectedFile.type}</p>
					<p>Size in bytes: {(selectedFile.size / 1000000).toFixed(2)} MB</p>
					<p>
						Last modified date:{' '}
						{selectedFile.lastModifiedDate.toLocaleDateString()}
					</p>

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