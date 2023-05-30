
export default function Sessions({sessions, showSessions, setShowSessions}) {
    return (
        <div className="">
            {showSessions && sessions.map((session) => 
                <div>
                    #session
                </div>
            )}
        </div>
    )
}