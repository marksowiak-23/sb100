import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  X,
  Check,
  HelpCircle,
  ArrowRight,
  Loader2,
  Tag,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { topicSparkApi, topicApi, TopicSpark, Topic } from '@/src/services/api';

const DEFAULT_SPARKS: TopicSpark[] = [
  { sparkId: 'spk-1', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What was your favorite childhood tradition with your grandparents?' },
  { sparkId: 'spk-2', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'How did your parents meet and what stories did they tell about their early years?' },
  { sparkId: 'spk-3', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What do you like most about your siblings?' },
  { sparkId: 'spk-4', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What was you Dad like when you were a child?' },
  { sparkId: 'spk-5', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What was you Mom like when you were a child?' },
  { sparkId: 'spk-6', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What were your grandparents like?' },
  { sparkId: 'spk-7', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What is your advice when it comes to raising children?' },
  { sparkId: 'spk-8', topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', sparkQuestion: 'Did you have any serious accidents as a child?' },
  { sparkId: 'spk-9', topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', sparkQuestion: 'How did you get to school as a child?' },
  { sparkId: 'spk-10', topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', sparkQuestion: 'What television programs did you watch as a child?' },
  { sparkId: 'spk-11', topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', sparkQuestion: 'What is the most vivid memory of your first childhood home or neighborhood?' },
  { sparkId: 'spk-12', topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', sparkQuestion: 'What was the biggest adventure or transition when moving into a new town or home?' },
  { sparkId: 'spk-13', topicId: '95af15b6-ccd4-4487-8151-aef0ad82b6e8', sparkQuestion: 'What proud accomplishment or milestone took the most persistence and courage?' },
  { sparkId: 'spk-14', topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', sparkQuestion: 'Which teacher, professor, or mentor made the biggest lasting impact on your life?' },
  { sparkId: 'spk-15', topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', sparkQuestion: 'Did you have a car in high school?' },
  { sparkId: 'spk-16', topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', sparkQuestion: 'Which sports did you play in high school?' },
  { sparkId: 'spk-17', topicId: '272a39fd-9b43-4fee-9c26-dccf1d8edd1e', sparkQuestion: 'What was your very first paid job and what valuable life lesson did you learn from it?' },
  { sparkId: 'spk-18', topicId: '272a39fd-9b43-4fee-9c26-dccf1d8edd1e', sparkQuestion: 'What was your first job? How did you get your first Job?' },
  { sparkId: 'spk-19', topicId: 'df0744af-1f72-4c4a-b141-05cfdbd2863d', sparkQuestion: 'What favorite hobby, sport, or creative pursuit brings you the greatest sense of flow?' },
  { sparkId: 'spk-20', topicId: '172dc3fc-ce2d-463b-ad9f-976f893cce5e', sparkQuestion: 'How did you meet your spouse? when did you know you wanted to marry them?' },
  { sparkId: 'spk-21', topicId: '172dc3fc-ce2d-463b-ad9f-976f893cce5e', sparkQuestion: 'What are the top 5 things that you and your spouse have in common?' },
  { sparkId: 'spk-22', topicId: '5cd2052b-28fc-434f-9ce4-4358ff944576', sparkQuestion: 'Describe your favorite places to spend the summer?' },
  { sparkId: 'spk-23', topicId: '5cd2052b-28fc-434f-9ce4-4358ff944576', sparkQuestion: 'What places can you travel to over and over again?' },
  { sparkId: 'spk-24', topicId: '5cd2052b-28fc-434f-9ce4-4358ff944576', sparkQuestion: 'What was your first big trip?' },
  { sparkId: 'spk-25', topicId: '5cd2052b-28fc-434f-9ce4-4358ff944576', sparkQuestion: 'Where did you go on vacations as a child?' },
  { sparkId: 'spk-26', topicId: 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e', sparkQuestion: "What is one of the funniest things you've ever done?" },
  { sparkId: 'spk-27', topicId: 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e', sparkQuestion: 'What vehicles did you have in your lifetime?' },
  { sparkId: 'spk-28', topicId: 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e', sparkQuestion: "What is one of the most expensive things that you've ever bought?" },
];

interface SparkQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string, spark?: TopicSpark) => void;
}

export default function SparkQuestionModal({
  isOpen,
  onClose,
  onSelectQuestion,
}: SparkQuestionModalProps) {
  const [sparks, setSparks] = useState<TopicSpark[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedSpark, setSelectedSpark] = useState<TopicSpark | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSpark(null);
      setSearchQuery('');
      setSelectedTopicId('all');
      setShowCustomInput(false);
      setCustomQuestion('');
      return;
    }

    let isMounted = true;
    const fetchSparksAndTopics = async () => {
      setLoading(true);
      try {
        const [sparksRes, topicsRes] = await Promise.allSettled([
          topicSparkApi.getTopicSparks(),
          topicApi.getTopics(),
        ]);

        if (!isMounted) return;

        if (sparksRes.status === 'fulfilled' && Array.isArray(sparksRes.value) && sparksRes.value.length > 0) {
          setSparks(sparksRes.value);
        } else {
          setSparks(DEFAULT_SPARKS);
        }

        if (topicsRes.status === 'fulfilled' && Array.isArray(topicsRes.value)) {
          setTopics(topicsRes.value);
        }
      } catch (err) {
        console.warn('Error loading topic sparks, using defaults:', err);
        if (isMounted) {
          setSparks(DEFAULT_SPARKS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSparksAndTopics();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {
      'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2': 'Family',
      '0c56cf6a-64d7-4174-abb0-0a049a40dcd5': 'Residencies',
      '95af15b6-ccd4-4487-8151-aef0ad82b6e8': 'Achievements',
      '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6': 'Education',
      '272a39fd-9b43-4fee-9c26-dccf1d8edd1e': 'Employment',
      'df0744af-1f72-4c4a-b141-05cfdbd2863d': 'Activities',
      '172dc3fc-ce2d-463b-ad9f-976f893cce5e': 'Relationships',
      '5cd2052b-28fc-434f-9ce4-4358ff944576': 'Trips and Vacations',
      'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28': 'Childhood',
      'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e': 'Other',
    };
    topics.forEach((t) => {
      if (t.topicId && t.topicName) {
        map[t.topicId] = t.topicName;
      }
    });
    return map;
  }, [topics]);

  // Extract distinct topics present in the sparks list for topic filter pills
  const availableTopicCategories = useMemo(() => {
    const topicIdSet = new Set<string>();
    sparks.forEach((s) => {
      if (s.topicId) topicIdSet.add(s.topicId);
    });
    const categories: { id: string; label: string }[] = [{ id: 'all', label: 'All Sparks' }];
    topicIdSet.forEach((tid) => {
      categories.push({
        id: tid,
        label: topicMap[tid] || 'General',
      });
    });
    return categories;
  }, [sparks, topicMap]);

  const topicScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = () => {
    const el = topicScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = topicScrollRef.current;
    if (!el) return;

    const handleScroll = () => checkScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      checkScroll();
    });
    ro.observe(el);

    checkScroll();
    const timer = setTimeout(checkScroll, 120);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [availableTopicCategories, isOpen]);

  const handleScrollTopics = (direction: 'left' | 'right') => {
    if (topicScrollRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      topicScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filtered sparks based on search query and category selection
  const filteredSparks = useMemo(() => {
    return sparks.filter((s) => {
      const matchesTopic = selectedTopicId === 'all' || s.topicId === selectedTopicId;
      if (!matchesTopic) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const questionMatch = s.sparkQuestion.toLowerCase().includes(q);
      const topicName = (topicMap[s.topicId] || '').toLowerCase();
      const topicMatch = topicName.includes(q);
      return questionMatch || topicMatch;
    });
  }, [sparks, selectedTopicId, searchQuery, topicMap]);

  const handleConfirmSelection = () => {
    if (showCustomInput && customQuestion.trim()) {
      onSelectQuestion(customQuestion.trim());
      onClose();
    } else if (selectedSpark) {
      onSelectQuestion(selectedSpark.sparkQuestion, selectedSpark);
      onClose();
    }
  };

  const handleDirectSelect = (spark: TopicSpark) => {
    setSelectedSpark(spark);
    onSelectQuestion(spark.sparkQuestion, spark);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="spark-question-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in"
    >
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        id="spark-question-dialog"
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white border border-amber-100/80 rounded-3xl shadow-2xl max-w-2xl w-full z-10 flex flex-col relative overflow-hidden max-h-[90vh]"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-amber-50 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  Select Question Spark
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200 font-sans">
                  topicSpark
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Choose a spark question from the catalog to serve as the title and prompt for your story.
              </p>
            </div>
          </div>

          <button
            id="btn-close-spark-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-5 sm:px-6 pt-3.5 pb-2.5 flex flex-col gap-2.5 bg-slate-50/50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="spark-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spark questions or topics..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Topic Category Filter Pills with Left & Right Indicators */}
          <div className="flex items-center gap-1">
            {(canScrollLeft || canScrollRight) && (
              <button
                type="button"
                id="btn-scroll-topics-left"
                onClick={() => handleScrollTopics('left')}
                disabled={!canScrollLeft}
                title="Scroll topics left"
                aria-label="Scroll topics left"
                className={`shrink-0 p-1 rounded-lg border transition-all ${
                  canScrollLeft
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 cursor-pointer shadow-2xs'
                    : 'opacity-25 border-transparent text-slate-300 cursor-default pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <div
              ref={topicScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs flex-1 scroll-smooth"
            >
              {availableTopicCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedTopicId(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-all duration-150 text-[11px] font-sans ${
                    selectedTopicId === cat.id
                      ? 'bg-amber-500 text-white shadow-xs font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {(canScrollLeft || canScrollRight) && (
              <button
                type="button"
                id="btn-scroll-topics-right"
                onClick={() => handleScrollTopics('right')}
                disabled={!canScrollRight}
                title="Scroll topics right"
                aria-label="Scroll topics right"
                className={`shrink-0 p-1 rounded-lg border transition-all ${
                  canScrollRight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 cursor-pointer shadow-2xs'
                    : 'opacity-25 border-transparent text-slate-300 cursor-default pointer-events-none'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="px-5 sm:px-6 py-3 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
              <span className="text-xs font-medium">Loading spark questions from topicSpark...</span>
            </div>
          ) : filteredSparks.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <HelpCircle className="w-8 h-8 text-slate-350" />
              <p className="text-xs font-medium text-slate-600">
                No spark questions found matching your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTopicId('all');
                }}
                className="text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredSparks.map((spark, idx) => {
              const isSelected = selectedSpark?.sparkId === spark.sparkId;
              const topicName = topicMap[spark.topicId] || 'Topic';

              return (
                <div
                  key={spark.sparkId || `spark-${idx}`}
                  id={`spark-option-${spark.sparkId || idx}`}
                  onClick={() => setSelectedSpark(spark)}
                  onDoubleClick={() => handleDirectSelect(spark)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400'
                      : 'bg-white hover:bg-amber-50/30 border-slate-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100/70 text-amber-600 group-hover:bg-amber-200/80'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm sm:text-[15px] font-medium text-slate-850 leading-snug group-hover:text-amber-950">
                        {spark.sparkQuestion}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-amber-200 group-hover:bg-amber-50/50">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{topicName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-amber-700 font-sans font-semibold flex items-center gap-0.5">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Custom Question Entry Collapsible */}
          <div className="pt-2 border-t border-slate-100">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(true);
                  setSelectedSpark(null);
                }}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Write a custom spark question instead...</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-900 font-sans">
                    Custom Spark Question
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomQuestion('');
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Type your own story question or spark prompt..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 font-serif"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-sans truncate">
            {showCustomInput && customQuestion.trim()
              ? `Custom: "${customQuestion.trim()}"`
              : selectedSpark
              ? `Selected: "${selectedSpark.sparkQuestion}"`
              : 'Choose a question above to proceed'}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-cancel-spark-modal"
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              id="btn-use-spark-title"
              type="button"
              disabled={(!selectedSpark && (!showCustomInput || !customQuestion.trim()))}
              onClick={handleConfirmSelection}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-amber-600 font-sans"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use as Story Title</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
