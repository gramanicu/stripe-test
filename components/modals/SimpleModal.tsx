import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { LegacyRef } from 'react';

export type ModalProps = {
    children?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
};

const Component = React.forwardRef(({ children, isOpen, onClose }: ModalProps, ref: LegacyRef<HTMLDivElement>) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog as="div" ref={ref} className="relative z-10" open={isOpen} onClose={onClose}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            transition: {
                                ease: 'easeOut',
                                duration: 0.5,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            transition: {
                                ease: 'easeIn',
                                duration: 0.25,
                            },
                        }}>
                        <Dialog.Backdrop className={`fixed inset-0 bg-white/25 dark:bg-[#000000]/25 `} />
                    </motion.div>

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.75,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                                ease: 'easeOut',
                                duration: 0.5,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.75,
                            transition: {
                                ease: 'easeIn',
                                duration: 0.25,
                            },
                        }}
                        className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all border border-white text-black dark:text-white bg-transparent">
                                {children}
                            </Dialog.Panel>
                        </div>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
});

Component.displayName = 'SimpleModal';

export default motion(Component);
