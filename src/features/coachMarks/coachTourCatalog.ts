/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoachTourDefinition, CoachTourId } from './types';

export const COACH_TOUR_CATALOG: Record<CoachTourId, CoachTourDefinition> = {
  home_tour: {
    id: 'home_tour',
    name: 'Home Page Tour',
    steps: [
      {
        targetId: 'home-welcome-card',
        badge: 'Welcome Home',
        title: 'Your BackStory Hub',
        description:
          'Everything starts here—check your progress, discover daily memory sparks, and jump into writing whenever inspiration strikes.',
        placement: 'bottom'
      },
      {
        targetId: 'nav-author',
        badge: 'Top Menu · Author',
        title: 'Write in Your Author Studio',
        description:
          'Click Author anytime to write and organize your life chapters across 22 topics with StoryMate AI, AI Voice narration, and AI Photo Studio.',
        placement: 'bottom'
      },
      {
        targetId: 'nav-connections',
        badge: 'Top Menu · Connections',
        title: 'Build Your Personal Circle',
        description:
          'Manage your Connections, organize family and friends into sharing Groups, and respond to incoming connection invitations.',
        placement: 'bottom'
      },
      {
        targetId: 'nav-stories',
        badge: 'Top Menu · Stories',
        title: 'Explore Your Stories Feed',
        description:
          'Visit Stories to read, react to, comment on, and listen to published life chapters shared by your circle.',
        placement: 'bottom'
      },
      {
        targetId: 'nav-comms',
        badge: 'Top Menu · Activity',
        title: 'Messaging & Notifications',
        description:
          'Check direct messages from loved ones and stay up to date when connections accept invites or publish new stories.',
        placement: 'bottom'
      },
      {
        targetId: 'nav-me',
        badge: 'Top Menu · Me',
        title: 'Your Profile, Account, Preferences & Privacy',
        description:
          'Open the Me menu to update My Profile, check My Account & Credits, customize My Preferences (theme, text size, tours), or audit My Privacy.',
        placement: 'bottom'
      },
      {
        targetId: 'home-getting-started',
        badge: 'Quick Start',
        title: 'Track Your 5 Onboarding Steps',
        description:
          'Follow this interactive checklist to complete your profile, choose your StoryMate AI co-writer, publish your first story, and invite loved ones.',
        placement: 'bottom'
      },
      {
        targetId: 'home-daily-sparks',
        badge: 'Daily Inspiration',
        title: 'Personalized Memory Prompts',
        description:
          'Explore "Did You Know?" and "Remember When" flashcards tailored to your hometown, era, and milestones—click any prompt to start a story.',
        placement: 'top'
      },
      {
        targetId: 'home-early-adopter',
        badge: 'Member Perks',
        title: 'Your Early Adopter Benefits',
        description:
          'Click your Early Adopter badge anytime to view your Free BackStory Lifetime Subscription and complimentary AI Story, Voice, and Image credits.',
        placement: 'right'
      }
    ]
  },

  author_tour: {
    id: 'author_tour',
    name: 'Author Studio Tour',
    steps: [
      {
        targetId: 'author-story-index',
        badge: '22 Life Topics',
        title: 'Navigate Your Story Index',
        description:
          'Choose from 22 organized life chapters—Family, Residencies, Trips, Career, Childhood, and more—or launch the Book Studio & Photo Book.',
        placement: 'right'
      },
      {
        targetId: 'author-story-spark-card',
        badge: 'Story Sparks',
        title: 'Never Face a Blank Page',
        description:
          'Click "Story Ideas" to browse curated writing prompts for this topic. Pick any idea to launch a new draft with an engaging chapter title ready to go.',
        placement: 'bottom'
      },
      {
        targetId: 'author-story-editor',
        badge: 'Story Editor',
        title: 'Write, Collaborate & Publish',
        description:
          'Draft directly or chat with StoryMate AI to shape your memories, choose photo layouts, set fine-grained sharing privacy, and publish to your BackStory.',
        placement: 'top'
      },
      {
        targetId: 'author-voice-panel',
        badge: 'AI Voice',
        title: 'Narrate Stories in Your Own Voice',
        description:
          'Clone your voice (free to set up and sample) so family and friends can listen to your life stories narrated aloud.',
        placement: 'left'
      },
      {
        targetId: 'author-ai-photo-panel',
        badge: 'AI Photo Studio',
        title: 'Illustrate Memories Without a Photo',
        description:
          'When you don\'t have a real photograph for a cherished memory, use AI Photo Studio inside the Story Editor to craft 2K images and keepsake animations.',
        placement: 'left'
      }
    ]
  },

  feed_tour: {
    id: 'feed_tour',
    name: 'Story Feed Tour',
    steps: [
      {
        targetId: 'feed-filters',
        badge: 'Smart Filters',
        title: 'Filter Your Story Feed',
        description:
          'Toggle between "My Connections Only" and all shared stories, or control how stories you\'ve already read are organized.',
        placement: 'bottom'
      },
      {
        targetId: 'feed-story-card',
        badge: 'Interactive Stories',
        title: 'Read, React, Comment & Listen',
        description:
          'React with expressive emojis, join the conversation in threaded comments, listen to AI voice narrations, or open the full chapter.',
        placement: 'top'
      }
    ]
  },

  connections_tour: {
    id: 'connections_tour',
    name: 'Connections Page Tour',
    steps: [
      {
        targetId: 'connections-menu',
        badge: 'Your Circle',
        title: 'Manage Connections, Groups & Invites',
        description:
          'Switch between your Connections directory, custom sharing Groups (Family, Friends, Colleagues), incoming Invitations, and pending outgoing Requests.',
        placement: 'right'
      },
      {
        targetId: 'connections-search',
        badge: 'Member Search',
        title: 'Find & Filter BackStory Members',
        description:
          'Search by name or location, refresh your proximity filter, or toggle "My Connections Only" to explore either your circle or the wider BackStory community.',
        placement: 'bottom'
      },
      {
        targetId: 'connections-results',
        badge: 'Connect & Read',
        title: 'Invite Loved Ones & Read Their Stories',
        description:
          'Send connection invitations to family and friends, see which group they belong to, or open their profile to read their published chapters.',
        placement: 'top'
      }
    ]
  },

  profile_tour: {
    id: 'profile_tour',
    name: 'My Profile Tour',
    steps: [
      {
        targetId: 'profile-nav',
        badge: 'Profile Sections',
        title: 'Manage Profile, Display, Legacy & Voice',
        description:
          'Switch between your core bio details, public Display Settings, trusted Legacy Contacts, and personal AI Voice cloning.',
        placement: 'right'
      },
      {
        targetId: 'profile-photo-gallery',
        badge: 'Portrait & Photos',
        title: 'Upload Your Avatar & Photo Gallery',
        description:
          'Crop a favorite portrait for your profile avatar and keep up to 20 cherished photographs in your member gallery.',
        placement: 'bottom'
      },
      {
        targetId: 'profile-demographics',
        badge: 'Life Details',
        title: 'Personalize Your BackStory Profile',
        description:
          'Your name, birth date, and hometown personalize your daily memory sparks and introduce your life story to family and friends.',
        placement: 'top'
      }
    ]
  },

  account_tour: {
    id: 'account_tour',
    name: 'My Account Tour',
    steps: [
      {
        targetId: 'account-nav',
        badge: 'Credit Pools',
        title: 'Switch Between Story, Voice & Image Credits',
        description:
          'Manage separate credit balances for AI Story Co-Writing & PDFs, AI Voice Narration, and 2K AI Story Photos.',
        placement: 'right'
      },
      {
        targetId: 'account-balance-card',
        badge: 'Live Balance',
        title: 'Track Your Available Credits',
        description:
          'Your current balance and account status update immediately after every top-up or AI generation.',
        placement: 'right'
      },
      {
        targetId: 'account-packages',
        badge: 'Instant Top-Up',
        title: 'Choose a Credit Package Anytime',
        description:
          'Select any package to add credits securely via Stripe checkout—your credits never expire.',
        placement: 'top'
      }
    ]
  },

  preferences_tour: {
    id: 'preferences_tour',
    name: 'My Preferences Tour',
    steps: [
      {
        targetId: 'preferences-nav',
        badge: 'Personalization',
        title: 'StoryMate Persona & Workspace Settings',
        description:
          'Switch between choosing your AI StoryMate co-writer style and customizing your application theme, reading text size, and cards.',
        placement: 'right'
      },
      {
        targetId: 'preferences-main-panel',
        badge: 'Auto-Saved',
        title: 'Tailor BackStory to Your Comfort',
        description:
          'Pick a writing persona, switch color themes, enlarge reading text size, or replay guided tours anytime—every change saves automatically.',
        placement: 'top'
      }
    ]
  },

  privacy_tour: {
    id: 'privacy_tour',
    name: 'My Privacy Tour',
    steps: [
      {
        targetId: 'privacy-tabs',
        badge: '3 Audit Views',
        title: 'Inspect Story Access Three Ways',
        description:
          'Review who can view or comment on your stories organized By Group (Family, Friends, etc.), By Member, or By Story.',
        placement: 'bottom'
      },
      {
        targetId: 'privacy-content',
        badge: 'Fine-Grained Control',
        title: 'Adjust Permissions Anytime',
        description:
          'Click any story entry to update View, View & Comment, or No Access privileges on the spot, or download a PDF access summary.',
        placement: 'top'
      }
    ]
  }
};
