import { useState, useEffect, useRef } from "react";

import { sendMessage } from "../services/api";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import VoiceControls from "./VoiceControls";

import { FaPaperPlane } from "react-icons/fa";

function ChatBox() {

    // =========================
    // STATES
    // =========================

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const [memory, setMemory] = useState({});

    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);

    // =========================
    // LOAD CHAT HISTORY
    // =========================

    useEffect(() => {

        const savedChats =
            JSON.parse(localStorage.getItem("chatHistory"));

        if (savedChats && savedChats.length > 0) {

            setMessages(savedChats);

        } else {

            const welcomeMessage = {
                sender: "bot",
                text: "Hello BharathRaj, I am NeuroAI. Your intelligent virtual assistant is online.",
                time: new Date().toLocaleTimeString()
            };

            setMessages([welcomeMessage]);

            setTimeout(() => {
                speakResponse(welcomeMessage.text);
            }, 1000);
        }

    }, []);

    useEffect(() => {

        const savedMemory = JSON.parse(localStorage.getItem("ai_memory"));

        if (savedMemory) {
            setMemory(savedMemory);
        }

    }, []);

    // =========================
    // SPEAK RESPONSE
    // =========================

    const speakResponse = (text) => {

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";

        speech.rate = 0.95;

        speech.pitch = 1;

        speech.volume = 1;

        const voices = window.speechSynthesis.getVoices();

        const preferredVoice = voices.find(
            voice =>
                voice.name.includes("Google") ||
                voice.name.includes("Microsoft")
        );

        if (preferredVoice) {
            speech.voice = preferredVoice;
        }

        window.speechSynthesis.speak(speech);
    };

    // =========================
    // SEND MESSAGE
    // =========================

    const handleSend = async (voiceMessage = null) => {

        const finalMessage = voiceMessage || message;
        // simple memory extraction logic
        if (finalMessage.toLowerCase().includes("my name is")) {
            const name = finalMessage.split("my name is")[1]?.trim();

            if (name) {
                const updatedMemory = { ...memory, name };
                setMemory(updatedMemory);
                localStorage.setItem("ai_memory", JSON.stringify(updatedMemory));
            }
        }

        if (!finalMessage.trim()) return;

        if (loading) return;

        const userMessage = {
            sender: "user",
            text: finalMessage,
            time: new Date().toLocaleTimeString()
        };

        const updatedUserMessages = [
            ...messages,
            userMessage
        ];

        setMessages(updatedUserMessages);

        setLoading(true);

        try {

            const data = await sendMessage({
                message: finalMessage,
                memory: memory,
                history: messages.slice(-10)
            });
            if (finalMessage === "/clear") {

                setMessages([]);

                localStorage.removeItem("chatHistory");

                setLoading(false);

                return;
            }
            

            const botMessage = {
                sender: "bot",
                text: data.response,
                time: new Date().toLocaleTimeString()
            };

            const updatedMessages = [
                ...updatedUserMessages,
                botMessage
            ];

            setMessages(updatedMessages);

            // SAVE TO LOCAL STORAGE

            localStorage.setItem(
                "chatHistory",
                JSON.stringify(updatedMessages)
            );

            // SPEAK RESPONSE

            speakResponse(data.response);

        } catch (error) {

            console.error(error);

            const errorMessage = {
                sender: "bot",
                text: "AI server connection failed.",
                time: new Date().toLocaleTimeString()
            };

            setMessages(prev => [
                ...prev,
                errorMessage
            ]);
        }

        setLoading(false);

        setMessage("");
    };

    return (

        <div className="flex flex-col h-screen flex-1 bg-slate-950 text-white">

            {/* HEADER */}

            <div className="p-5 border-b border-slate-700 backdrop-blur-xl">

                <h1 className="text-4xl font-bold text-cyan-400">
                    AI Virtual Assistant
                </h1>

                <p className="text-gray-400 mt-2">
                    Neural Intelligence System
                </p>

            </div>

            {/* CHAT AREA */}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {messages.map((msg, index) => (

                    <MessageBubble
                        key={index}
                        sender={msg.sender}
                        text={msg.text}
                        time={msg.time}
                    />

                ))}

                {loading && <TypingIndicator />}

                <div ref={messagesEndRef}></div>

            </div>
            <div className="px-5 pb-3 flex gap-3 flex-wrap">

                {[
                    "/help",
                    "/plan",
                    "/clear"
                ].map((cmd) => (

                    <button
                        key={cmd}
                        onClick={() => setMessage(cmd)}
                        className="
                bg-white/5
                hover:bg-cyan-500/20
                border
                border-white/10
                px-4
                py-2
                rounded-xl
                text-sm
            "
                    >
                        {cmd}
                    </button>

                ))}

            </div>

            {/* INPUT AREA */}

            <div className="p-5 border-t border-slate-700 backdrop-blur-xl">

                <div className="flex gap-4">

                    {/* INPUT */}

                    <input
                        type="text"
                        placeholder="Ask anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSend();
                            }
                        }}
                        className="
                            flex-1
                            bg-slate-800
                            border
                            border-slate-700
                            rounded-2xl
                            px-5
                            py-4
                            text-white
                            outline-none
                            focus:border-cyan-400
                            transition
                        "
                    />

                    {/* STOP SPEECH */}

                    <button
                        type="button"
                        onClick={() =>
                            window.speechSynthesis.cancel()
                        }
                        className="
                            bg-red-500
                            hover:bg-red-400
                            px-5
                            rounded-2xl
                            text-black
                            font-bold
                            transition
                        "
                    >
                        Stop
                    </button>

                    {/* MIC BUTTON */}

                    <VoiceControls
                        setMessage={setMessage}
                        handleSend={handleSend}
                    />

                    {/* SEND BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            !loading && handleSend()
                        }
                        className="
                            bg-cyan-500
                            hover:bg-cyan-400
                            px-6
                            rounded-2xl
                            text-black
                            font-bold
                            cursor-pointer
                            transition
                            shadow-lg
                        "
                    >
                        <FaPaperPlane />
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ChatBox;