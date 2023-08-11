export default function SelectOrg({setOrg}) {
    const orgs = [
        'MONUM',
        'Arts and Culture',
        'Community Engagement',
        'Communications',
        'Economic Opportunity and Inclusion',
        'Environment, Energy, and Open Space',
        'Equity and Inclusion',
        'Finance',
        'Human Services',
        'Housing and Neighborhood Development',
        'Mayor Office',
        'Operations',
        'People Operations',
        'Policy and Planning',
        'Public Health',
        'Schools',
        'Streets',
        'Non-mayoral Departments',
        'Public Safety'
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