import { invoke } from "@tauri-apps/api/core";

export async function checkOsData({ setCheckOsInfo, setIsError }) {
    try {
        const osName = await invoke("check_os_info");
        setCheckOsInfo(osName);

        if (osName.toLowerCase() !== "linux") {
            setIsError("You need to run the app on Linux...");
            setCheckOsInfo("");
        } else if (osName.toLowerCase() === "windows") {
            setIsError("You are not running the app on Linux, try to install Linux and have fun!");
        } else {
            setIsError("")
        }
    } catch (error) {
        setIsError(`Error checking OS: ${error}`);
    }
}