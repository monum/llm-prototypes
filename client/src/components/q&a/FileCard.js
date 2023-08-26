import { Button, Card, CardContent, Collapse } from "@mui/material"
import { useState } from "react";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

function Field({field_name, field_content}) {
    return (
        <div className="d-flex">
            <div className="me-2" style={{fontWeight: 'bold'}}>{field_name}</div>
            {field_content.map(c => 
                <div> {c} </div>
            )}
        </div>
    )
}

function Content({content}) {
    const [showContent, setShowContent] = useState(false)
    return (
        <div>
            <div className="d-flex" onClick={() => setShowContent(!showContent)}>
                <div className="" style={{fontWeight: 'bold'}}>Preview</div>
                {showContent ? <ExpandLess /> : <ExpandMore />}
            </div>
            <Collapse in={showContent} timeout="auto" unmountOnExit>
                <Card className="ps-3 pe-3 pt-2 pb-2" variant="outlined" style={{textAlign: 'left', fontSize: '13px'}}>
                    {content}
                </Card>
            </Collapse>
        </div>
    )
}

export default function FileCard({file}) {
    const metadata = file.node.extra_info;
    return (
        <Card className="ps-3 pe-3 pt-2 pb-2 mt-2" variant="outlined" style={{textAlign: 'left'}}>
            {/* {'date': '2023-08-09', 
                'department': '', 
                'filename': 'Fresh Start.pdf', 
                'organization': '',
                'url': "", 
                '@search.score': 1.9620056, 
                '@search.reranker_score': None, 
                '@search.highlights': None, 
                '@search.captions': None} */}
            <div className="d-flex">
                <div className="me-2" style={{fontWeight: 'bold'}}>Filename</div>
                {metadata.filename}
                <a href={metadata.url}> <FileDownloadIcon/> </a>
            </div>
            <Field field_name={"Category"} field_content={[metadata.department]}/>
            <Field field_name={"Organization"} field_content={[metadata.organization]}/>
            <Field field_name={"Date"} field_content={[metadata.date]}/>
            <Field field_name={"Weight"} field_content={[file.score.toFixed(3)]}/>
            <Field field_name={"Relevance"} field_content={[metadata.relevance.toFixed(3)]}/>
            <Content content={file.node.text}/>
        </Card>
    )
}