import {FaFileCode} from "react-icons/fa";
import {useFile} from "../context/FileContext.jsx";

export default function ImportBashFile() {
    const {openFile} = useFile();

    return(
        <>
            <div className="cursor-pointer">
                <button
                    onClick={openFile}
                    title="Open Bash File"
                >
                    <FaFileCode className="text-(--primary) hover:text-(--on-surface) transition-colors" />
                </button>
            </div>
        </>
    )
}