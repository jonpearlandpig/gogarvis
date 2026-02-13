import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Search, X, BookOpen, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CategoryPill = ({ category, isSelected, onClick }) => (
    <button
        className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors duration-100 ${
            isSelected 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
        }`}
        onClick={onClick}
        data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
    >
        {category}
    </button>
);

const TermCard = ({ term }) => (
    <div 
        className="bg-card border border-border p-6 hover:border-primary/50 transition-colors duration-100"
        data-testid={`term-${term.term.toLowerCase().replace(/\s+/g, '-')}`}
    >
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-primary flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-mono text-lg font-bold uppercase tracking-wider">{term.term}</h3>
                    <span className="px-2 py-0.5 bg-secondary font-mono text-[10px] text-muted-foreground tracking-wider border border-border">
                        {term.category}
                    </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{term.definition}</p>
            </div>
        </div>
    </div>
);

const Glossary = () => {
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedCategory !== 'all') params.append('category', selectedCategory);
                if (searchQuery) params.append('search', searchQuery);

                const [termsRes, categoriesRes] = await Promise.all([
                    axios.get(`${API}/glossary?${params.toString()}`),
                    axios.get(`${API}/glossary/categories`)
                ]);

                setTerms(termsRes.data.terms);
                setCategories(categoriesRes.data.categories);
            } catch (error) {
                console.error('Error fetching glossary:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCategory, searchQuery]);

    return (
        <div className="space-y-6" data-testid="glossary-page">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                    CANONICAL GLOSSARY
                </h1>
                <p className="text-muted-foreground font-mono text-sm">
                    Official terminology and definitions for the GARVIS Full Stack
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search terms or definitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border border-border pl-10 pr-10 py-3 font-mono text-sm focus:outline-none focus:border-primary"
                    data-testid="glossary-search-input"
                />
                {searchQuery && (
                    <button 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchQuery('')}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <CategoryPill 
                    category="ALL" 
                    isSelected={selectedCategory === 'all'}
                    onClick={() => setSelectedCategory('all')}
                />
                {categories.map(cat => (
                    <CategoryPill 
                        key={cat}
                        category={cat}
                        isSelected={selectedCategory === cat}
                        onClick={() => setSelectedCategory(cat)}
                    />
                ))}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-muted-foreground tracking-wider">
                    {terms.length} TERMS FOUND
                </div>
                <div className="flex items-center gap-2">
                    <Tag size={12} className="text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground tracking-wider">
                        {categories.length} CATEGORIES
                    </span>
                </div>
            </div>

            {/* Terms List */}
            <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                    {loading ? (
                        <div className="text-center py-12 font-mono text-sm text-muted-foreground animate-pulse">
                            LOADING GLOSSARY...
                        </div>
                    ) : terms.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen size={48} className="text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                            <p className="font-mono text-sm text-muted-foreground">NO TERMS FOUND</p>
                        </div>
                    ) : (
                        terms.map((term, idx) => (
                            <TermCard key={idx} term={term} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default Glossary;
