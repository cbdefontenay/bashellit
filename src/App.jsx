import { useEffect, useState } from "react";
import "./App.css";
import { checkOsData } from "./Data/MainPageData.jsx";
import ErrorOs from "./components/ErrorOs.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Editor from "./components/Editor.jsx";
import UpperTabBar from "./components/UpperTabBar.jsx";

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
        <main className="h-screen flex flex-col">
            {isError && <ErrorOs isError={isError} />}
            {checkOsInfo && (
                <>
                    {/* UpperTabBar toujours visible en haut */}
                    <UpperTabBar />

                    {/* Contenu principal */}
                    <div className="flex flex-1 overflow-hidden">
                        <Sidebar />
                        <Editor />
                    </div>
                </>
            )}
        </main>
    );
}

export default App;