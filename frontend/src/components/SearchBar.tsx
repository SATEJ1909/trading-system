import { useState, useEffect, useRef } from 'react';
import { Search, X, Command } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    suggestions?: string[];
    className?: string;
}

export default function SearchBar({
    placeholder = 'Search...',
    onSearch,
    suggestions = [],
    className = ''
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    // Keyboard shortcut (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className={`relative ${className}`}>
            <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder={placeholder}
                    className={`
            w-full h-12 pl-12 pr-20 
            bg-card border-2 border-border 
            rounded-xl text-foreground
            placeholder:text-muted-foreground
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
            transition-all duration-300
            ${isFocused ? 'glass-strong shadow-lg' : ''}
          `}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {query && (
                        <button
                            onClick={handleClear}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                    <div className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && query && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-border overflow-hidden animate-slide-up-fade">
                    <div className="py-2">
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setQuery(suggestion);
                                    onSearch(suggestion);
                                    setShowSuggestions(false);
                                }}
                                className="w-full px-4 py-2.5 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                            >
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
