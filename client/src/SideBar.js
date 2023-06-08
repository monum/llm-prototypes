import { useState } from "react";
import Sessions from "./components/Sessions";
import {toastSuccess, toastWarn} from './services/NotificationServices';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Icon } from "@mui/material";

export default function SideBar({showSessions, setShowSessions}) {
    const [selectedFile, setSelectedFile] = useState();
	const [isSelected, setIsSelected] = useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsSelected(true);
	};

    const handleSubmission = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("filename_as_doc_id", "true");

        const response = await fetch("http://localhost:5601/upload", {
            mode: "cors",
            method: "POST",
            body: formData,
        });
        console.log(response)
        if (response.status == 200) {
            setSelectedFile(null);
            setIsSelected(false);
            toastSuccess('File uploaded!');
        } else {
            toastWarn(`${response.status}: ${response.statusText}`);
        }
        return;
    };
    
    return (
        <div className="bg-light p-3">
            <div className="d-flex">
                <div className="btn" onClick={() => setShowSessions(!showSessions)}>
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