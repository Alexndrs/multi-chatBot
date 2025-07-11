import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ContactPage: React.FC = () => {


    return (
        <div className="px-5 md:px-20 lg:px-30 py-10 relative flex items-center justify-center min-h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-white overflow-hidden">

            <AnimatePresence mode="wait">
                <motion.form
                    onSubmit={() => { }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-0 rounded-lg shadow-xl bg-blue-300/5 border-t-2 border-gray-500/20 space-y-4 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl relative z-10 backdrop-blur-md"
                >
                    <div className='px-12 py-5 mb-0 border-b-3 border-black/20 flex items-center'>
                        <h2 className="text-xl font-bold mb-0 text-center">
                            I'd love to hear from you!
                        </h2>
                    </div>

                    {/* <div className='px-12 py-5 flex flex-col mb-0 bt-0 border-b-3 border-b-black/20 border-t-2 border-t-white/7'>

                        <div>
                            <label className="text-sm mb-5">Say anything you want</label>
                            <textarea
                                placeholder="Your message here..."
                                className="w-full p-2 h-30 max-h-70 my-1 bg-gray-600/20 border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-10 p-2 bg-lime-400 hover:bg-lime-500 border-t-2 border-lime-100/70 rounded transition duration-200 cursor-pointer text-gray-900 font-medium"
                        >
                            Send
                        </button>

                    </div> */}

                    <div className='px-12 py-5 border-t-2 border-white/7'>
                        <p className="text-sm text-gray-400 text-center">
                            You can contact me directly on
                            <a
                                href='https://www.linkedin.com/in/alexandre-drean/'
                                onClick={() => { }}
                                className="text-lime-300 underline ml-1 cursor-pointer hover:text-lime-200 transition duration-200"
                            >
                                Linkedin
                            </a> or at
                            <a
                                href='mailto:alexandred56700@gmail.com'
                                className="text-lime-300 underline ml-1 cursor-pointer hover:text-lime-200 transition duration-200"
                            >
                                alexandred56700@gmail.com
                            </a>
                        </p>
                    </div>
                </motion.form>
            </AnimatePresence>
        </div>
    );
};

export default ContactPage;