import React, { useEffect, useState } from 'react';
import { XIcon } from '@phosphor-icons/react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    // Start opening immediately if isOpen changes to true
    if (isOpen && !shouldRender) {
        setShouldRender(true);
        setIsClosing(false);
    }

    // Start closing immediately if isOpen changes to false
    if (!isOpen && shouldRender && !isClosing) {
        setIsClosing(true);
    }

    useEffect(() => {
        // Only handle cleanup after animation
        if (!isOpen && shouldRender) {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-0 md:p-4 bg-black/80 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
                }`}
            onClick={handleClose}
        >
            <div
                className={`w-full h-full md:h-auto md:max-w-md bg-[#252525] border border-[#333] md:rounded-2xl shadow-xl flex flex-col ${isClosing
                    ? 'animate-[slideDown_0.3s_ease-in_forwards]'
                    : 'animate-[slideUp_0.3s_ease-out_forwards]'
                    } md:animate-none`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-6 border-b border-[#333]">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={handleClose}
                        className="text-[#a0a0a0] cursor-pointer hover:text-white transition-colors"
                    >
                        <XIcon size={24} />
                    </button>
                </header>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
