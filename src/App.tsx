import { useEffect, useState } from 'react';

interface AppProps {
  onLogout?: () => void;
  isAdmin?: boolean;
}

interface MetricData {
  title: string;
  value: string;
  description?: string;
  insight?: string;
  ctaText?: string;
  ctaLink?: LinkSpec;
  descriptionLink?: LinkSpec;
  insightLink?: LinkSpec;
  expandedData?: Array<{
    label: string;
    value: string;
    description?: string;
    link?: LinkSpec;
    descriptionLink?: LinkSpec;
  }>;
  link?: LinkSpec;
}

interface LinkSpec {
  type?: 'url' | 'image';
  href?: string;
  imageSrc?: string;
}

interface CategoryData {
  title: string;
  header?: string;
  headerLink?: LinkSpec;
  metrics: MetricData[];
}

function getDefaultData(): CategoryData[] {
  return [
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
}

function App({ onLogout, isAdmin = false }: AppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSubData, setExpandedSubData] = useState<{ [key: string]: boolean }>({});
  const [data, setData] = useState<CategoryData[]>(getDefaultData());
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [undoStack, setUndoStack] = useState<CategoryData[][]>([]);
  const [redoStack, setRedoStack] = useState<CategoryData[][]>([]);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Array<{ version: number; minor?: number; status: string; createdAt?: string; updatedAt?: string }>>([]);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const clone = (d: CategoryData[]): CategoryData[] => JSON.parse(JSON.stringify(d));
  const reorderArray = <T,>(arr: T[], fromIndex: number, toIndex: number): T[] => {
    const next = arr.slice();
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= next.length || toIndex >= next.length) return next;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  };

  const handleImageUpload = async (file: File, onSuccess: (href: string) => void) => {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('https://series-metrics-api-202642739529.us-east1.run.app/api/images', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const body = await res.json();
      const url = `https://series-metrics-api-202642739529.us-east1.run.app/api/images/${body.id}`;
      onSuccess(url);
      setSaveMessage('Image uploaded');
    } catch (e) {
      setSaveMessage('Image upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const toggleSubData = (key: string) => {
    setExpandedSubData((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  // Fetch from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://series-metrics-api-202642739529.us-east1.run.app/api/dataroom');
        if (!res.ok) throw new Error('Failed to fetch');
        const body = await res.json();
        if (body && Array.isArray(body.data)) {
          setData(body.data);
          setHasUnsavedChanges(false);
          setUndoStack([]);
          setRedoStack([]);
          setCurrentVersion(body.version ? body.version : null);
          // Open all dropdowns by default
          const defaults: { [key: string]: boolean } = {};
          body.data.forEach((cat: any) => {
            cat.metrics?.forEach((m: any, idx: number) => {
              defaults[`${cat.title}-${idx}`] = true;
            });
          });
          setExpandedSubData(defaults);
        }
      } catch (e) {
        // Fallback to defaults silently in view
        console.warn('Using default data; failed to fetch from API');
      }
    };
    fetchData();
  }, []);

  // Load revision list on admin/edit
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const res = await fetch('https://series-metrics-api-202642739529.us-east1.run.app/api/revisions');
        if (res.ok) {
          const list = await res.json();
          setRevisions(list);
        }
      } catch {}
    };
    void load();
  }, [isAdmin]);

  const handleSave = async (opts?: { exitEditMode?: boolean }) => {
    // Proxy to draft saving in edit mode
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveDraftRevision();
      setSaveMessage('Saved');
      setHasUnsavedChanges(false);
      if (opts?.exitEditMode) {
        setEditMode(false);
      }
    } catch (e) {
      setSaveMessage('Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const handleToggleEditMode = async () => {
    if (editMode) {
      if (hasUnsavedChanges) {
        const shouldSave = window.confirm('You have unsaved changes. OK to save draft and exit, or Cancel to discard and exit.');
        if (shouldSave) {
          await handleSave({ exitEditMode: true });
        } else {
          // Reload from server to discard local changes
          try {
            const res = await fetch('/api/dataroom');
            if (res.ok) {
              const body = await res.json();
              if (body && Array.isArray(body.data)) {
                setData(body.data);
              }
            }
          } catch {}
          setHasUnsavedChanges(false);
          setEditMode(false);
        }
      } else {
        setEditMode(false);
      }
    } else {
      setEditMode(true);
    }
  };

  const createDraftFromCurrent = async (): Promise<number> => {
    const res = await fetch('https://series-metrics-api-202642739529.us-east1.run.app/api/revisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error('Failed to create draft');
    const body = await res.json();
    setCurrentVersion(body.version);
    setRevisions((r) => [{ version: body.version, status: 'draft' }, ...r]);
    return body.version as number;
  };

  const loadRevision = async (version: number, minor?: number) => {
    if (hasUnsavedChanges && editMode) {
      const ok = window.confirm('Unsaved changes will be lost. Continue?');
      if (!ok) return;
    }
    const res = await fetch(`https://series-metrics-api-202642739529.us-east1.run.app/api/revisions/${version}${minor != null ? `?minor=${minor}` : ''}`);
    if (res.ok) {
      const body = await res.json();
      setData(body.data || []);
      setCurrentVersion(body.version || null);
      setHasUnsavedChanges(false);
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const reloadRevisionList = async () => {
    try {
      const res = await fetch('https://series-metrics-api-202642739529.us-east1.run.app/api/revisions');
      if (res.ok) {
        const list = await res.json();
        setRevisions(list);
      }
    } catch {}
  };

  const saveDraftRevision = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      let version = currentVersion;
      if (version == null) {
        version = await createDraftFromCurrent();
      } else {
        // Ensure we are updating a draft. If currentVersion is published/archived, create a new draft.
        let status: string | undefined = undefined;
        try {
          const revRes = await fetch(`https://series-metrics-api-202642739529.us-east1.run.app/api/revisions/${version}`);
          if (revRes.ok) {
            const rev = await revRes.json();
            status = rev.status;
          }
        } catch {}
        if (status !== 'draft') {
          version = await createDraftFromCurrent();
        } else {
          const res = await fetch(`https://series-metrics-api-202642739529.us-east1.run.app/api/revisions/${version}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
          });
          if (!res.ok) throw new Error('Failed to save draft');
        }
      }
      await reloadRevisionList();
      setHasUnsavedChanges(false);
      setSaveMessage('Saved');
    } catch (e) {
      setSaveMessage('Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const publishRevision = async () => {
    let toPublish = currentVersion;
    if (toPublish == null) {
      toPublish = await createDraftFromCurrent();
    }
    const res = await fetch(`https://series-metrics-api-202642739529.us-east1.run.app/api/publish/${toPublish}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to publish');
    setRevisions((r) => r.map((x) => ({ ...x, status: x.version === toPublish ? 'published' : (x.status === 'published' ? 'archived' : x.status) })));
    setHasUnsavedChanges(false);
  };

  // Autosave (debounced)
  useEffect(() => {
    if (!editMode || !hasUnsavedChanges || isSaving) return;
    const id = setTimeout(() => {
      void saveDraftRevision();
    }, 1500);
    return () => clearTimeout(id);
  }, [data, editMode, hasUnsavedChanges, isSaving]);

  const handleUndo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const nextUndo = [...prev];
      const previousState = nextUndo.pop() as CategoryData[];
      setRedoStack((r) => [...r, clone(data)]);
      setData(previousState);
      setHasUnsavedChanges(true);
      return nextUndo;
    });
  };

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const nextRedo = [...prev];
      const nextState = nextRedo.pop() as CategoryData[];
      setUndoStack((u) => [...u, clone(data)]);
      setData(nextState);
      setHasUnsavedChanges(true);
      return nextRedo;
    });
  };

  const updateMetricField = (
    categoryTitle: string,
    metricTitle: string,
    field: keyof MetricData,
    value: string
  ) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => (m.title === metricTitle ? { ...m, [field]: value } : m)),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const addMetric = (categoryTitle: string) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        const newMetric: MetricData = {
          title: 'New Tile',
          value: '',
          description: '',
          insight: '',
          expandedData: [],
        };
        return { ...cat, metrics: [...cat.metrics, newMetric] };
      })
    );
    setHasUnsavedChanges(true);
  };

  const removeMetric = (categoryTitle: string, metricTitle: string) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.filter((m) => m.title !== metricTitle),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateExpandedItem = (
    categoryTitle: string,
    metricTitle: string,
    index: number,
    field: 'label' | 'value' | 'description',
    value: string
  ) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => {
            if (m.title !== metricTitle) return m;
            const items = m.expandedData ? [...m.expandedData] : [];
            if (!items[index]) return m;
            items[index] = { ...items[index], [field]: value };
            return { ...m, expandedData: items };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateMetricLink = (
    categoryTitle: string,
    metricTitle: string,
    href: string
  ) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) =>
            m.title === metricTitle
              ? { ...m, link: href ? { type: href.startsWith('http') ? 'url' : 'image', href, imageSrc: href } : undefined }
              : m
          ),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateExpandedLink = (
    categoryTitle: string,
    metricTitle: string,
    index: number,
    href: string
  ) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => {
            if (m.title !== metricTitle) return m;
            const items = m.expandedData ? [...m.expandedData] : [];
            if (!items[index]) return m;
            items[index] = {
              ...items[index],
              link: href ? { type: href.startsWith('http') ? 'url' : 'image', href, imageSrc: href } : undefined,
            };
            return { ...m, expandedData: items };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const addCategory = () => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) => [
      ...prev,
      {
        title: 'New Category',
        header: 'New Category',
        metrics: [],
      },
    ]);
    setHasUnsavedChanges(true);
  };

  const removeCategory = (categoryTitle: string) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) => prev.filter((c) => c.title !== categoryTitle));
    if (selectedCategory === categoryTitle) {
      setSelectedCategory(null);
    }
    setHasUnsavedChanges(true);
  };

  const addExpandedItem = (categoryTitle: string, metricTitle: string) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => {
            if (m.title !== metricTitle) return m;
            const items = m.expandedData ? [...m.expandedData] : [];
            items.push({ label: 'New Subtile', value: '', description: '' });
            return { ...m, expandedData: items };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const removeExpandedItem = (categoryTitle: string, metricTitle: string, index: number) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => {
            if (m.title !== metricTitle) return m;
            const items = m.expandedData ? [...m.expandedData] : [];
            if (index < 0 || index >= items.length) return m;
            items.splice(index, 1);
            return { ...m, expandedData: items };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const moveMetric = (categoryTitle: string, fromIndex: number, toIndex: number) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: reorderArray(cat.metrics, fromIndex, toIndex),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const moveExpandedItem = (categoryTitle: string, metricTitle: string, fromIndex: number, toIndex: number) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) =>
      prev.map((cat) => {
        if (cat.title !== categoryTitle) return cat;
        return {
          ...cat,
          metrics: cat.metrics.map((m) => {
            if (m.title !== metricTitle) return m;
            const items = m.expandedData ? reorderArray(m.expandedData, fromIndex, toIndex) : [];
            return { ...m, expandedData: items };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const moveCategory = (fromIndex: number, toIndex: number) => {
    setUndoStack((s) => [...s, clone(data)]);
    setRedoStack([]);
    setData((prev) => reorderArray(prev, fromIndex, toIndex));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-light">Data Room</h1>
          <div className="flex items-center gap-3 text-sm font-light text-gray-600">
            {isAdmin && (
              <>
                <button
                  onClick={handleToggleEditMode}
                  className="text-gray-700 hover:text-black no-underline border border-black rounded-lg px-3 py-1"
                  title={editMode ? 'Switch to view mode' : 'Switch to edit mode'}
                >
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </button>
                {/* Save button removed to avoid duplication with Save Draft */}
                {editMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={undoStack.length === 0}
                      className="text-gray-700 border border-black rounded-lg px-2 py-1 disabled:opacity-60"
                      title="Undo"
                    >
                      Undo
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="text-gray-700 border border-black rounded-lg px-2 py-1 disabled:opacity-60"
                      title="Redo"
                    >
                      Redo
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-black rounded-lg px-2 py-1 text-sm"
                      value={currentVersion ?? ''}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : null;
                        if (v != null) void loadRevision(v);
                      }}
                    >
                      <option value="">Select revision…</option>
                      {revisions.map((r) => (
                        <option key={`${r.version}.${r.minor ?? 0}`} value={r.version}>
                          v{r.version}{r.minor ? `.${r.minor}` : ''} ({r.status})
                        </option>
                      ))}
                    </select>
                    {editMode && (
                      <>
                        <button
                          onClick={() => void saveDraftRevision()}
                          disabled={!hasUnsavedChanges}
                          className="text-gray-700 border border-black rounded-lg px-2 py-1 disabled:opacity-60"
                          title="Save Draft"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={() => void publishRevision()}
                          className="text-white bg-black rounded-lg px-2 py-1"
                          title="Publish current revision"
                        >
                          Publish
                        </button>
                      </>
                    )}
                  </div>
                )}
                {saveMessage && <span className="text-gray-700 ml-1">{saveMessage}</span>}
              </>
            )}
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
          {isAdmin && editMode && (
            <div className="mb-4">
              <button
                onClick={addCategory}
                className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
              >
                Add Category
              </button>
            </div>
          )}
          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((category, ci, cats) => (
              <div
                key={ci}
                onClick={() => setSelectedCategory(category.title)}
                className="bg-white border-2 border-black rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer"
              >
                {isAdmin && editMode && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveCategory(ci, Math.max(0, ci - 1)); }}
                        disabled={ci === 0}
                        className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveCategory(ci, Math.min(cats.length - 1, ci + 1)); }}
                        disabled={ci === cats.length - 1}
                        className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                        title="Move down"
                      >
                        ↓
                      </button>
            </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(category.title);
                      }}
                      className="text-xs px-2 py-1 border border-black rounded hover:bg-gray-50"
                      title="Remove category"
                    >
                      Remove Category
                    </button>
            </div>
                )}
                {isAdmin && editMode ? (
                  <input
                    className="w-full border border-black rounded-lg p-2 text-black text-xl font-light"
                    value={category.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUndoStack((s) => [...s, clone(data)]);
                      setRedoStack([]);
                      setData((prev) =>
                        prev.map((c, idx) => (idx === ci ? { ...c, title: next } : c))
                      );
                      if (selectedCategory === category.title) {
                        setSelectedCategory(next);
                      }
                      setHasUnsavedChanges(true);
                    }}
                  />
                ) : (
                  <h3 className="text-xl font-light text-black">{category.title}</h3>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCategory(null);
          }}
        >
          <div 
            className="bg-white border border-black rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              {editMode ? (
              <div className="flex items-center gap-2">
                  <input
                    className="text-2xl font-light text-black border border-black rounded-lg px-3 py-1"
                    value={(data.find((c) => c.title === selectedCategory)?.header) || selectedCategory}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUndoStack((s) => [...s, clone(data)]);
                      setRedoStack([]);
                      setData((prev) =>
                        prev.map((c) => (c.title === selectedCategory ? { ...c, header: next } : c))
                      );
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <input
                    className="text-sm border border-black rounded-lg px-2 py-1"
                    placeholder="Header link (https:// or image src)"
                    value={(data.find((c) => c.title === selectedCategory)?.headerLink?.href) || ''}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUndoStack((s) => [...s, clone(data)]);
                      setRedoStack([]);
                      setData((prev) =>
                        prev.map((c) => (c.title === selectedCategory ? { ...c, headerLink: { type: next.startsWith('http') ? 'url' : 'image', href: next, imageSrc: next } } : c))
                      );
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              ) : (
                (() => {
                  const cat = data.find((c) => c.title === selectedCategory);
                  const text = cat?.header || selectedCategory;
                  const link = cat?.headerLink;
                  if (link?.type === 'url' && link.href) {
                    return (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-2xl font-light text-black underline">
                        {text}
                      </a>
                    );
                  }
                  if (link?.type === 'image' && link.imageSrc) {
                    return (
                      <span className="text-2xl font-light text-black underline cursor-pointer" onClick={() => setImageModal(link.imageSrc!)}>{text}</span>
                    );
                  }
                  return <h2 className="text-2xl font-light text-black">{text}</h2>;
                })()
              )}
              <div className="flex items-center gap-2">
                {isAdmin && editMode && (
                  <button
                    onClick={() => addMetric(selectedCategory)}
                    className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
                  >
                    Add Tile
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
            {data
              .find((c) => c.title === selectedCategory)
              ?.metrics.map((metric, mi, arr) => (
                  <div key={mi} className="bg-white border border-black rounded-xl p-6">
                  <div className="space-y-4">
                      {isAdmin && editMode && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveMetric(selectedCategory, mi, Math.max(0, mi - 1))}
                          disabled={mi === 0}
                          className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveMetric(selectedCategory, mi, Math.min(arr.length - 1, mi + 1))}
                          disabled={mi === arr.length - 1}
                          className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                          title="Move down"
                        >
                          ↓
                        </button>
                    </div>
                            <button
                            onClick={() => removeMetric(selectedCategory, metric.title)}
                            className="text-xs px-2 py-1 border border-black rounded hover:bg-gray-50"
                            title="Remove tile"
                            >
                            Remove Tile
                            </button>
                        </div>
                      )}
                    {/* Metric Title */}
                      <div className="mb-2">
                        {editMode ? (
                          <div className="relative">
                            <input
                              className="w-full border border-black rounded-lg p-2 text-black pr-20"
                              value={metric.title}
                              onChange={(e) => updateMetricField(selectedCategory, metric.title, 'title', e.target.value)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <label className="text-xs px-2 py-1 border border-black rounded cursor-pointer whitespace-nowrap">Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleImageUpload(f, (href) => updateMetricLink(selectedCategory, metric.title, href));
                                  }}
                                />
                              </label>
                              <button
                                className="text-xs px-2 py-1 border border-black rounded"
                        onClick={() => {
                                  const href = prompt('Enter URL');
                                  if (href) updateMetricLink(selectedCategory, metric.title, href);
                                }}
                              >
                                Link
                              </button>
                            </div>
                          </div>
                        ) : (
                          (() => {
                            if (metric.link?.type === 'url' && metric.link.href) {
                              return <a href={metric.link.href} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-black underline">{metric.title}</a>;
                            }
                            if (metric.link?.type === 'image' && metric.link.imageSrc) {
                              return <span className="text-lg font-bold text-black underline cursor-pointer" onClick={() => setImageModal(metric.link!.imageSrc!)}>{metric.title}</span>;
                            }
                            return <h3 className="text-lg font-bold text-black">{metric.title}</h3>;
                          })()
                        )}
                    </div>
                    
                    {/* Main Value */}
                      <div className="space-y-1">
                        {editMode ? (
                          <input
                            className="w-full border border-black rounded-lg p-2 text-black text-2xl font-bold"
                            value={metric.value}
                            onChange={(e) => updateMetricField(selectedCategory, metric.title, 'value', e.target.value)}
                          />
                        ) : (
                          <div className="text-2xl font-bold text-black">{metric.value}</div>
                        )}
                        {editMode ? (
                          <div className="relative">
                            <input
                              className="w-full border border-black rounded-lg p-2 text-black pr-20"
                              value={metric.description || ''}
                              placeholder="Description"
                              onChange={(e) => updateMetricField(selectedCategory, metric.title, 'description', e.target.value)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <label className="text-xxs px-2 py-1 border border-black rounded cursor-pointer">Upload
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, (href) => updateMetricField(selectedCategory, metric.title, 'descriptionLink', JSON.stringify({ type: 'image', href } as any))); }} />
                              </label>
                              <button className="text-xxs px-2 py-1 border border-black rounded" onClick={() => { const href = prompt('Enter URL'); if (href) updateMetricField(selectedCategory, metric.title, 'descriptionLink', JSON.stringify({ type: 'url', href } as any)); }}>Link</button>
                      </div>
                          </div>
                        ) : (
                          metric.description && (
                            (() => {
                              const dl = metric.descriptionLink as any;
                              if (dl) {
                                try {
                                  const parsed = typeof dl === 'string' ? JSON.parse(dl) : dl;
                                  if (parsed.type === 'url') return <a href={parsed.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 underline">{metric.description}</a>;
                                  if (parsed.type === 'image') return <span className="text-sm text-gray-600 underline cursor-pointer" onClick={() => setImageModal(parsed.href)}>{metric.description}</span>;
                                } catch {}
                              }
                              return <div className="text-sm text-gray-600">{metric.description}</div>;
                            })()
                          )
                        )}
                        {editMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="flex-1 border border-black rounded-lg p-2 text-black text-sm"
                              value={metric.ctaText || ''}
                              placeholder="CTA text (e.g., View Graph)"
                              onChange={(e) => updateMetricField(selectedCategory, metric.title, 'ctaText', e.target.value)}
                            />
                            <input
                              className="w-64 border border-black rounded-lg p-2 text-black text-sm"
                              value={metric.ctaLink?.href || ''}
                              placeholder="CTA link (https:// or image src)"
                              onChange={(e) => {
                                const href = e.target.value;
                                setData((prev) => prev.map((c) => c.title === selectedCategory ? {
                                  ...c,
                                  metrics: c.metrics.map((m) => m.title === metric.title ? { ...m, ctaLink: href ? { type: href.startsWith('http') ? 'url' : 'image', href, imageSrc: href } : undefined } : m)
                                } : c));
                                setHasUnsavedChanges(true);
                              }}
                            />
                        </div>
                        ) : (
                          metric.ctaText && metric.ctaLink && (
                            metric.ctaLink.type === 'url' ? (
                              <a href={metric.ctaLink.href} target="_blank" rel="noopener noreferrer" className="text-base underline">{metric.ctaText}</a>
                            ) : metric.ctaLink.imageSrc ? (
                              <span className="text-base underline cursor-pointer" onClick={() => setImageModal(metric.ctaLink!.imageSrc!)}>{metric.ctaText}</span>
                            ) : null
                          )
                      )}
                    </div>

                    {/* Insight */}
                      {editMode ? (
                        <div className="relative">
                          <textarea
                            className="w-full border border-black rounded-lg p-2 text-black pr-20"
                            value={metric.insight || ''}
                            placeholder="Insight"
                            onChange={(e) => updateMetricField(selectedCategory, metric.title, 'insight', e.target.value)}
                          />
                          <div className="absolute right-2 top-2 flex items-center gap-1">
                            <label className="text-xxs px-2 py-1 border border-black rounded cursor-pointer">Upload
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, (href) => updateMetricField(selectedCategory, metric.title, 'insightLink', JSON.stringify({ type: 'image', href } as any))); }} />
                            </label>
                            <button className="text-xxs px-2 py-1 border border-black rounded" onClick={() => { const href = prompt('Enter URL'); if (href) updateMetricField(selectedCategory, metric.title, 'insightLink', JSON.stringify({ type: 'url', href } as any)); }}>Link</button>
                      </div>
                    </div>
                      ) : (
                        metric.insight && (
                          (() => {
                            const il = metric.insightLink as any;
                            if (il) {
                              try {
                                const parsed = typeof il === 'string' ? JSON.parse(il) : il;
                                if (parsed.type === 'url') return <a href={parsed.href} target="_blank" rel="noopener noreferrer" className="text-gray-700 leading-relaxed underline">{metric.insight}</a>;
                                if (parsed.type === 'image') return <span className="text-gray-700 leading-relaxed underline cursor-pointer" onClick={() => setImageModal(parsed.href)}>{metric.insight}</span>;
                              } catch {}
                            }
                            return <div className="text-gray-700 leading-relaxed">{metric.insight}</div>;
                          })()
                        )
                      )}

                    {/* Expanded Data */}
                    {metric.expandedData && (
                      <div className="space-y-3">
                        <button
                            onClick={() => toggleSubData(`${selectedCategory}-${mi}`)}
                          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <span className={`transform transition-transform ${expandedSubData[`${selectedCategory}-${mi}`] ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                          {expandedSubData[`${selectedCategory}-${mi}`] && (
                          <div>
                              {editMode && (
                                <div className="mb-3">
                                  <button
                                    onClick={() => addExpandedItem(selectedCategory, metric.title)}
                                    className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50"
                                  >
                                    Add Subtile
                                  </button>
                                </div>
                              )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {metric.expandedData.map((item, idx, itemsArr) => (
                                <div key={idx} className="bg-gray-25 border border-black rounded-lg p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        {editMode ? (
                                          <div className="relative">
                                            <input
                                              className="w-full border border-black rounded-lg p-2 text-black pr-20"
                                              value={item.label}
                                              onChange={(e) => updateExpandedItem(selectedCategory, metric.title, idx, 'label', e.target.value)}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                              <label className="text-xs px-2 py-1 border border-black rounded cursor-pointer whitespace-nowrap">Upload
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleImageUpload(f, (href) => updateExpandedLink(selectedCategory, metric.title, idx, href));
                                                  }}
                                                />
                                              </label>
                        <button
                                                className="text-xs px-2 py-1 border border-black rounded"
                                                onClick={() => {
                                                  const href = prompt('Enter URL');
                                                  if (href) updateExpandedLink(selectedCategory, metric.title, idx, href);
                                                }}
                                              >
                                                Link
                        </button>
                      </div>
                  </div>
                                        ) : (
                                          (() => {
                                            if (item.link?.type === 'url' && item.link.href) {
                                              return <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black underline">{item.label}</a>;
                                            }
                                            if (item.link?.type === 'image' && item.link.imageSrc) {
                                              return <span className="text-sm font-bold text-black underline cursor-pointer" onClick={() => setImageModal(item.link!.imageSrc!)}>{item.label}</span>;
                                            }
                                            return <div className="text-sm font-bold text-black">{item.label}</div>;
                                          })()
                                        )}
                </div>
                                      {editMode ? (
                                        <input
                                          className="w-full border border-black rounded-lg p-2 text-black text-lg font-bold"
                                          value={item.value}
                                          onChange={(e) => updateExpandedItem(selectedCategory, metric.title, idx, 'value', e.target.value)}
                                        />
                                      ) : (
                                        <div className="text-lg font-bold text-black">{item.value}</div>
                                      )}
                                      {editMode && (
                                        <div className="flex items-center gap-2 mt-2">
              <button
                                            onClick={() => moveExpandedItem(selectedCategory, metric.title, idx, Math.max(0, idx - 1))}
                                            disabled={idx === 0}
                                            className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                                            title="Move up"
                                          >
                                            ↑
              </button>
              <button
                                            onClick={() => moveExpandedItem(selectedCategory, metric.title, idx, Math.min(itemsArr.length - 1, idx + 1))}
                                            disabled={idx === itemsArr.length - 1}
                                            className="text-xs px-2 py-1 border border-black rounded disabled:opacity-50"
                                            title="Move down"
                                          >
                                            ↓
                                          </button>
                                          <button
                                            onClick={() => removeExpandedItem(selectedCategory, metric.title, idx)}
                                            className="text-xs px-2 py-1 border border-black rounded hover:bg-gray-50"
                                            title="Remove subtile"
                                          >
                                            Remove
              </button>
            </div>
                                      )}
                                      {editMode ? (
                                        <input
                                          className="w-full border border-black rounded-lg p-2 text-black"
                                          value={item.description || ''}
                                          placeholder="Description"
                                          onChange={(e) => updateExpandedItem(selectedCategory, metric.title, idx, 'description', e.target.value)}
                                        />
                                      ) : (
                                        item.description && <div className="text-sm text-gray-600">{item.description}</div>
                                    )}
            </div>
                  </div>
                              ))}
          </div>
        </div>
      )}

      {imageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100000]" onClick={() => setImageModal(null)}>
          <div className="bg-white rounded-xl p-2 max-w-6xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50" onClick={() => setImageModal(null)}>Close</button>
            </div>
            <img src={imageModal} alt="Preview" className="w-full h-auto max-h-[90vh] object-contain" />
          </div>
        </div>
      )}
            </div>
      )}
                      {isAdmin && editMode && (
                        <div className="pt-2 flex justify-end">
                    <button
                            onClick={() => void saveDraftRevision()}
                            disabled={isSaving || !hasUnsavedChanges}
                            className="text-sm px-3 py-1 border border-black rounded-lg hover:bg-gray-50 disabled:opacity-60"
                            title="Save Draft"
                          >
                            Save Draft
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
    </div>
  );
}

export default App;