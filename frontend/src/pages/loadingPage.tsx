import { motion } from "framer-motion";
import LogoIcon from "../components/icons/LogoIcon";

const LoadingPage = () => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-8"
            >
                <span><LogoIcon className="w-15 h-15 text-CTA" /></span> Chatbothub
            </motion.h1>

            <motion.div
                className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-300"
            >
                Connecting... Please wait.
            </motion.p>
        </div>
    );
};

export default LoadingPage;
