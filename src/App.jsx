import {useEffect, useState} from "react";
import "./App.css";
import {checkOsData} from "./Data/MainPageData.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Editor from "./components/Editor.jsx";
import UpperTabBar from "./components/UpperTabBar.jsx";
import {ThemeProvider} from "./context/ThemeContext.jsx";
import {FileProvider} from "./context/FileContext.jsx";
import ErrorOs from "./components/ErrorOs.jsx";

function App() {
    const [checkOsInfo, setCheckOsInfo] = useState("");
    const [isError, setIsError] = useState("");
    const [isResizing, setIsResizing] = useState(false);

    async function checkOs() {
        await checkOsData({setCheckOsInfo, setIsError});
    }

    // useEffect(() => {
    //     checkOs();
    // }, []);

    return (
        <ThemeProvider>
            <FileProvider>
                <main className="h-screen flex flex-col">
                    {/*{isError && <ErrorOs isError={isError}/>}*/}
                    {/*{checkOsInfo && (*/}
                    <>
                        <UpperTabBar/>

                        <div className="flex flex-1 overflow-hidden">
                            <Sidebar onResizeStateChange={setIsResizing}/>
                            <Editor isResizing={isResizing}/>
                        </div>
                    </>
                    {/*)}*/}
                </main>
            </FileProvider>
        </ThemeProvider>
    );
}

export default App;