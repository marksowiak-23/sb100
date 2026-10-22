/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Wand2, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Mic, 
  Printer, 
  ShieldCheck, 
  Compass,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  MessageSquareQuote,
  Coffee,
  UserCheck
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StorybookAdConfig {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  badgeStyle: string;
  accentGradient: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlights: {
    icon: React.ReactNode;
    title: string;
    desc: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
  };
  ctaText: string;
  ctaAction?: () => void;
  secondaryText?: string;
  statBadge?: {
    label: string;
    value: string;
  };
}

export const STORYBOOK_ADS: StorybookAdConfig[] = [
  {
    id: 'ad-vision',
    badge: 'Platform Spotlight • The StoryBook Vision',
    badgeIcon: <Compass className="w-3.5 h-3.5 text-blue-600" />,
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/80',
    accentGradient: 'from-blue-600 via-indigo-600 to-sky-600',
    title: 'Live It. Write It. Share It.',
    tagline: 'Your life is an epic tapestry. Preserve every chapter before memories fade.',
    description: 'StoryBook is the creative space designed for real life moments, personal adventures, family heritage, and quiet milestones. Connect with a welcoming community that values authentic human stories over noisy social feeds.',
    imageUrl: '/storybook_splash_collage.jpg',
    imageAlt: 'StoryBook - Live it. Write it. Share it. Life adventures and storytelling collage',
    highlights: [
      {
        icon: <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />,
        title: 'Document Every Chapter',
        desc: 'From childhood summers and first jobs to retirement milestones and family traditions.'
      },
      {
        icon: <Users className="w-4 h-4 text-indigo-600 shrink-0" />,
        title: 'Authentic Connections',
        desc: 'Discover fellow memoir writers, explore hometowns, and read inspiring true reflections.'
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />,
        title: 'Uncompromised Privacy',
        desc: 'You decide who sees every story: keep it private, share with family circles, or publish openly.'
      }
    ],
    testimonial: {
      quote: 'StoryBook gave me the inspiration to finally write down the memories my kids always begged to hear about.',
      author: 'David M., StoryBook Member since 2025'
    },
    ctaText: 'Start your StoryBook',
    statBadge: {
      value: '100% Free',
      label: 'To Begin Writing'
    }
  },
  {
    id: 'ad-book-output',
    badge: 'Heirloom Edition • Print Hardcover Book',
    badgeIcon: <Award className="w-3.5 h-3.5 text-amber-600" />,
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200/80',
    accentGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    title: 'Turn Your Stories Into a Bound Hardcover Book',
    tagline: 'Hold your family history in your hands with a lavish, archival-quality printed keepsake.',
    description: 'Nothing compares to holding a beautifully bound book of your own life stories. Transform your written chapters, reflections, and photographs into a stunning coffee-table book crafted to withstand the test of time.',
    imageUrl: '/storybook_book_output.jpg',
    imageAlt: 'Whispers of a Legacy - Hardcover Memoir Book with printed family photos and elegant binding',
    highlights: [
      {
        icon: <Printer className="w-4 h-4 text-amber-600 shrink-0" />,
        title: 'Archival Hardcover Printing',
        desc: 'Heavy acid-free paper, rich photo reproduction, and gold foil stamped linen or faux-leather covers.'
      },
      {
        icon: <Layers className="w-4 h-4 text-yellow-600 shrink-0" />,
        title: 'Automated Beautiful Layouts',
        desc: 'One click formats your chapters, quotes, and vintage photos into a professional typeset design.'
      },
      {
        icon: <Heart className="w-4 h-4 text-rose-600 shrink-0" />,
        title: 'The Ultimate Family Keepsake',
        desc: 'Order copies for your children, siblings, and grandchildren to treasure on their bookshelf forever.'
      }
    ],
    testimonial: {
      quote: 'Unwrapping the hardcover book with my grandma’s stories brought the entire family to tears on Christmas morning.',
      author: 'Sarah L., Oregon'
    },
    ctaText: 'Start your StoryBook',
    statBadge: {
      value: 'Heirloom',
      label: 'Archival Quality'
    }
  },
  {
    id: 'ad-family-sharing',
    badge: 'Family Circle • Across Generations',
    badgeIcon: <Heart className="w-3.5 h-3.5 text-rose-600" />,
    badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200/80',
    accentGradient: 'from-rose-600 via-pink-600 to-red-600',
    title: 'Share Stories Across Generations',
    tagline: 'Give your children and grandchildren the greatest gift: the living legacy of where they came from.',
    description: 'Old photo albums often leave behind questions: who was in that picture? Where was it taken? StoryBook bridges the gap by pairing photographs with your firsthand stories, personal voice, and ancestral wisdom.',
    imageUrl: '/storybook_family_sharing.jpg',
    imageAlt: 'Three generations gathered together on a living room sofa reading and sharing family stories',
    highlights: [
      {
        icon: <Users className="w-4 h-4 text-rose-600 shrink-0" />,
        title: 'Private Family Circles',
        desc: 'A secure haven for your family to read, reminisce, and share memories away from public view.'
      },
      {
        icon: <Mic className="w-4 h-4 text-pink-600 shrink-0" />,
        title: 'Preserve Your Voice & Tone',
        desc: 'Attach audio recordings so future generations can hear your real voice, laughter, and accent forever.'
      },
      {
        icon: <MessageSquareQuote className="w-4 h-4 text-red-600 shrink-0" />,
        title: 'Collaborative Reminiscing',
        desc: 'Family members can comment, ask follow-up questions, and add their own perspectives to shared events.'
      }
    ],
    testimonial: {
      quote: 'My grandchildren live across the country, but reading my childhood stories keeps us closer than ever.',
      author: 'Robert K., StoryBook Member'
    },
    ctaText: 'Start your StoryBook',
    statBadge: {
      value: 'Generations',
      label: 'Connected Together'
    }
  },
  {
    id: 'ad-storymate-ai',
    badge: 'StoryMate AI • Friendly Writing Co-Pilot',
    badgeIcon: <Wand2 className="w-3.5 h-3.5 text-emerald-600" />,
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    accentGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    title: 'No Writing Experience Needed — Just Share Quick Thoughts',
    tagline: 'Speak freely or type short bullet points. StoryMate weaves them into heartfelt, polished chapters.',
    description: 'You do not need to be a professional author to create a breathtaking memoir. StoryMate acts as your supportive companion—asking gentle questions, offering creative sparks, and polishing your drafts while honoring your authentic voice.',
    imageUrl: '/storybook_ai_companion.jpg',
    imageAlt: 'Author with coffee writing stories with StoryMate AI co-pilot on laptop',
    highlights: [
      {
        icon: <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />,
        title: 'Weekly Memory Sparks',
        desc: 'Thoughtful prompts like “What was your childhood kitchen like?” rekindle long-forgotten memories.'
      },
      {
        icon: <Mic className="w-4 h-4 text-teal-600 shrink-0" />,
        title: 'Speak Instead of Typing',
        desc: 'Record audio thoughts or quick voice notes, and watch StoryMate organize them into written narratives.'
      },
      {
        icon: <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />,
        title: '100% Your Own Words',
        desc: 'You maintain complete creative control. Review, tweak, and adjust tone with one simple click.'
      }
    ],
    testimonial: {
      quote: 'I stared at blank paper for years. With StoryMate, I finished my first 12 chapters in just two weeks!',
      author: 'Margaret T., Ohio'
    },
    ctaText: 'Start your StoryBook',
    statBadge: {
      value: 'Effortless',
      label: 'AI Story Co-Writer'
    }
  },
  {
    id: 'ad-friends-connections',
    badge: 'Friends & Connections • "What\'s Your Story?"',
    badgeIcon: <Users className="w-3.5 h-3.5 text-violet-600" />,
    badgeStyle: 'bg-violet-50 text-violet-800 border-violet-200/80',
    accentGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    title: '“What’s Your Story?” — Turn Acquaintances Into Real Friends',
    tagline: 'Go beyond small talk. Discover the unforgettable moments that shaped the people around you.',
    description: 'Whenever people meet, the most meaningful question is always, "What’s your story?" StoryBook is where friends explore each other’s journeys—uncovering shared hometown roots, hilarious adventures, passions, and life lessons that spark lasting connections.',
    imageUrl: '/storybook_friends_connection.jpg',
    imageAlt: 'Diverse close friends laughing and connecting warmly over coffee sharing stories',
    highlights: [
      {
        icon: <Coffee className="w-4 h-4 text-violet-600 shrink-0" />,
        title: 'Skip the Surface Small Talk',
        desc: 'Discover the passions, wild travels, and childhood stories that make your friends who they are today.'
      },
      {
        icon: <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />,
        title: 'Build Meaningful Connections',
        desc: 'Find kindred spirits in your neighborhood and community who share similar life journeys and values.'
      },
      {
        icon: <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />,
        title: 'Share Inside Your Circle',
        desc: 'Exchange chapters with close friends, swap reflections, and celebrate life milestones together.'
      }
    ],
    testimonial: {
      quote: 'Reading my college roommate’s StoryBook showed me things about his journey I never knew after 15 years of friendship!',
      author: 'Marcus T., Chicago'
    },
    ctaText: 'Start your StoryBook',
    statBadge: {
      value: 'Connections',
      label: 'Lifelong Friends'
    }
  }
];

