import Sessions from "./components/Sessions";

export default function SideBar({showSessions, setShowSessions}) {
    return (
        <div className="bg-light d-flex">
            <h2 class="">
                Past sessions
            </h2>
            <div class='btn btn-sm' onClick={() => setShowSessions(!showSessions)}>{'<'}</div>
            <Sessions sessions={[]}/>
        </div>
    )
}