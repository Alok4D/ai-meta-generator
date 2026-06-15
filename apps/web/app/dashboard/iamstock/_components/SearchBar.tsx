import React from 'react';
import { Search, Loader } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    sessionId: string;
    setSessionId: (value: string) => void;
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
    isLoading,
    onSearch
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
            <div className="flex w-full items-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
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
            
            <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Auth Token:</span>
                <input
                    type="text"
                    placeholder="Paste access_token or keyworder_session to bypass limits"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="text-xs w-[320px] px-3 py-1.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm"
                />
            </div>
        </form>
    );
};
