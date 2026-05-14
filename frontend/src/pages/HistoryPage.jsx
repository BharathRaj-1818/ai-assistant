function HistoryPage() {

    const chats =
        JSON.parse(localStorage.getItem("chatHistory")) || [];

    return (

        <div className="flex-1 p-8 overflow-y-auto">

            <h1 className="text-4xl font-bold text-cyan-400 mb-8">
                Chat History
            </h1>

            <div className="space-y-4">

                {chats.length === 0 ? (

                    <div className="text-gray-400">
                        No chat history found.
                    </div>

                ) : (

                    chats.map((chat, index) => (

                        <div
                            key={index}
                            className="
                                bg-white/5
                                border border-white/10
                                rounded-2xl
                                p-5
                            "
                        >
                            <div className="text-cyan-300 font-semibold">
                                {chat.sender}
                            </div>

                            <div className="mt-2 text-gray-200">
                                {chat.text}
                            </div>
                        </div>

                    ))
                )}

            </div>

        </div>
    );
}

export default HistoryPage;