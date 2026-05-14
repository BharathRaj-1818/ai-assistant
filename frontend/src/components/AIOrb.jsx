import { motion } from "framer-motion";

function AIOrb() {

    return (

        <div className="flex justify-center items-center py-6">

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3
                }}
                className="w-28 h-28 rounded-full bg-cyan-400 shadow-[0_0_80px_#22d3ee]"
            />

        </div>
    );
}

export default AIOrb;