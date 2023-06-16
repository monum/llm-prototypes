import { useState } from "react";
import {toastSuccess, toastWarn} from '../../services/NotificationServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon, TextField } from "@mui/material";
import SelectLabel from "./SelectLabel";

export default function File({setUploadMethod}) {
    const [selectedFile, setSelectedFile] = useState();
	const [isSelected, setIsSelected] = useState(false);
    const [label, setLabel] = useState("")
    const [description, setDescription] = useState("") 

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsSelected(true);
	};

    const handleSubmission = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("label", label);
        formData.append("description", description);

        const response = await fetch("http://localhost:5601/upload/file", {
            mode: "cors",
            method: "POST",
            body: formData,
        });
        console.log(response)
        if (response.status == 200) {
            setSelectedFile(null);
            setIsSelected(false);
            toastSuccess('File uploaded!');
            setUploadMethod("")
        } else {
            toastWarn(`${response.status}: ${response.statusText}`);
        }
        return;
    };
    
    return (
        <div className="bg-light p-2">
            <div className="d-flex">
                <div className="btn" onClick={() => setUploadMethod("")}>
                    <ArrowBackIcon/>
                </div>
                <h2 class="">
                    File upload
                </h2>
            </div>

            <input type="file" name="file" onChange={changeHandler} />

            {isSelected ? (
				<div>
					<p>Filename: {selectedFile.name}</p>
					<p>Filetype: {selectedFile.type}</p>
					<p>Size in bytes: {selectedFile.size / 1000000} MB</p>
					<p>
						lastModifiedDate:{' '}
						{selectedFile.lastModifiedDate.toLocaleDateString()}
					</p>

                    <p>Choose a label:</p>
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
                        <div className="btn btn-primary" onClick={handleSubmission}>Submit</div>
                    </div>
				</div>
			) : (
				<p></p>
			)}
        </div>
    )
}