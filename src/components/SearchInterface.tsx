import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Users, MessageCircle, Target, Clock } from 'lucide-react';

interface SearchResult {
  type: 'metric' | 'chart' | 'insight';
  title: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  chartData?: any;
}

const SearchInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const processQuery = async (searchQuery: string) => {
    setIsSearching(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerQuery = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Natural language processing for common queries
    if (lowerQuery.includes('users') || lowerQuery.includes('user growth')) {
      searchResults.push({
        type: 'metric',
        title: 'Total Users (All Time)',
        value: '28,561',
        trend: 'up',
        description: 'Post April public beta. Broad top-of-funnel validation achieved.'
      });
      searchResults.push({
        type: 'metric',
        title: 'Monthly Active Users',
        value: '2,375',
        trend: 'up',
        description: '34% growth in last 30 days. Above early-stage benchmarks.'
      });
    }

    if (lowerQuery.includes('retention') || lowerQuery.includes('engagement')) {
      searchResults.push({
        type: 'insight',
        title: 'Retention Analysis',
        description: 'D1: 31% (benchmark: 30-40%), D7: 42% MAU (benchmark: 20-30%), D30: 14% (benchmark: 10-15%). Strong retention curves indicate product-market fit.'
      });
    }

    if (lowerQuery.includes('messages') || lowerQuery.includes('engagement')) {
      searchResults.push({
        type: 'metric',
        title: 'Total Messages',
        value: '691,428',
        trend: 'up',
        description: 'All-time messages sent. Comparable to Poke at 700k (raised $15M over $100M).'
      });
      searchResults.push({
        type: 'metric',
        title: 'Avg Messages per User',
        value: '97',
        trend: 'up',
        description: 'Above benchmark of ~70/user. Indicates deeper engagement.'
      });
    }

    if (lowerQuery.includes('conversion') || lowerQuery.includes('funnel')) {
      searchResults.push({
        type: 'insight',
        title: 'Funnel Performance',
        description: 'Landing → Signup: 36% (above median), Signup → Continue: 43%, Continue → Account: 62%. 10% total funnel success rate is healthy.'
      });
    }

    if (lowerQuery.includes('match') || lowerQuery.includes('acceptance')) {
      searchResults.push({
        type: 'metric',
        title: 'First-Match Acceptance',
        value: '81%',
        trend: 'up',
        description: 'Industry benchmark <30%. AI matchmaking creates significant trust moat.'
      });
    }

    if (lowerQuery.includes('age') || lowerQuery.includes('demographics')) {
      searchResults.push({
        type: 'insight',
        title: 'User Demographics',
        description: 'Average age: 23.6 years. 72.54% are 18-24 (5,322 users), 20.85% are 25-34 (1,529 users). Prime Gen Z ICP for career-launcher demographic with strong millennial crossover.'
      });
      searchResults.push({
        type: 'chart',
        title: 'Age Distribution Breakdown',
        description: 'Detailed breakdown: 18-24 (5,322), 25-34 (1,529), 35-44 (400), 45-54 (53), 55-64 (15), 65+ (19). Total: 7,338 users since V3.',
        chartData: [
          { label: '18-24', value: 5322, color: 'bg-blue-500' },
          { label: '25-34', value: 1529, color: 'bg-green-500' },
          { label: '35-44', value: 400, color: 'bg-yellow-500' },
          { label: '45-54', value: 53, color: 'bg-orange-500' },
          { label: '55-64', value: 15, color: 'bg-red-500' },
          { label: '65+', value: 19, color: 'bg-purple-500' }
        ]
      });
    }

    if (searchResults.length === 0) {
      searchResults.push({
        type: 'insight',
        title: 'Quick Overview',
        description: 'Try queries like "user growth", "retention rates", "message engagement", "conversion funnel", or "match acceptance"'
      });
    }

    setResults(searchResults);
    setIsSearching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processQuery(query);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about user growth, retention, engagement, or any metric..."
            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        {isSearching && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    {result.title}
                    {result.trend && getTrendIcon(result.trend)}
                  </h3>
                  {result.value && (
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {result.value}
                    </div>
                  )}
                  {result.description && (
                    <p className="text-gray-300 leading-relaxed">
                      {result.description}
                    </p>
                  )}
                  {result.chartData && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {result.chartData.map((item: any, idx: number) => (
                          <div key={idx} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                              <span className="text-sm font-medium text-white">{item.label}</span>
                            </div>
                            <div className="text-lg font-bold text-blue-400">
                              {item.value.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;