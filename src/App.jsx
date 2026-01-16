import { useEffect, useState } from "react";
import "./App.css";
import { checkOsData } from "./Data/MainPageData.jsx";
import ErrorOs from "./components/ErrorOs.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Editor from "./components/Editor.jsx";

function App() {
    const [checkOsInfo, setCheckOsInfo] = useState("");
    const [isError, setIsError] = useState("");

    async function checkOs() {
        await checkOsData({ setCheckOsInfo, setIsError });
    }

    useEffect(() => {
        checkOs();
    }, []);

    return (
        <main className="h-screen">
            {isError && <ErrorOs isError={isError} />}
            {checkOsInfo && (
                <div className="flex h-full">
                    <div className="">
                        <Sidebar />
                    </div>
                    <Editor />
                </div>
            )}
        </main>
    );
}

export default App;