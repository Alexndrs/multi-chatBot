import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ContactPage: React.FC = () => {


    return (
        <div className="px-5 md:px-20 lg:px-30 py-10 relative flex items-center justify-center min-h-screen overflow-hidden">

            <AnimatePresence mode="wait">
                <motion.form
                    onSubmit={() => { }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-0 rounded-lg shadow-xl bg-[var(--color-onTop)] border-t-2 border-[var(--color-onTop)] space-y-4 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl relative z-10 backdrop-blur-md"
                >
                    <div className='px-12 py-5 mb-0 border-b-3 border-black/20 flex items-center'>
                        <h1 className="mb-0 text-center">
                            I'd love to hear from you!
                        </h1>
                    </div>

                    <div className='px-12 py-5 border-t-2 border-[var(--color-onTop)]'>
                        <p className="secondaryText text-center">
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