export default function SelectLabel({setLabel}) {
    const labels = [
        'Education',
        'Electricity',
        'Environment',
        'Finance',
        'Law',
        'Public Libraries',
        'Public Parks',
        'Public Transportation',
        'Public Utilities',
        'Social Services',
        'Technology',
        'Urban Planning'
    ]
    return (
        <>
            <p>Select a category</p>
            <select onChange={e => setLabel(e.target.value)}>
                {labels.map(label => <option>{label}</option>)}
            </select>
        </>
    )
}