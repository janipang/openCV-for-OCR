import { Link } from 'react-router-dom';
import './side-tab.css';
import { useState } from 'react';

export default function SideTab() {
    const [current, setCurrent] = useState<'scanner' | 'backup' | 'template'>('scanner');
    return (
        <>
        <aside>
            <Link 
                to="/" 
                className={current === 'scanner' ? 'current' : undefined} 
                onClick={() => setCurrent('scanner')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M80-720v-200h200v80H160v120H80Zm720 0v-120H680v-80h200v200h-80ZM80-40v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680ZM280-240h400v-480H280v480Zm0 80q-33 0-56.5-23.5T200-240v-480q0-33 23.5-56.5T280-800h400q33 0 56.5 23.5T760-720v480q0 33-23.5 56.5T680-160H280Zm80-400h240v-80H360v80Zm0 120h240v-80H360v80Zm0 120h240v-80H360v80Zm-80 80v-480 480Z" /></svg>
                <p>Scanner</p>
            </Link>
            <Link 
                to="/recent" 
                className={current === 'backup' ? 'current' : undefined} 
                onClick={() => setCurrent('backup')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v226q-19-9-39-14.5t-41-8.5v-203H200v360h168q9 27 30 47t47 28q-3 20-4 40.5t2 40.5q-36-7-67.5-26.5T320-320H200v120h253q7 22 16 42t22 38H200Zm0-80h253-253Zm80-410h400v-80H280v80Zm0 140h237q27-29 60.5-49t72.5-31H280v80ZM800-80q-33 0-56.5-23.5T720-161l-81-49q-9 5-18.5 7.5T600-200q-33 0-56.5-23.5T520-280q0-33 23.5-56.5T600-360q11 0 20.5 2.5T639-350l81-48q0-34 23.5-57.5T800-479q33 0 56.5 23.5T880-399q0 33-23.5 56.5T800-319q-11 0-20.5-2.5T761-329l-81 48v3l81 48q9-5 18.5-7.5T800-240q33 0 56.5 23.5T880-160q0 33-23.5 56.5T800-80Z" /></svg>
                <p>Recent Files</p>
            </Link>
            <Link 
                to="/template" 
                className={current === 'template' ? 'current' : undefined} 
                onClick={() => setCurrent('template')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v226q-19-9-39-14.5t-41-8.5v-203H200v360h168q9 27 30 47t47 28q-3 20-4 40.5t2 40.5q-36-7-67.5-26.5T320-320H200v120h253q7 22 16 42t22 38H200Zm0-80h253-253Zm80-410h400v-80H280v80Zm0 140h237q27-29 60.5-49t72.5-31H280v80ZM800-80q-33 0-56.5-23.5T720-161l-81-49q-9 5-18.5 7.5T600-200q-33 0-56.5-23.5T520-280q0-33 23.5-56.5T600-360q11 0 20.5 2.5T639-350l81-48q0-34 23.5-57.5T800-479q33 0 56.5 23.5T880-399q0 33-23.5 56.5T800-319q-11 0-20.5-2.5T761-329l-81 48v3l81 48q9-5 18.5-7.5T800-240q33 0 56.5 23.5T880-160q0 33-23.5 56.5T800-80Z" /></svg>
                <p>Templates</p>
            </Link>
        </aside>
        </>
    )
}