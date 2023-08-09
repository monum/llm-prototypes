export default function SelectOrg({setOrg}) {
    const orgs = [
        'MONUM'
    ]
    return (
        <>
            <p>Select an organization </p>
            <select onChange={e => setOrg(e.target.value)}>
                {orgs.map(org => <option>{org}</option>)}
            </select>
        </>
    )
}