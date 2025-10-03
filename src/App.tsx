import { useState } from 'react';

interface AppProps {
  onLogout?: () => void;
}

interface MetricData {
  title: string;
  value: string;
  description?: string;
  insight?: string;
  expandedData?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

interface CategoryData {
  title: string;
  metrics: MetricData[];
}

function App({ onLogout }: AppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSubData, setExpandedSubData] = useState<{ [key: string]: boolean }>({});

  const toggleSubData = (metricTitle: string) => {
    setExpandedSubData((prev) => ({
      ...prev,
      [metricTitle]: !prev[metricTitle],
    }));
  };

  const data: CategoryData[] = [
    {
      title: 'Onboarding',
      metrics: [
        {
          title: 'Why they try Series',
          value: '1.5M',
          description: 'Website Visits (all-time)',
          insight:
            "Since the announcement of our pre-seed round we’ve garnered significant attention. We presume that around 5–10% of this viewage came from college entrepreneurs — our initial ICP.",
          expandedData: [
            { label: 'Avg CTA Click-Through Rate', value: '~40%', description: '10x most marketplace CTA benchmarks (2–5%)' },
            { label: 'Page View (1)', value: '100%', description: '22,925 visits to our website last month' },
            { label: 'Button Click CTA (2)', value: '36.11%', description: '8,279 individuals last month clicked on our CTA from step (1)' },
            { label: 'Modal Submission (3)', value: '16.1%', description: '3,692 individuals last month inputted their information on our modal and submitted it' },
            { label: 'Registered User (4)', value: '10%', description: '2,293 individuals last month opened iMessage after (3) and texted their AI Friend' },
          ],
        },
      ],
    },
  ];

  const closeCategoryModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-light">Data Room</h1>
          <div className="flex items-center gap-4 text-sm font-light text-gray-600">
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-gray-700 hover:text-black no-underline"
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((category) => (
              <div
                key={category.title}
                onClick={() => setSelectedCategory(category.title)}
                className="bg-white border-2 border-black rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <h3 className="text-xl font-light text-black">{category.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50"
          onClick={closeCategoryModal}
        >
          <div
            className="bg-white border border-black rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-light text-black">{selectedCategory}</h2>
              <div className="flex items-center gap-2"></div>
            </div>

            <div className="space-y-6">
              {data
                .find((c) => c.title === selectedCategory)
                ?.metrics.map((metric) => (
                  <div key={metric.title} className="bg-white border border-black rounded-xl p-6">
                    <div className="space-y-4">
                      {/* Metric Title */}
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-black">{metric.title}</h3>
                      </div>

                      {/* Main Value */}
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-black">{metric.value}</div>
                        {metric.description && (
                          <div className="text-sm text-gray-600">{metric.description}</div>
                        )}
                      </div>

                      {/* Insight */}
                      {metric.insight && (
                        <div className="space-y-2">
                          <div className="text-gray-700 leading-relaxed">{metric.insight}</div>
                        </div>
                      )}

                      {/* Expanded Data */}
                      {metric.expandedData && (
                        <div className="space-y-3">
                          <button
                            onClick={() => toggleSubData(metric.title)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <span
                              className={`transform transition-transform ${expandedSubData[metric.title] ? 'rotate-180' : ''}`}
                            >
                              ▼
                            </span>
                          </button>

                          {expandedSubData[metric.title] && (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {metric.expandedData.map((item, idx) => (
                                  <div key={idx} className="bg-gray-25 border border-black rounded-lg p-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-black">{item.label}</div>
                                      </div>
                                      <div className="text-lg font-bold text-black">{item.value}</div>
                                      {item.description && (
                                        <div className="text-sm text-gray-600">{item.description}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;