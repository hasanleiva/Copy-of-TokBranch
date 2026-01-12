
import React, { useState, useRef } from 'react';
import { Search, ChevronLeft, X } from 'lucide-react';
import { VideoService } from '../services/mockData';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router';

export const Discover: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Partial<UserProfile>[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim()) {
      const found = await VideoService.searchChannels(val);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full h-full bg-white text-black flex flex-col relative transition-all duration-300">
      {/* Background/Intro State */}
      {!isFocused && query === '' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl mb-6 rotate-12 flex items-center justify-center shadow-sm">
            <Search size={40} className="text-pink-500 -rotate-12" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Discover Channels</h1>
          <p className="text-gray-500 text-sm">Find and follow your favorite storytellers.</p>
        </div>
      )}

      {/* Search Header Container */}
      <div className={`p-4 z-20 w-full transition-all duration-500 ease-in-out ${isFocused || query !== '' ? 'translate-y-0' : 'translate-y-[150px]'}`}>
        <div className="flex items-center gap-3">
          {isFocused && (
            <button onClick={() => { setIsFocused(false); setQuery(''); setResults([]); }} className="text-gray-500 hover:text-black">
              <ChevronLeft size={24} />
            </button>
          )}
          
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search channels..."
              className="w-full bg-gray-100 border border-transparent focus:border-pink-500/30 focus:bg-white rounded-lg py-2.5 pl-10 pr-10 text-black outline-none transition-all shadow-sm"
            />
            {query && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className={`flex-1 overflow-y-auto px-4 pb-20 transition-opacity duration-300 ${isFocused || query !== '' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {results.length > 0 ? (
          <div className="space-y-4 mt-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Channels</h2>
            {results.map((channel) => (
              <div 
                key={channel.id}
                onClick={() => navigate(`/channel/@${channel.username}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer active:scale-[0.98] transition-all border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.username}`} alt="" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">@{channel.username}</p>
                </div>
                <button className="bg-[#fe2c55] text-white px-5 py-1.5 rounded-md text-xs font-bold shadow-sm active:scale-95 transition-transform">
                  View
                </button>
              </div>
            ))}
          </div>
        ) : query && (
          <div className="mt-20 flex flex-col items-center justify-center text-gray-300">
            <Search size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">No channels found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
