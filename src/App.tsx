import React, { useState } from 'react';

interface MetricData {
  title: string;
  value: string;
  description: string;
  insight: string;
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

interface InfoDefinition {
  term: string;
  definition: string;
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<InfoDefinition | null>(null);
  const [expandedSubData, setExpandedSubData] = useState<{[key: string]: boolean}>({});

  const toggleSubData = (metricTitle: string) => {
    setExpandedSubData(prev => ({
      ...prev,
      [metricTitle]: !prev[metricTitle]
    }));
  };

  const infoDefinitions: InfoDefinition[] = [
    { term: "Total Users", definition: "All-time registered users since platform launch. Represents the complete user base across all platform versions and environments. Used as the primary growth metric for overall platform adoption." },
    { term: "Monthly Growth Rate", definition: "New user acquisition rate in last 30 days. Percentage increase in user registrations over a rolling 30-day period, indicating platform momentum. Calculated as new users divided by existing base." },
    { term: "Messages per Core User", definition: "Messages per user metric, showing depth of participation per user. Average lifetime messages sent per core user in the controlled environment. Indicates engagement density beyond surface-level activity." },
    { term: "Monthly Message Volume", definition: "Total messages sent across all users in the last 30 days. Indicates overall platform engagement and communication activity levels. Primary measure of active platform usage." },
    { term: "Match Loop Engagement", definition: "Users actively participating in connection requests and responses. Core product cycle where users receive, evaluate, and respond to potential connections. Represents engaged user behavior." },
    { term: "Monthly Active Users", definition: "User who sends at least one text within a rolling 30-day window. Primary engagement metric for sustained platform participation. Standard industry measure for active usage." },
    { term: "WAU/MAU Ratio", definition: "Stickiness measure — proportion of monthly users also active weekly. User who sends at least one text within a rolling 7-day window divided by MAU. Higher ratios indicate better retention." },
    { term: "DAU/MAU Ratio", definition: "Stickiness measure — proportion of monthly users also active daily. User who sends at least one text within a rolling 1-day window divided by MAU. Key metric for daily engagement patterns." },
    { term: "Web Funnel Completion", definition: "Combined onboarding flow via the web landing page and the text FSM funnel. Overall conversion rate from initial landing page visit to account completion. Measures onboarding effectiveness." },
    { term: "Text Onboarding (FSM)", definition: "Text onboarding state machine used to guide users before they complete onboarding. Progression: pre-prompt sent → profile edit → completion (first accept or request). Finite State Machine approach." },
    { term: "First Match Acceptance", definition: "User opt-in to confirm a match. Acceptance rate for users' very first match presentation, indicating AI matching quality and trust moat creation. Critical validation metric." },
    { term: "Day 7 Retention", definition: "Percentage of users still active 7 days since first activity. Users returning after one week, following real-life texting cadence rather than dopamine loops. Key retention benchmark." },
    { term: "Cohort Analysis", definition: "Flat method (point-in-time activity vs original cohort size). Retention tracking for specific user groups over defined time periods. Measures long-term user engagement patterns." },
    { term: "Average User Age", definition: "Mean age across all active users in the platform. Demographic indicator for target market alignment with Gen Z founders, interns, and early graduates. ICP validation metric." },
    { term: "Press Coverage", definition: "External reach tracked across media coverage and platform analytics. Media mentions and impressions across major publications and social platforms. Brand awareness and distribution metric." },
    { term: "Recent Match Acceptance Trends", definition: "Network-wide acceptance rate calculated across initiators and recipients once a match is presented. Weekly acceptance patterns showing experimental pulses and provider constraints. Real-time engagement indicator." },
    { term: "MAU", definition: "User who sends at least one text within a rolling 30-day window." },
    { term: "WAU", definition: "User who sends at least one text within a rolling 7-day window." },
    { term: "DAU", definition: "User who sends at least one text within a rolling 1-day window." },
    { term: "Core Users", definition: "Users active in the v3–v4 environment (first public beta onward). Used as denominator for messages per user." },
    { term: "FSM", definition: "Text onboarding state machine used to guide users before they complete onboarding." },
    { term: "Match Loop", definition: "Users actively participating in connection requests and responses." },
    { term: "Trust Moat", definition: "AI matchmaking creates significant competitive advantage through high acceptance rates and user confidence." },
    { term: "Text-native", definition: "Platform designed around text messaging as primary interface, not passive-scroll feeds." },
    { term: "ICP", definition: "Initial demographic base: top-50 universities, Gen Z students, founders, interns, early grads, and alumni." },
    { term: "K-factor", definition: "Viral coefficient measuring how many new users each existing user brings to the platform." },
    { term: "Engagement Density", definition: "Messages per user metric, showing depth of participation per user." }
  ];

