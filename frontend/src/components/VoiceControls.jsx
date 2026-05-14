import { FaMicrophone } from "react-icons/fa";
import { motion } from "framer-motion";

function VoiceControls({ setMessage, handleSend }) {

    const startListening = () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.start();

        recognition.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript;

            setMessage(transcript);

            setTimeout(() => {
                handleSend(transcript);
            }, 500);
        };
    };

    return (

        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={startListening}
            className="
                bg-cyan-500
                hover:bg-cyan-400
                text-black
                p-4
                rounded-2xl
                shadow-lg
                transition
            "
        >
            <FaMicrophone />
        </motion.button>
    );
}

export default VoiceControls;