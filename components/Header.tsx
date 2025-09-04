
import React, { useState } from 'react';

interface HeaderProps {
    onExport: (format: 'png' | 'jpeg') => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-[#4A4A4A] border-b border-black/30 text-white px-2 py-1 flex items-center text-xs h-8">
            <div className="font-bold mr-4">Ps</div>
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                    className="px-2 py-0.5 hover:bg-blue-600 rounded-sm">
                    File
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full left-0 bg-[#3B3B3B] border border-black/50 rounded-sm shadow-lg mt-1 w-40 z-50">
                        <button onClick={() => { onExport('png'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 hover:bg-blue-600">Export as PNG</button>
                        <button onClick={() => { onExport('jpeg'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 hover:bg-blue-600">Export as JPEG</button>
                    </div>
                )}
            </div>
            <div className="px-2 py-0.5 cursor-default text-gray-400">Edit</div>
            <div className="px-2 py-0.5 cursor-default text-gray-400">Image</div>
            <div className="px-2 py-0.5 cursor-default text-gray-400">Layer</div>
        </header>
    );
};
