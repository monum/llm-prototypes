const config = require('../config.json');

export const recordDoc = async ({source, label, description}) => {
    const d = new Date();
    const data = {
        fields: {
            Id: "" + d.getTime(),
            Source: source,
            Label: label,
            Description: description
        }
    }
    console.log(data)
    const response = await fetch(`https://api.airtable.com/v0/${config.baseId}/${config.docstoreTableName}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            "Authorization": "Bearer " + config.api_key,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    return response.status
}