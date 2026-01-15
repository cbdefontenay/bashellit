export default function ErrorOs({isError}) {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center">
            <h1 className="font-bold font-mono text-2xl text-red-700">
                {isError ? 'Error checking OS' : isError}
            </h1>
        </div>
    )
}