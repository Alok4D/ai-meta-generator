import React, { useState, useEffect } from 'react';
import { Search, Loader, Info, X, Settings } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    sessionId: string;
    setSessionId: (value: string) => void;
    isLimitReached?: boolean;
    isLoading: boolean;
    onSearch: (e?: React.FormEvent) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    sessionId,
    setSessionId,
    isLimitReached,
    isLoading,
    onSearch
}) => {
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        if (isLimitReached) {
            setShowInstructions(true);
        }
    }, [isLimitReached]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 w-full">
                <div className="flex-1 flex items-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <div className="pl-4 pr-2 text-gray-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for works..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-2 py-4 bg-transparent outline-none dark:text-gray-100 placeholder-gray-400"
                    />

                    <div className="border-l border-gray-200 dark:border-gray-700 flex items-center h-full px-3">
                        <span className="text-sm text-gray-500 mr-2">Type:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer py-4"
                        >
                            <option value="any">Any</option>
                            <option value="1">Photo</option>
                            <option value="2">Illustration</option>
                            <option value="3">Vector</option>
                            <option value="4">Video</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isLoading ? <Loader className="animate-spin h-5 w-5" /> : "Search"}
                    </button>
                </div>
                
                {/* Auth Token Input (Right Side) */}
                {!showInstructions ? (
                    <button 
                        type="button" 
                        onClick={() => setShowInstructions(true)}
                        className="px-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center shrink-0"
                        title="Advanced Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                ) : (
                    <div className={`flex items-center gap-2 px-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm transition-colors shrink-0 ${isLimitReached ? 'border-red-300 dark:border-red-800/50' : 'border-gray-200 dark:border-gray-700'}`}>
                        <span className={`text-[11px] font-medium uppercase tracking-wider whitespace-nowrap ${isLimitReached ? 'text-red-700 dark:text-red-400' : 'text-gray-500'}`}>Auth Token:</span>
                        <input
                            type="text"
                            placeholder="Paste access_token..."
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            className="text-xs w-[180px] py-4 bg-transparent outline-none text-gray-700 dark:text-gray-300"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowInstructions(false)} 
                            className={`p-1.5 rounded-full transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`}
                            title="Close settings"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Collapsible Instructions Box */}
            {showInstructions && (
                <div className={`flex flex-col gap-2 px-4 py-3 rounded-xl border transition-colors ${
                    isLimitReached 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                }`}>
                    <div className={`text-[12px] ${
                        isLimitReached ? 'text-red-800 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                        {isLimitReached ? (
                            <span><span className="font-semibold text-red-700 dark:text-red-400">Search Limit Reached!</span> To continue searching, please provide an auth token:</span>
                        ) : (
                            <span className="font-medium text-gray-700 dark:text-gray-300">How to get an Auth Token (optional, to bypass limits):</span>
                        )}
                        <ol className={`list-decimal ml-5 mt-1.5 space-y-1 ${
                            isLimitReached ? 'text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-500'
                        }`}>
                            <li>Go to <a href="https://imstocker.com/en/keyworder" target="_blank" rel="noopener noreferrer" className={`underline hover:text-blue-600 ${isLimitReached ? 'font-medium' : ''}`}>imstocker.com</a> and login.</li>
                            <li>Press <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isLimitReached ? 'bg-red-100 dark:bg-red-800/50' : 'bg-gray-200 dark:bg-gray-700'}`}>F12</kbd> to open Developer Tools, and search for any work on their site.</li>
                            <li>Go to the <strong>Network</strong> tab, click the <code>searchWorks</code> request, and open the <strong>Payload</strong> tab.</li>
                            <li>Copy the full value of your <code>access_token</code> and paste it in the top right box.</li>
                        </ol>
                    </div>
                </div>
            )}
        </form>
    );
};