export interface SbStorybookAdPanelProps {
  adIndex?: number;
  adId?: string;
  onActionClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export default function SbStorybookAdPanel({
  adIndex = 0,
  adId,
  onActionClick,
  onSecondaryClick,
  className = ''
}: SbStorybookAdPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Pick ad configuration by ID or index (modulo total count)
  const ad = React.useMemo(() => {
    if (adId) {
      const found = STORYBOOK_ADS.find((a) => a.id === adId);
      if (found) return found;
    }
    const safeIdx = Math.abs(adIndex) % STORYBOOK_ADS.length;
    return STORYBOOK_ADS[safeIdx];
  }, [adId, adIndex]);

  return (
    <div 
      className={`relative bg-[#FDFCFB] border border-[#EFECE7] hover:border-slate-300/80 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden flex flex-col group ${className}`}
    >
      {/* Top Accent Gradient Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${ad.accentGradient}`} />

      {/* Hero Image Container with Editorial Overlay */}
      <div className="relative w-full h-52 sm:h-64 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <img
          src={ad.imageUrl}
          alt={ad.imageAlt}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out brightness-[0.92]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* Top Badges Over Image */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-xs ${ad.badgeStyle}`}>
            {ad.badgeIcon}
            <span>{ad.badge}</span>
          </span>

          {ad.statBadge && (
            <span className="hidden sm:inline-flex flex-col items-end px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-right">
              <span className="text-[12px] font-bold text-amber-300 leading-none">{ad.statBadge.value}</span>
              <span className="text-[9px] text-white/80 font-mono leading-tight">{ad.statBadge.label}</span>
            </span>
          )}
        </div>

        {/* Title & Tagline Over Image */}
        <div className="absolute bottom-3.5 left-4 right-4 text-white">
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug drop-shadow-md text-white mb-1">
            {ad.title}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-200 font-serif leading-relaxed line-clamp-2 drop-shadow">
            {ad.tagline}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
          {ad.description}
        </p>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 gap-2.5">
          {ad.highlights.map((h, i) => (
            <div 
              key={i}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100">
                {h.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 font-serif">
                  {h.title}
                </h4>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  {h.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Testimonial & Extra Details */}
        <AnimatePresence>
          {isExpanded && ad.testimonial && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-bold font-serif">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Member Testimonial</span>
                </div>
                <p className="text-xs italic text-slate-700 font-serif leading-relaxed">
                  &ldquo;{ad.testimonial.quote}&rdquo;
                </p>
                <span className="text-[10px] font-semibold text-slate-500 text-right font-mono">
                  — {ad.testimonial.author}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center sm:justify-start gap-1 py-1 cursor-pointer transition-colors"
          >
            <span>{isExpanded ? 'Show less' : 'Read details & reviews'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            {ad.secondaryText && (
              <button
                type="button"
                onClick={onSecondaryClick || onActionClick}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-serif transition-colors text-center cursor-pointer"
              >
                {ad.secondaryText}
              </button>
            )}

            <button
              type="button"
              onClick={onActionClick}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold font-serif shadow-xs hover:shadow-md transition-all cursor-pointer bg-gradient-to-r ${ad.accentGradient}`}
            >
              <span>{ad.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <AdminComponentTag name="SbStorybookAdPanel" />
    </div>
  );
}
