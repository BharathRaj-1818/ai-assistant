import { motion } from "framer-motion";

function MessageBubble({
    sender,
    text
}) {

    const isUser = sender === "user";

    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
                isUser ? "justify-end" : "justify-start"
            } mb-4`}
        >

            <div
                className={`
                    max-w-[75%]
                    px-5
                    py-4
                    rounded-3xl
                    backdrop-blur-lg
                    border
                    shadow-xl
                    ${
                        isUser
                        ? "bg-cyan-500/20 border-cyan-400/30"
                        : "bg-white/5 border-white/10"
                    }
                `}
            >
                <div className="whitespace-pre-line">
                    {text}
                </div>
            </div>

        </motion.div>
    );
}

export default MessageBubble;