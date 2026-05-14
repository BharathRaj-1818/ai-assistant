function SettingsPage() {

    const clearHistory = () => {

        localStorage.removeItem("chatHistory");

        alert("Chat history cleared!");
    };

    return (

        <div className="flex-1 p-8">

            <h1 className="text-4xl font-bold text-cyan-400 mb-8">
                Settings
            </h1>

            <div className="space-y-6">

                <button
                    onClick={clearHistory}
                    className="
                        bg-red-500
                        hover:bg-red-400
                        px-6
                        py-4
                        rounded-2xl
                        font-bold
                    "
                >
                    Clear Chat History
                </button>

            </div>

        </div>
    );
}

export default SettingsPage;