  const data: CategoryData[] = [
    {
      title: "Growth",
      metrics: [
        {
          title: "Total Users",
          value: "28,561",
          description: "Total registrations",
          insight: "28,561 total users across all platform versions. Series has grown from early testing to current production environment with strong user base foundation.",
          expandedData: [
            { label: "v1-3.5 Beta Users", value: "18,538", description: "Early beta registrations" },
            { label: "Core Users (v3-v3.5)", value: "7,117", description: "Current active" },
            { label: "New Users (30d)", value: "2,431", description: "Recent registrations" },
            { label: "Waitlist", value: "5,023", description: "Alumni/non.edu" }
          ]
        },
        {
          title: "This Month's New Users",
          value: "2,438",
          description: "Last 30 Days",
          insight: "",
          expandedData: [
            { label: "New Users (30d)", value: "2,438", description: "Recent signups" },
            { label: "Monthly Average", value: "2,375", description: "Long-term average" },
            { label: "Matches Received When Requested", value: "1,823", description: "Curr avg. response = 2.2 days" },
            { label: "Match Requesters", value: "1,277", description: "Users asking for matches" }
          ]
        },
        {
          title: "Skeleton Profiles",
          value: "330,000",
          description: "Enriched -> Latently Engaged",
          insight: ""
        }
      ]
    },
    {
      title: "Engagement",
      metrics: [
        {
          title: "Messages per Core User",
          value: "97",
          description: "Message activity",
          insight: "97 messages per user shows people actively use Series for conversations. Users send meaningful messages rather than quick interactions.",
          expandedData: [
            { label: "Total Messages", value: "691,428", description: "All messages sent" },
            { label: "Core Users", value: "7,117", description: "Current users" },
            { label: "Monthly Rate", value: "25.3", description: "Recent activity" }
          ]
        },
        {
          title: "Monthly Message Volume",
          value: "43,745",
          description: "Recent messages",
          insight: "43,745 messages sent last month. Series users communicate regularly, showing the platform facilitates real conversations.",
          expandedData: [
            { label: "Last Month Messages", value: "43,745", description: "Monthly total" },
            { label: "Active Users", value: "1,726", description: "Messaging users" },
            { label: "Per User Rate", value: "25.3", description: "Individual activity" }
          ]
        },
        {
          title: "Recent Match Acceptance Trends",
          value: "83%",
          description: "Weekly acceptance",
          insight: "Weekly acceptance rates vary from 53-97%. Series matching performance changes based on user activity and system updates.",
          expandedData: [
            { label: "Aug 27-Sep 3", value: "94.4%", description: "187 users accepted" },
            { label: "Sep 3-10", value: "97.7%", description: "85 users accepted" },
            { label: "Sep 10-17", value: "73.5%", description: "86 users accepted" },
            { label: "Overall Average", value: "83%", description: "Generalized acceptance rate" }
          ]
        }
      ]
    },
    {
      title: "Activity",
      metrics: [
        {
          title: "Monthly Active Users",
          value: "2,375",
          description: "Active users",
          insight: "2,375 users active monthly on average. Series maintains consistent engagement with users returning for connections.",
          expandedData: [
            { label: "Match Activity (MAU)", value: "2,651", description: "Monthly match participants" },
            { label: "Weekly Active Users", value: "498", description: "Weekly messagers" },
            { label: "Daily Active Users", value: "114", description: "Daily messagers" }
          ]
        },
        {
          title: "WAU/MAU Ratio",
          value: "21%",
          description: "Weekly engagement",
          insight: "21% of monthly users return weekly. Series users come back regularly rather than using it once and leaving."
        },
        {
          title: "DAU/MAU Ratio",
          value: "4.8%",
          description: "Daily engagement",
          insight: "4.8% of monthly users active daily. Series users engage intentionally for connections rather than daily browsing.",
          expandedData: [
            { label: "Daily Active Users", value: "114", description: "Daily users" },
            { label: "Daily Match Activity", value: "121", description: "Daily match participants" },
            { label: "Usage Pattern", value: "Intentional", description: "Purpose-driven" }
          ]
        }
      ]
    },
    {
      title: "Conversion",
      metrics: [
        {
          title: "Web Funnel Completion",
          value: "10%",
          description: "Signup completion",
          insight: "10% of website visitors complete signup. Series converts visitors through clear onboarding steps.",
          expandedData: [
            { label: "Landings", value: "18,488", description: "Website visits" },
            { label: "Signups", value: "6,689", description: "Started signup" },
            { label: "Continues", value: "2,907", description: "Continued process" },
            { label: "Completions", value: "1,815", description: "Finished signup" }
          ]
        },
        {
          title: "Text Onboarding (FSM)",
          value: "65%",
          description: "Text setup completion",
          insight: "65% complete text onboarding. Series guides new users through setup via messaging before they start matching.",
          expandedData: [
            { label: "Start Rate", value: "100%", description: "Pre Prompt Sent" },
            { label: "Profile Edit", value: "84%", description: "Add details" },
            { label: "Completion", value: "65%", description: "Post Edit" }
          ]
        },
        {
          title: "First Match Acceptance",
          value: "83.9%",
          description: "First match success",
          insight: "83.9% accept their first match. Series' matching system creates good first impressions for new users.",
          expandedData: [
            { label: "Aug 27-Sep 3", value: "94.4%", description: "187 users accepted" },
            { label: "Sep 3-10", value: "97.7%", description: "85 users accepted" },
            { label: "Sep 10-17", value: "73.5%", description: "86 users accepted" },
            { label: "Overall Average", value: "83%", description: "Generalized acceptance rate" }
          ]
        }
      ]
    },
    {
      title: "Retention",
      metrics: [
        {
          title: "D7 Retention (flat)",
          value: "42%",
          description: "Weekly return rate",
          insight: "42% return after one week for core user group from v3.5 and post. Series users come back when they want to connect, not from habit or notifications.",
          expandedData: [
            { label: "Day 1", value: "31%", description: "Next day" },
            { label: "Day 7", value: "42%", description: "One week" },
            { label: "Day 30 Retention", value: "2.9%", description: "One month" }
          ]
        }
      ]
    },
    {
      title: "Demographics",
      metrics: [
        {
          title: "Average User Age",
          value: "23.6",
          description: "User age",
          insight: "Average age is 23.6 years. Series attracts college students and recent graduates who are building careers and connections.",
          expandedData: [
            { label: "Average Age", value: "23.6", description: "Mean age" },
            { label: "University Students", value: "650+", description: "College users" },
            { label: "Primary Users", value: "Gen Z", description: "Young professionals" }
          ]
        }
      ]
    },
    {
      title: "Distribution",
      metrics: [
        {
          title: "Press Coverage",
          value: "200+",
          description: "Media mentions",
          insight: "",
          expandedData: [
            { label: "Press Mentions", value: "200+", description: "Media coverage" },
            { label: "Total Impressions", value: "350M+", description: "Reach" },
            { label: "Site Visits", value: "2.3M", description: "Website traffic" }
          ]
        }
      ]
    },
  ];

