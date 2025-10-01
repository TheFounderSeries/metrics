import React, { useState } from 'react';
import SimpleChart from './components/SimpleChart';

interface AppProps {
  onLogout?: () => void;
}

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
  ctaLabel?: string;
  ctaHref?: string;
}

interface CategoryData {
  title: string;
  metrics: MetricData[];
}

interface InfoDefinition {
  term: string;
  definition: string;
}

function App({ onLogout }: AppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<InfoDefinition | null>(null);
  const [expandedSubData, setExpandedSubData] = useState<{[key: string]: boolean}>({});
  const [selectedDeepDive, setSelectedDeepDive] = useState<null | { type: 'matchLoop' | 'dataSources'; timeframe?: string }>(null);
  const [showUseCases, setShowUseCases] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showNorthStar, setShowNorthStar] = useState(false);
  const [showRetentionDefinition, setShowRetentionDefinition] = useState(false);
  const [showRetentionGraph, setShowRetentionGraph] = useState(false);
  const [selectedRetentionDimension, setSelectedRetentionDimension] = useState<'D2' | 'D7' | 'D30'>('D30');

  const toggleSubData = (metricTitle: string) => {
    setExpandedSubData((prev: { [key: string]: boolean }) => ({
      ...prev,
      [metricTitle]: !prev[metricTitle]
    }));
  };

  const infoDefinitions: InfoDefinition[] = [
    { term: "Total Users", definition: "All-time registered users since platform launch. Represents the complete user base across all platform versions and environments. Used as the primary growth metric for overall platform adoption." },
    { term: "Monthly Growth Rate", definition: "New user acquisition rate in last 30 days. Percentage increase in user registrations over a rolling 30-day period, indicating platform momentum. Calculated as new users divided by existing base." },
    { term: "Messages per Active User", definition: "Messages per user metric, showing depth of participation per user. Average lifetime messages sent per active user in the controlled environment. Indicates engagement density beyond surface-level activity." },
    { term: "Monthly Message Volume", definition: "Total messages sent across all users in the last 30 days. Indicates overall platform engagement and communication activity levels. Primary measure of active platform usage." },
    { term: "Match Loop Engagement", definition: "Users actively participating in connection requests and responses. Core product cycle where users receive, evaluate, and respond to potential connections. Represents engaged user behavior." },
    { term: "Monthly Active Users", definition: "User who sends at least one text within a rolling 30-day window. Primary engagement metric for sustained platform participation. Standard industry measure for active usage." },
    { term: "WAU/MAU Ratio", definition: "Stickiness measure — proportion of monthly users also active weekly. User who sends at least one text within a rolling 7-day window divided by MAU. Higher ratios indicate better retention." },
    { term: "DAU/MAU Ratio", definition: "Stickiness measure — proportion of monthly users also active daily. User who sends at least one text within a rolling 1-day window divided by MAU. Key metric for daily engagement patterns." },
    { term: "Web Funnel Completion", definition: "Combined onboarding flow via the web landing page and the text FSM funnel. Overall conversion rate from initial landing page visit to account completion. Measures onboarding effectiveness." },
    { term: "Text Onboarding (FSM)", definition: "Text onboarding state machine used to guide users before they complete onboarding. Progression: pre-prompt sent → profile edit → completion (first accept or request). Finite State Machine approach." },
    { term: "First Match Acceptance", definition: "User opt-in to confirm a match. Acceptance rate for users' very first match presentation, indicating AI matching quality and trust moat creation. Critical validation metric." },
    { term: "Day 7 Retention", definition: "Percentage of users still active 7 days since first activity. Users returning after one week, following real-life texting cadence rather than dopamine loops. Key retention benchmark." },
    { term: "Cohort Analysis", definition: "Rolling method (point-in-time activity and ongoing vs original cohort size). Retention tracking for specific user groups over defined time periods. Measures long-term user engagement patterns." },
    { term: "Average User Age", definition: "Mean age across all active users in the platform. Demographic indicator for target market alignment with Gen Z founders, interns, and early graduates. ICP validation metric." },
    { term: "Press Coverage", definition: "External reach tracked across media coverage and platform analytics. Media mentions and impressions across major publications and social platforms. Brand awareness and distribution metric." },
    { term: "Recent Match Acceptance Trends", definition: "Network-wide acceptance rate calculated across initiators and recipients once a match is presented. Weekly acceptance patterns showing experimental pulses and provider constraints. Real-time engagement indicator." },
    { term: "MAU", definition: "User who sends at least one text within a rolling 30-day window." },
    { term: "WAU", definition: "User who sends at least one text within a rolling 7-day window." },
    { term: "DAU", definition: "User who sends at least one text within a rolling 1-day window." },
    { term: "Active Users", definition: "Users active in the v3–v4 environment (first public beta onward). Used as denominator for messages per user." },
    { term: "FSM", definition: "Text onboarding state machine used to guide users before they complete onboarding." },
    { term: "Match Loop", definition: "Users actively participating in connection requests and responses." },
    { term: "Trust Moat", definition: "AI matchmaking creates significant competitive advantage through high acceptance rates and user confidence." },
    { term: "Text-native", definition: "Platform designed around text messaging as primary interface, not passive-scroll feeds." },
    { term: "ICP", definition: "Initial demographic base: top-50 universities, Gen Z students, founders, interns, early grads, and alumni." },
    { term: "K-factor", definition: "Viral coefficient measuring how many new users each existing user brings to the platform." },
    { term: "Engagement Density", definition: "Messages per user metric, showing depth of participation per user." }
  ];

  // Confidence handling for new deep-dive stats
  const CONFIDENCE_THRESHOLD = 0.25; // omit stats below 25%

  type ConfidenceValue = { label: string; value: number | string; confidence?: number; note?: string };

  // Data Sources Breakdown (Users / Messages by source)
  const dataSourcesBreakdown: {
    users: ConfidenceValue[];
    messages: ConfidenceValue[];
    totals: { usersTotal: number; messagesTotal: number; supabaseUsersCurrent?: number };
  } = {
    users: [
      { label: 'Users from Firestore', value: 2553, confidence: 1 },
      { label: 'Users from Botpress', value: 8979, confidence: 1 },
      { label: 'Waitlist Users', value: 5814, confidence: 1 },
      { label: 'Users from Mongo (V2)', value: 4065, confidence: 1 },
      { label: 'Users from Mongo (V3)', value: 5691, confidence: 1 },
      { label: 'Additional Users from Supabase', value: 1459, confidence: 1 }
    ],
    messages: [
      { label: 'Messages from LoopMessage (excluding GCs)', value: 197740, confidence: 1 },
      { label: 'Estimated Messages from LoopMessage GCs', value: 65913, confidence: 1 },
      { label: 'Messages from Mongo (V2)', value: 110163, confidence: 1 },
      { label: 'Messages from Mongo (V3)', value: 223433, confidence: 1 },
      { label: 'Additional Messages from Supabase', value: 94179, confidence: 1 }
    ],
    totals: { usersTotal: 23561, messagesTotal: 691428, supabaseUsersCurrent: 7150 }
  };

  // Match Loop Deep Dive per timeframe
  type MatchLoopFrame = {
    label: string;
    stats: ConfidenceValue[];
  };

  const matchLoopDeepDive: MatchLoopFrame[] = [
    {
      label: 'All Time (Since V3)',
      stats: [
        { label: '[A] Presented upon request', value: 8178, confidence: 1 },
        { label: '[B] Responded by initiator', value: 1569, confidence: 1 },
        { label: '[C] Accepted when presented', value: 1171, confidence: 1 },
        { label: '[D] Users presented ≥ 1 (ask)', value: 2196, confidence: 1 },
        { label: '[E] Users responded ≥ 1', value: 663, confidence: 1 },
        { label: '[F] Users accepted ≥ 1', value: 492, confidence: 1 },
        { label: '[F/E] Acceptance rate', value: '74.21%', confidence: 1 },
        { label: 'Presented beyond initial', value: 1256, confidence: 1 },
        { label: '[G] Responded beyond initial', value: 542, confidence: 1 },
        { label: '[H] Accepted beyond initial', value: 427, confidence: 1 },
        { label: '[H/G] Beyond-initial acceptance', value: '78.78%', confidence: 1 },
        { label: 'Presented (asked or matched)', value: 2644, confidence: 1 },
        { label: '[I] Responded (either side)', value: 2461, confidence: 1 },
        { label: 'Acceptance (either side)', value: '93.08%', confidence: 1 }
      ]
    },
    {
      label: 'Past 30 days',
      stats: [
        { label: '[A] Presented upon request', value: 5275, confidence: 1 },
        { label: '[B] Responded by initiator', value: 1533, confidence: 1 },
        { label: '[C] Accepted when presented', value: 1142, confidence: 1 },
        { label: '[D] Users presented ≥ 1 (ask)', value: 1369, confidence: 1 },
        { label: '[E] Users responded ≥ 1', value: 653, confidence: 1 },
        { label: '[F] Users accepted ≥ 1', value: 482, confidence: 1 },
        { label: '[F/E] Acceptance rate', value: '73.81%', confidence: 1 },
        { label: 'Presented beyond initial', value: 895, confidence: 1 },
        { label: '[G] Responded beyond initial', value: 534, confidence: 1 },
        { label: '[H] Accepted beyond initial', value: 420, confidence: 1 },
        { label: '[H/G] Beyond-initial acceptance', value: '78.65%', confidence: 1 },
        { label: 'Presented (asked or matched)', value: 2812, confidence: 1 },
        { label: 'Responded (either side)', value: 1735, confidence: 1 },
        { label: 'Accepted (either side)', value: 1560, confidence: 1 },
        { label: 'Acceptance (either side)', value: '89.91%', confidence: 1 }
      ]
    },
    {
      label: '2025-09-10 → 2025-09-17',
      stats: [
        { label: '[A] Presented upon request', value: 618, confidence: 1 },
        { label: '[B] Responded by initiator', value: 289, confidence: 1 },
        { label: '[C] Accepted when presented', value: 145, confidence: 1 },
        { label: '[D] Users presented ≥ 1 (ask)', value: 211, confidence: 1 },
        { label: '[E] Users responded ≥ 1', value: 117, confidence: 1 },
        { label: '[F] Users accepted ≥ 1', value: 86, confidence: 1 },
        { label: '[F/E] Acceptance rate', value: '73.50%', confidence: 1 },
        { label: 'Presented beyond initial', value: 149, confidence: 1 },
        { label: '[G] Responded beyond initial', value: 104, confidence: 1 },
        { label: '[H] Accepted beyond initial', value: 73, confidence: 1 },
        { label: '[H/G] Beyond-initial acceptance', value: '70.19%', confidence: 1 },
        { label: 'Presented (asked or matched)', value: 271, confidence: 1 },
        { label: 'Responded (either side)', value: 234, confidence: 1 },
        { label: 'Acceptance (either side)', value: '86.35%', confidence: 1 }
      ]
    },
    {
      label: '2025-09-03 → 2025-09-10',
      stats: [
        { label: '[A] Presented upon request', value: 1054, confidence: 1 },
        { label: '[B] Responded by initiator', value: 252, confidence: 1 },
        { label: '[C] Accepted when presented', value: 241, confidence: 1 },
        { label: '[D] Users presented ≥ 1 (ask)', value: 288, confidence: 1 },
        { label: '[E] Users responded ≥ 1', value: 87, confidence: 1 },
        { label: '[F] Users accepted ≥ 1', value: 85, confidence: 1 },
        { label: '[F/E] Acceptance rate', value: '97.70%', confidence: 1 },
        { label: 'Presented beyond initial', value: 180, confidence: 1 },
        { label: '[G] Responded beyond initial', value: 76, confidence: 1 },
        { label: '[H] Accepted beyond initial', value: 75, confidence: 1 },
        { label: '[H/G] Beyond-initial acceptance', value: '98.68%', confidence: 1 },
        { label: 'Presented (asked or matched)', value: 638, confidence: 1 },
        { label: 'Responded (either side)', value: 636, confidence: 1 },
        { label: 'Acceptance (either side)', value: '99.69%', confidence: 1 }
      ]
    },
    {
      label: '2025-08-27 → 2025-09-03',
      stats: [
        { label: '[A] Presented upon request', value: 2422, confidence: 1 },
        { label: '[B] Responded by initiator', value: 526, confidence: 1 },
        { label: '[C] Accepted when presented', value: 484, confidence: 1 },
        { label: '[D] Users presented ≥ 1 (ask)', value: 591, confidence: 1 },
        { label: '[E] Users responded ≥ 1', value: 198, confidence: 1 },
        { label: '[F] Users accepted ≥ 1', value: 187, confidence: 1 },
        { label: '[F/E] Acceptance rate', value: '94.44%', confidence: 1 },
        { label: 'Presented beyond initial', value: 418, confidence: 1 },
        { label: '[G] Responded beyond initial', value: 186, confidence: 1 },
        { label: '[H] Accepted beyond initial', value: 175, confidence: 1 },
        { label: '[H/G] Beyond-initial acceptance', value: '94.09%', confidence: 1 },
        { label: 'Presented (asked or matched)', value: 1027, confidence: 1 },
        { label: 'Responded (either side)', value: 1016, confidence: 1 },
        { label: 'Acceptance (either side)', value: '98.93%', confidence: 1 }
      ]
    }
  ];

  const filterByConfidence = (items: ConfidenceValue[]) =>
    items.filter((i) => (i.confidence ?? 1) >= CONFIDENCE_THRESHOLD);

  const data: CategoryData[] = [
    {
      title: "Growth",
      metrics: [
        {
          title: "Total Users",
          value: "23,561",
          description: "",
          insight: "23,561 total users across all platform versions. Series has grown from early testing to current production environment with strong user base foundation.",
          expandedData: [
            { label: "v1-3.5 Beta Users", value: "18,538", description: "Early beta registrations" },
            { label: "Active Users (v3-v3.5)", value: "7,117", description: "Current active" },
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
          description: "Enriched from User Scrapes",
          insight: ""
        }
      ]
    },
    {
      title: "Engagement",
      metrics: [
        {
          title: "North Star Metric",
          value: "12%",
          description: "Percentage of users who achieve ≥1 successful connection by D30.",
          insight: "We forecast 20% to have +2 successful connections by Nov 2025."
        },
        {
          title: "Messages per Active User",
          value: "15.3",
          description: "Message activity",
          insight: "15.3 messages per user shows people actively use Series for conversations. Users send meaningful messages rather than quick interactions.",
          expandedData: [
            { label: "Total Messages", value: "691,428", description: "All messages sent" },
            { label: "Active Users", value: "7,117", description: "Current users" },
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
          value: "1,476",
          description: "Active users",
          insight: "1,476 users active monthly. Series maintains consistent engagement with users returning for connections.",
          expandedData: [
            { label: "Match Activity (MAU)", value: "1,476", description: "Monthly match participants" },
            { label: "Weekly Active Users", value: "339", description: "Weekly messagers" },
            { label: "Daily Active Users", value: "66", description: "Daily messagers" },
            { label: "Recent 7-day DAU", value: "47", description: "Last week avg (mild softness)" }
          ]
        },
        {
          title: "WAU/MAU Ratio",
          value: "23.0%",
          description: "Weekly engagement",
          insight: "23.0% of monthly users return weekly (339/1476). Series users come back regularly rather than using it once and leaving."
        },
        {
          title: "DAU/MAU Ratio",
          value: "4.5%",
          description: "Daily engagement",
          insight: "4.5% of monthly users active daily (66/1476). Series users engage intentionally for connections rather than daily browsing.",
          expandedData: [
            { label: "Daily Active Users", value: "66", description: "30-day avg" },
            { label: "DAU/WAU Ratio", value: "19.5%", description: "Daily/weekly (66/339)" },
            { label: "Recent 7-day DAU", value: "47", description: "Week-over-week softness" }
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
          insight: "10% of website visitors complete signup. (Since v3.5 landing changes)",
          expandedData: [
            { label: "Landings", value: "18,488", description: "Website visits (Sept. 1-21)" },
            { label: "First Click", value: "6,689", description: "Started signup (Sept. 1-21)" },
            { label: "Intermediate Steps (2-4)", value: "2,907", description: "Continued process (Sept. 1-21)" },
            { label: "Completions", value: "1,815", description: "Finished signup (Sept. 1-21)" }
          ]
        },
        {
          title: "Text Onboarding (FSM)",
          value: "65%",
          description: "Text setup completion",
          insight: "65% complete text onboarding (Since v3.5 intro flow changes)",
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
          title: "Retention Averages across all our Cohorts",
          value: "D7 Rolling = 95.51%",
          description: "D7 Rolling",
          insight: "Retention is calculated by the recurrence of new AI friend texts being opened.",
          expandedData: [
            { label: "D1 Rolling", value: "96.63%", description: "1-day return rate" },
            { label: "D7 Rolling", value: "95.51%", description: "7-day return rate" },
            { label: "D30 Rolling", value: "92.85%", description: "30-day return rate" }
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
          value: "+200",
          description: "Media mentions",
          insight: "",
          expandedData: [
            { label: "Press Mentions", value: "+200", description: "Media coverage" },
            { label: "Total Impressions", value: "+350M", description: "Reach" },
            { label: "Site Visits", value: "+1.5M", description: "Website traffic" }
          ]
        }
      ]
    },
    {
      title: "B2B",
      metrics: [
        {
          title: "Projected ARR for 2026",
          value: "$120,000",
          description: "",
          insight: "Based month-to-month quotes in effect January 2026.",
          ctaLabel: "View Demo",
          ctaHref: "https://drive.google.com/file/d/19f8n3rNZ-OqnptEsGcAu0Xlwryn4VIV4/view",
          expandedData: [
            { label: "Enttor.ai", value: "$5,000 MRR (Jan 2026 start)", description: "Sound price point to begin; aiming to replace other CRMs." },
            { label: "Avelis Health (YCW25)", value: "$5,000 MRR (Jan 2026 start)", description: "Competitive for entire team; envision Series as standalone outreach tool post-onboarding." }
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
                <h3 className="text-xl font-light text-black">
                  {category.title}
                </h3>
              </div>
            ))}
            <div
              onClick={() => setShowUseCases(true)}
              className="bg-white border-2 border-black rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <h3 className="text-xl font-light text-black">Use Cases</h3>
            </div>
            <div
              onClick={() => setShowRoadmap(true)}
              className="bg-white border-2 border-black rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <h3 className="text-xl font-light text-black">Roadmap</h3>
            </div>
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
              <div className="flex items-center gap-2">
                {selectedCategory === 'Growth' && (
                  <button
                    onClick={() => setSelectedDeepDive({ type: 'dataSources' })}
                    className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
                  >
                    DB Migrations
                  </button>
                )}
              </div>
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
                        onClick={() => {
                          if (metric.title === 'Retention Averages') {
                            setShowRetentionDefinition(true);
                          } else if (metric.title === 'North Star Metric') {
                            setShowNorthStar(true);
                          } else {
                            handleDefinitionClick(metric.title);
                          }
                        }}
                      >
                        {metric.title}
                      </h3>
                    </div>
                    
                    {/* Main Value */}
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-black">
                        {metric.value}
                      </div>
                      {(metric.description || metric.ctaHref) && (
                        <div className="text-sm text-gray-600">
                        {metric.ctaHref ? (
                          metric.ctaHref === 'northstar' ? (
                            <button
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowNorthStar(true); }}
                              className="text-gray-900 hover:text-gray-700 font-medium underline"
                            >
                              {metric.ctaLabel || 'View Definition'}
                            </button>
                          ) : (
                            <a
                              href={metric.ctaHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-underline"
                            >
                              {metric.ctaLabel || 'View Demo'}
                            </a>
                          )
                        ) : (
                          metric.description
                        )}
                        </div>
                      )}
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

                    {(metric.title === 'Recent Match Acceptance Trends' || metric.title === 'First Match Acceptance') && (
                      <div className="mt-3">
                        <button
                          onClick={() => setSelectedDeepDive({ type: 'matchLoop', timeframe: matchLoopDeepDive[0].label })}
                          className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
                        >
                          Deep Dive: First Match Dynamics
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUseCases && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowUseCases(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowUseCases(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Use Cases</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Use Case 1</h4>
                  <a href="https://tasteful-vicuna-7b3.notion.site/ebd/27f93c5690078042aa0fe116390661f8" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">View</a>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Use Case 2</h4>
                  <a href="https://tasteful-vicuna-7b3.notion.site/ebd/27f93c569007801cb538fd3cf1ae1030" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">View</a>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Use Case 3</h4>
                  <a href="https://tasteful-vicuna-7b3.notion.site/ebd/27f93c569007801e8a42fcc2a56f19db" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">View</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoadmap && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowRoadmap(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRoadmap(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Product Roadmap</h3>
            <p className="text-gray-600 mb-6">What's next for Series</p>
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Q4 2025</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">NSM/Value Add</h5>
                    <ul className="text-sm text-gray-600 leading-relaxed space-y-1 ml-4 list-disc">
                      <li>Seeing our NSM of 12 percent increase to 20 percent by End of Nov</li>
                      <li>Implementing Posts widescale to standardize predictions of retention calculation merit in practice</li>
                      <li>Fine tuning augmentation and fine data handling</li>
                      <li>Running weekly test cohorts (Series Rush) to address ICP product wants</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Maintain Retention (&gt;90 percent)</h5>
                    <ul className="text-sm text-gray-600 leading-relaxed space-y-1 ml-4 list-disc">
                      <li>v3.5 Product Trailer and Kick off Series UGC/College tour</li>
                      <li>Use both as usage pegs as we go into quarter of tech focused hibernation</li>
                      <li>Investing in infra like farm of Linq numbers</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Similarity Graphs/UI</h5>
                    <ul className="text-sm text-gray-600 leading-relaxed space-y-1 ml-4 list-disc">
                      <li>UI/UX changes to web landing, and prompting tonality</li>
                      <li>Big focus: Graph UI and Post prompting and verbage</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">Internal insights network growth, connection quality, and engagement patterns</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Q1 2026</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Series Groups</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">Enable small group introductions for shared interests and activities. Actually get put into multi member group chats, for people needs that don't fit 1 to 1 solutions</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Enterprise Rollout</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">Warm intro automation at scale. See B2B</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Perms Scour</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">Apply and start process to access highly sensitive perms needed for highly contextualized user experiences fed by dense data</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h5 className="font-semibold text-gray-900 mb-2">Feature Review</h5>
                    <ul className="text-sm text-gray-600 leading-relaxed space-y-1 ml-4 list-disc">
                      <li>Large case study of UI/UX for 2025. A quarterly review of product health</li>
                      <li>UI/UX changes to web landing, and prompting tonality</li>
                      <li>Big focus: Graph UI and Post verbage</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Q2 2026</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-600 leading-relaxed">Transition to go-to-market strategy, planning for user growth from 100k to 1M within the calendar year. Focus on scaling infrastructure, optimizing user acquisition channels, and preparing systems for exponential growth.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNorthStar && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowNorthStar(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNorthStar(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">North Star Metric</h3>
            <p className="text-sm text-gray-500 italic leading-relaxed">Signal for product health. Bar must naturally raise over time. Analogous to early Facebook 7 Friend Avg.</p>
            <div className="bg-gray-50 rounded-lg p-6 text-center mt-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">12%</div>
              <div className="text-sm text-gray-600">Current NSM</div>
            </div>
          </div>
        </div>
      )}

      {showRetentionDefinition && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowRetentionDefinition(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRetentionDefinition(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            <div className="mb-6">
              <h3 className="text-gray-900 text-sm font-medium mb-2">How is retention calculated?</h3>
              <p className="text-xs text-gray-600">Retention is calculated by the recurrence of new AI friend texts being opened.</p>
              <p className="text-xs text-gray-500 mt-2">last updated: 08/01</p>
            </div>
            <button onClick={() => setShowRetentionGraph(true)} className="w-full bg-black text-white py-3 px-4 rounded-[40px] hover:bg-gray-800 transition-colors font-medium text-sm">View Graph</button>
          </div>
        </div>
      )}

      {showRetentionGraph && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowRetentionGraph(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-8 relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Beta Launch – v3.5 Beta Launch</h3>
            <p className="text-sm text-gray-600 mb-6">July 11 – September 1, 2025 | {selectedRetentionDimension} Life Cycle | Rolling method</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-gray-900">95.51%</div>
                  <div className="text-sm text-gray-600">{selectedRetentionDimension} Rolling Average Percent</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Cohorts</div>
                  <div className="text-2xl font-semibold text-gray-900">37</div>
                </div>
              </div>
            </div>
            <div className="h-64">
              <SimpleChart
                type="line"
                height={220}
                data={[{ label: '1', value: 95 }, { label: '2', value: 97 }, { label: '3', value: 96 }, { label: '4', value: 95 }, { label: '5', value: 93 }, { label: '6', value: 94 }, { label: '7', value: 92 }]}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">Hiding items with confidence &lt; 25%.</div>
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

      {selectedDeepDive && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-[99999]"
          onClick={() => setSelectedDeepDive(null)}
        >
          <div
            className="bg-white border border-black rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-light text-black">
                {selectedDeepDive.type === 'matchLoop' ? 'Match Loop Deep Dive' : 'DB Migrations'}
              </h3>
              <button
                onClick={() => setSelectedDeepDive(null)}
                className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {selectedDeepDive.type === 'matchLoop' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {matchLoopDeepDive.map((frame) => (
                    <button
                      key={frame.label}
                      onClick={() => setSelectedDeepDive({ type: 'matchLoop', timeframe: frame.label })}
                      className={`text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50 ${selectedDeepDive.timeframe === frame.label ? 'bg-gray-100' : ''}`}
                    >
                      {frame.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filterByConfidence(
                    (matchLoopDeepDive.find((f) => f.label === selectedDeepDive.timeframe) || matchLoopDeepDive[0]).stats
                  ).map((s, idx) => (
                    <div key={idx} className="bg-white border border-black rounded-lg p-4">
                      <div className="text-sm font-bold text-black">{s.label}</div>
                      <div className="text-lg font-bold text-black mt-1">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                      {s.note && <div className="text-xs text-gray-600 mt-1">{s.note}</div>}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">Hiding items with confidence &lt; {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%.</div>
              </div>
            )}

            {selectedDeepDive.type === 'dataSources' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-black mb-2">Users by Source</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filterByConfidence(dataSourcesBreakdown.users).map((u, idx) => (
                      <div key={idx} className="bg-white border border-black rounded-lg p-4">
                        <div className="text-sm font-bold text-black">{u.label}</div>
                        <div className="text-lg font-bold text-black mt-1">{typeof u.value === 'number' ? u.value.toLocaleString() : u.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black mb-2">Messages by Source</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filterByConfidence(dataSourcesBreakdown.messages).map((m, idx) => (
                      <div key={idx} className="bg-white border border-black rounded-lg p-4">
                        <div className="text-sm font-bold text-black">{m.label}</div>
                        <div className="text-lg font-bold text-black mt-1">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white border border-black rounded-lg p-4">
                    <div className="text-sm font-bold text-black">Total Users</div>
                    <div className="text-lg font-bold text-black mt-1">{dataSourcesBreakdown.totals.usersTotal.toLocaleString()}</div>
                  </div>
                  <div className="bg-white border border-black rounded-lg p-4">
                    <div className="text-sm font-bold text-black">Total Messages</div>
                    <div className="text-lg font-bold text-black mt-1">{dataSourcesBreakdown.totals.messagesTotal.toLocaleString()}</div>
                  </div>
                  <div className="bg-white border border-black rounded-lg p-4">
                    <div className="text-sm font-bold text-black">Current in Supabase (Users)</div>
                    <div className="text-lg font-bold text-black mt-1">{(dataSourcesBreakdown.totals.supabaseUsersCurrent || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Hiding items with confidence &lt; {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;