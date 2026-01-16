import {useEffect, useState} from "react";
import "./App.css";
import {checkOsData} from "./Data/MainPageData.jsx";
import ErrorOs from "./components/ErrorOs.jsx";

function App() {
    const [checkOsInfo, setCheckOsInfo] = useState("");
    const [isError, setIsError] = useState("");

    async function checkOs() {
        await checkOsData({setCheckOsInfo, setIsError});
    }

    useEffect(() => {
        checkOs();
    }, []);

    return (
        <main className="">
            {isError && <ErrorOs isError={isError}/>}
            {checkOsInfo && <h1>{checkOsInfo}</h1>}
        </main>
    );
}

export default App;