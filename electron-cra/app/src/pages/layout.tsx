import { Outlet } from "react-router-dom";
import SideTab from "../component/side-tab";
import "./layout.css"

export default function Layout() {
    return (
        <div className="div-body">
            <SideTab />
            <main>
                <Outlet />
            </main>
        </div>
    );
}