  const handleDefinitionClick = (title: string) => {
    const definition = infoDefinitions.find(def => def.term === title);
    if (definition) {
      setSelectedDefinition(definition);
    }
  };

  const closeDefinitionModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedDefinition(null);
    }
  };

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
          <p className="text-sm font-light text-gray-600 italic">Prod metrics</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((category) => (
              <div
                key={category.title}
                onClick={() => setSelectedCategory(category.title)}
                className="bg-white border-2 border-black rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <h3 className="text-xl font-light text-black">
                  {category.title}
                </h3>
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
            className="bg-white border border-black rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-light text-black">{selectedCategory}</h2>
            </div>
            
            <div className="space-y-6">
              {data.find(c => c.title === selectedCategory)?.metrics.map((metric) => (
                <div 
                  key={metric.title} 
                  className="bg-white border border-black rounded-xl p-6"
                >
                  <div className="space-y-4">
                    {/* Metric Title */}
                    <div className="mb-4">
                      <h3 
                        className="text-lg font-bold text-black cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleDefinitionClick(metric.title)}
                      >
                        {metric.title}
                      </h3>
                    </div>
                    
                    {/* Main Value */}
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-black">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metric.description}
                      </div>
                    </div>

                    {/* Insight */}
                    <div className="space-y-2">
                      <div className="text-gray-700 leading-relaxed">
                        {metric.insight}
                      </div>
                    </div>

                    {/* Expanded Data */}
                    {metric.expandedData && (
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleSubData(metric.title)}
                          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span className={`transform transition-transform ${expandedSubData[metric.title] ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {expandedSubData[metric.title] && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {metric.expandedData.map((item, idx) => (
                              <div key={idx} className="bg-gray-25 border border-black rounded-lg p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-black">{item.label}</div>
                                  </div>
                                  <div className="text-lg font-bold text-black">
                                    {item.value}
                                  </div>
                                  {item.description && (
                                    <div className="text-sm text-gray-600">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
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

      {/* Definition Modal */}
      {selectedDefinition && (
        <div 
          className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-[9999]"
          onClick={closeDefinitionModal}
        >
          <div 
            className="bg-white border border-black rounded-lg p-4 max-w-sm w-full shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <h3 className="text-base font-bold text-black">{selectedDefinition.term}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedDefinition.definition}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;