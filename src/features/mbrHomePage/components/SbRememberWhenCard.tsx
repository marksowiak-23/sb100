/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Feather,
  History,
  Music,
  Newspaper,
  Tv,
  Gamepad2,
  DollarSign,
  Calendar,
  ChevronRight,
  X,
  Flame
} from 'lucide-react';
import { userManager } from '@/src/services/userManager';
import { taskApi, mbrRememberWhenApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type NostalgiaCategory = 'ALL' | 'POP_CULTURE' | 'BIG_NEWS' | 'MOVIES_TV' | 'FADS_TRENDS' | 'COST_OF_LIVING';

export type LifeStageKey = 'BORN' | 'CHILDHOOD' | 'TEEN' | 'TWENTIES' | 'THIRTIES' | 'FORTIES_PLUS';

export interface NostalgiaItem {
  id: string;
  year: number;
  decade: number;
  category: 'POP_CULTURE' | 'BIG_NEWS' | 'MOVIES_TV' | 'FADS_TRENDS' | 'COST_OF_LIVING';
  headline: string;
  storyContent: string;
  promptSuggestion: string;
  badge?: string;
}

interface LifeStageDef {
  key: LifeStageKey;
  label: string;
  emoji: string;
  minAge: number;
  maxAge: number;
  description: string;
}

const LIFE_STAGES: LifeStageDef[] = [
  { key: 'TEEN', label: 'Teen Years', emoji: '🎸', minAge: 13, maxAge: 19, description: 'Ages 13–19' },
  { key: 'TWENTIES', label: 'In Your 20s', emoji: '🕶️', minAge: 20, maxAge: 29, description: 'Ages 20–29' },
  { key: 'CHILDHOOD', label: 'Childhood', emoji: '🎒', minAge: 6, maxAge: 12, description: 'Ages 6–12' },
  { key: 'THIRTIES', label: 'In Your 30s', emoji: '💼', minAge: 30, maxAge: 39, description: 'Ages 30–39' },
  { key: 'BORN', label: 'Year Born', emoji: '👶', minAge: 0, maxAge: 0, description: 'The Year You Arrived' },
  { key: 'FORTIES_PLUS', label: 'In Your 40s+', emoji: '☕', minAge: 40, maxAge: 55, description: 'Ages 40+' },
];

// Rich, authentic nostalgia almanac database across decades
const NOSTALGIA_DATABASE: NostalgiaItem[] = [
  // --- 1950s ---
  {
    id: 'n-1951-lucy',
    year: 1951,
    decade: 1950,
    category: 'MOVIES_TV',
    headline: 'Remember When: "I Love Lucy" Debuts in Living Rooms',
    storyContent: 'On October 15, 1951, Lucille Ball and Desi Arnaz brought "I Love Lucy" into American living rooms, filmed with an innovative three-camera setup before a live studio audience. Families gathered closely around glowing cathode-ray tube sets on Monday nights to laugh along with Lucy and Ricky.',
    promptSuggestion: 'What are your earliest memories of watching evening television with family or visiting neighbors who had a TV?',
    badge: 'Monday Night Tradition'
  },
  {
    id: 'n-1954-rock',
    year: 1954,
    decade: 1950,
    category: 'POP_CULTURE',
    headline: 'Remember When: The Birth of Rock & Roll',
    storyContent: 'In 1954, Bill Haley & His Comets released "Rock Around the Clock," igniting a musical revolution across teen America. Local soda shops, malt parlors, and drive-ins hummed with neon jukeboxes spinning brand-new 45 RPM vinyl records as teenagers discovered a rhythm entirely their own.',
    promptSuggestion: 'Do you remember the first 45 RPM record or vinyl album you ever owned? Where did you go to listen to it?',
    badge: 'Jukebox Hit: "Rock Around the Clock"'
  },
  {
    id: 'n-1955-disney',
    year: 1955,
    decade: 1950,
    category: 'BIG_NEWS',
    headline: 'Big News: Disneyland Opens Its Gates in California',
    storyContent: 'On July 17, 1955, Walt Disney opened the original Disneyland in Anaheim, broadcast live on black-and-white televisions to over 90 million viewers nationwide. It introduced Main Street, U.S.A., Tomorrowland, and Fantasyland, instantly redefining family imagination and childhood daydreams.',
    promptSuggestion: 'Did your family gather around a black-and-white television for special broadcasts or weekend shows? What was that routine like?',
    badge: 'Admission: $1.00 Adult Ticket'
  },
  {
    id: 'n-1957-sputnik',
    year: 1957,
    decade: 1950,
    category: 'BIG_NEWS',
    headline: 'Big News of the Times: Sputnik 1 & The Space Race',
    storyContent: 'In October 1957, the world looked up into the night sky as Sputnik 1 beamed its steady radio beeps back to Earth from orbit. Across towns and school classrooms, kids and adults stood in backyards with binoculars, sparking a national fascination with science, rockets, and astronomy.',
    promptSuggestion: 'Do you remember looking up at the night sky or talking about the early Space Age with teachers or neighbors?',
    badge: 'First Artificial Satellite'
  },
  {
    id: 'n-1958-hula',
    year: 1958,
    decade: 1950,
    category: 'FADS_TRENDS',
    headline: 'Remember When: The Great Hula Hoop Craze',
    storyContent: 'In the summer of 1958, Wham-O introduced the colorful plastic Hula Hoop, selling over 25 million in just four months. Neighborhood sidewalks, school playgrounds, and church lawns were filled with kids and parents twisting frantically to keep their hoops spinning.',
    promptSuggestion: 'What popular childhood toys or neighborhood playground games do you most fondly remember mastering?',
    badge: 'Price: $1.98 Toy Sensation'
  },
  {
    id: 'n-1959-prices',
    year: 1959,
    decade: 1950,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost: A Snapshot from 1959',
    storyContent: 'In 1959, a gallon of regular gasoline cost just 25 cents, a first-class postage stamp was 4 cents, and a movie ticket at the local downtown theater was 50 cents. A brand new Chevrolet Impala rolled off the dealership lot for about $2,600, while a gallon of fresh milk was $1.01.',
    promptSuggestion: 'What was your very first paid job or allowance, and what did you like to spend your spare pocket change on?',
    badge: 'Gas: 25¢ / gal · Stamp: 4¢'
  },

  // --- 1960s ---
  {
    id: 'n-1963-beatles',
    year: 1963,
    decade: 1960,
    category: 'POP_CULTURE',
    headline: 'Remember When: Beatlemania Swept the Nation',
    storyContent: 'By late 1963 and early 1964, the Fab Four landed in America, sending teenagers into a state of ecstatic hysteria. When they performed on The Ed Sullivan Show on February 9, 1964, a record 73 million people tuned in. Mop-top haircuts, transistor radios pressed against ears, and screaming record stores became the hallmark of the era.',
    promptSuggestion: 'Where were you when you first heard The Beatles or your favorite 1960s group? Did you have their posters on your wall?',
    badge: '73 Million Ed Sullivan Viewers'
  },
  {
    id: 'n-1964-mustang',
    year: 1964,
    decade: 1960,
    category: 'FADS_TRENDS',
    headline: 'Remember When: The Ford Mustang Makes Its Debut',
    storyContent: 'At the 1964 New York World’s Fair, Ford introduced the stylish, affordable Mustang starting at $2,368. Dealerships were mobbed by eager young drivers, selling 22,000 cars on day one. Cruising the main drag on Friday nights with the windows rolled down and the AM radio turned up became an instant rite of passage.',
    promptSuggestion: 'What was the first car you ever drove or rode in with your friends? What was your favorite route to cruise?',
    badge: 'MSRP: $2,368 · Day 1: 22k Sold'
  },
  {
    id: 'n-1966-startrek',
    year: 1966,
    decade: 1960,
    category: 'MOVIES_TV',
    headline: 'Remember When: Star Trek & Batman Took Over Prime Time',
    storyContent: 'In 1966, living rooms were captivated by color television as Star Trek first explored the final frontier aboard the Starship Enterprise, while Adam West’s campy Batman series with its punchy "POW!" and "BAM!" graphics aired twice a week on ABC, inspiring kids everywhere to wear towel capes.',
    promptSuggestion: 'Which television shows did your whole family stop everything to watch together in the evenings?',
    badge: 'Color TV Revolution'
  },
  {
    id: 'n-1969-moon',
    year: 1969,
    decade: 1960,
    category: 'BIG_NEWS',
    headline: 'Big News of the Times: "One Giant Leap for Mankind"',
    storyContent: 'On July 20, 1969, an estimated 650 million people worldwide held their breath as Apollo 11 astronaut Neil Armstrong stepped onto the lunar surface, declaring, "That\'s one small step for man, one giant leap for mankind." Families huddled near their television sets late into a warm Sunday night, witnessing history.',
    promptSuggestion: 'Where were you on the night of the Moon Landing in July 1969? Who were you watching or listening with?',
    badge: 'Historic Lunar Landing: Apollo 11'
  },
  {
    id: 'n-1969-prices',
    year: 1969,
    decade: 1960,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 1969',
    storyContent: 'In 1969, a gallon of gas averaged 35 cents, a first-class postage stamp cost 6 cents, and a McDonald’s hamburger was just 18 cents. The average annual income in America was $8,550, and the median home price was approximately $25,600.',
    promptSuggestion: 'Do you remember the price of everyday staples when you were growing up, like a bottle of Coca-Cola or a loaf of bread?',
    badge: 'Gas: 35¢ / gal · Burger: 18¢'
  },

  // --- 1970s ---
  {
    id: 'n-1974-cassette',
    year: 1974,
    decade: 1970,
    category: 'POP_CULTURE',
    headline: 'Remember When: 8-Tracks, Cassettes & AM Radio Hits',
    storyContent: 'In 1974, dashboards were outfitted with chunky 8-track tape players that clicked loudly between tracks, while portable cassette recorders allowed teenagers to record their favorite songs straight off the top-40 AM radio. Hits by Elton John, Stevie Wonder, and Wings ruled the summer airwaves.',
    promptSuggestion: 'Did you have an 8-track or cassette collection in your car or bedroom? What was your prized tape?',
    badge: '#1 Hit: "Bennie and the Jets"'
  },
  {
    id: 'n-1975-petrock',
    year: 1975,
    decade: 1970,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Mood Rings & The Pet Rock Craze',
    storyContent: 'In 1975, novelty items captured the nation’s sense of humor. Gary Dahl created the Pet Rock—a smooth Mexican beach pebble nestled in straw inside a cardboard carrier with breathing holes—selling over 1.5 million in months. Meanwhile, color-changing mood rings claimed to reveal your inner emotions.',
    promptSuggestion: 'Did you or your friends ever buy into humorous fads like mood rings, pet rocks, or custom iron-on t-shirts?',
    badge: '1.5 Million Pet Rocks Sold'
  },
  {
    id: 'n-1976-bicentennial',
    year: 1976,
    decade: 1970,
    category: 'BIG_NEWS',
    headline: 'Big News of the Times: America’s Bicentennial Celebration',
    storyContent: 'On July 4, 1976, communities from coast to coast celebrated the 200th birthday of the United States with red-white-and-blue parades, neighborhood block parties, tall ship flotillas, and unprecedented fireworks displays. Fire hydrants and mailboxes were painted patriotic colors in almost every town.',
    promptSuggestion: 'How did your hometown or family celebrate the 1976 Bicentennial summer?',
    badge: '1776–1976 Celebration'
  },
  {
    id: 'n-1977-starwars',
    year: 1977,
    decade: 1970,
    category: 'MOVIES_TV',
    headline: 'Remember When: Star Wars Lines Stretched Around the Block',
    storyContent: 'On May 25, 1977, George Lucas’s Star Wars hit theaters, transforming cinema forever with its groundbreaking special effects, John Williams’s triumphant score, and legendary characters Luke Skywalker, Princess Leia, and Han Solo. Moviegoers stood in lines wrapping around city blocks for hours just to buy a ticket.',
    promptSuggestion: 'What is the most memorable movie theater experience from your youth? Who did you go to the cinema with?',
    badge: 'Ticket: $2.25 · Box Office Record'
  },
  {
    id: 'n-1978-disco',
    year: 1978,
    decade: 1970,
    category: 'POP_CULTURE',
    headline: 'Remember When: Saturday Night Fever & The Disco Craze',
    storyContent: 'In 1978, the Bee Gees soundtrack for "Saturday Night Fever" dominated charts worldwide with "Stayin\' Alive" and "Night Fever." Roller rinks and local dance clubs lit up with rotating mirror balls, platform shoes, satin shirts, and synchronized dance moves.',
    promptSuggestion: 'Did you ever try roller disco or attend high school / college dances during the disco and classic rock era?',
    badge: 'Mirror Balls & Platform Shoes'
  },
  {
    id: 'n-1979-prices',
    year: 1979,
    decade: 1970,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 1979',
    storyContent: 'In 1979, gas prices were climbing towards 86 cents a gallon, a postage stamp was 15 cents, a movie ticket was $2.50, and the average price of a new car was $6,800. A Sony Walkman had just made its debut for around $200, introducing portable music to the world.',
    promptSuggestion: 'Do you remember the first big electronics purchase you made, such as a stereo system, TV, or cassette player?',
    badge: 'Gas: 86¢ / gal · Stamp: 15¢'
  },

  // --- 1980s ---
  {
    id: 'n-1981-mtv',
    year: 1981,
    decade: 1980,
    category: 'POP_CULTURE',
    headline: 'Remember When: "I Want My MTV!" Changed Music Forever',
    storyContent: 'At 12:01 AM on August 1, 1981, MTV launched with the words "Ladies and gentlemen, rock and roll" followed by The Buggles\' "Video Killed the Radio Star." Suddenly, music was something you watched 24 hours a day, setting fashion trends from neon leg warmers to leather jackets.',
    promptSuggestion: 'Did you watch music videos on MTV or late-night TV? Which band’s music video was unforgettable for you?',
    badge: 'First Video: The Buggles'
  },
  {
    id: 'n-1982-pacman',
    year: 1982,
    decade: 1980,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Arcade Fever & The Rubik’s Cube',
    storyContent: 'In 1982, shopping malls and local pizza parlors echoed with the distinct electronic bleeps of Pac-Man, Space Invaders, and Donkey Kong. Meanwhile, over 100 million Rubik’s Cubes were being twisted frantically in classrooms and living rooms as people raced to solve the puzzle.',
    promptSuggestion: 'Did you ever spend an afternoon pumping quarters into arcade machines or trying to solve a Rubik\'s Cube?',
    badge: 'Arcades & Rubik’s Cube Craze'
  },
  {
    id: 'n-1985-liveaid',
    year: 1985,
    decade: 1980,
    category: 'BIG_NEWS',
    headline: 'Big News of the Times: Live Aid Rocks the World',
    storyContent: 'On July 13, 1985, the dual-venue benefit concert Live Aid took place simultaneously in London’s Wembley Stadium and Philadelphia’s JFK Stadium. Queen, David Bowie, U2, Madonna, and Phil Collins performed to 1.9 billion viewers across 150 nations, raising millions for famine relief.',
    promptSuggestion: 'Do you remember tuning in to Live Aid or other historic benefit concerts of the 1980s?',
    badge: '1.9 Billion Viewers in 150 Countries'
  },
  {
    id: 'n-1985-backtothefuture',
    year: 1985,
    decade: 1980,
    category: 'MOVIES_TV',
    headline: 'Remember When: Back to the Future & The DeLorean',
    storyContent: 'In the summer of 1985, Michael J. Fox sped to 88 MPH in a stainless-steel DeLorean time machine in "Back to the Future." The film became the biggest box office smash of the year, popularizing hoverboards, puffy red vests, and Huey Lewis and the News’s hit "The Power of Love."',
    promptSuggestion: 'If you had a real DeLorean time machine, which year of your past would you travel back to visit first?',
    badge: '#1 Box Office Hit of 1985'
  },
  {
    id: 'n-1988-prices',
    year: 1988,
    decade: 1980,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 1988',
    storyContent: 'In 1988, a gallon of regular unleaded gasoline cost 90 cents, a first-class postage stamp was 25 cents, and a movie ticket averaged $4.11. The Nintendo Entertainment System (NES) bundled with Super Mario Bros. was the hottest holiday gift at $149.',
    promptSuggestion: 'Did you or your children have a Nintendo or favorite video game console back in the 80s and 90s?',
    badge: 'Gas: 90¢ / gal · NES: $149'
  },

  // --- 1990s ---
  {
    id: 'n-1991-grunge',
    year: 1991,
    decade: 1990,
    category: 'POP_CULTURE',
    headline: 'Remember When: Flannel Shirts & The 90s Music Revolution',
    storyContent: 'In autumn 1991, Nirvana released "Smells Like Teen Spirit," sweeping away 80s hair metal and ushering in the grunge and alternative rock era. Flannel shirts, Doc Martens, ripped jeans, and compact disc players (with anti-skip protection) defined youth culture across the world.',
    promptSuggestion: 'What music or fashion trends from the 1990s did you adopt or observe in friends and coworkers?',
    badge: 'Compact Disc Boom'
  },
  {
    id: 'n-1994-friends',
    year: 1994,
    decade: 1990,
    category: 'MOVIES_TV',
    headline: 'Remember When: Must-See TV & Central Perk',
    storyContent: 'In 1994, NBC’s "Must-See TV" Thursday night lineup reached legendary status with the premiere of Friends and ER alongside Seinfeld. Coffeehouses and cozy couches became the favorite hangout spots, while "The Rachel" haircut swept beauty salons across the country.',
    promptSuggestion: 'Did you have a favorite sitcom or television series that defined your 1990s Thursday night routine?',
    badge: 'Must-See TV Thursdays'
  },
  {
    id: 'n-1995-internet',
    year: 1995,
    decade: 1990,
    category: 'BIG_NEWS',
    headline: 'Big News: "You’ve Got Mail" & The Dawn of the Web',
    storyContent: 'In August 1995, Microsoft launched Windows 95, and millions of homes were introduced to the World Wide Web through AOL dial-up CDs. The iconic screeching modem handshake and the cheerful "You’ve Got Mail!" voice marked our first steps into the digital connected world.',
    promptSuggestion: 'Do you remember your first home computer, dial-up internet connection, or first email address?',
    badge: 'Windows 95 & AOL Dial-Up'
  },
  {
    id: 'n-1997-fads',
    year: 1997,
    decade: 1990,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Beanie Babies Mania & Tamagotchi Pets',
    storyContent: 'In 1997, collectors scrambled into card shops and department stores searching for rare Ty Beanie Babies with pristine heart tags, hoping they would appreciate in value. At the same time, keychain Tamagotchi digital pets beeped in school hallways needing to be fed and cared for.',
    promptSuggestion: 'Did you or your children ever collect Beanie Babies, Pokémon cards, or care for a Tamagotchi virtual pet?',
    badge: 'Beanie Craze & Digital Pets'
  },
  {
    id: 'n-1997-titanic',
    year: 1997,
    decade: 1990,
    category: 'MOVIES_TV',
    headline: 'Remember When: Titanic Smashed Every Box Office Record',
    storyContent: 'In December 1997, James Cameron’s epic Titanic hit theaters, staying #1 at the box office for an unprecedented 15 consecutive weeks. Celine Dion’s "My Heart Will Go On" played on repeat across every radio station, while Leonardo DiCaprio and Kate Winslet captured hearts everywhere.',
    promptSuggestion: 'Did you see Titanic in the movie theater during its historic run? How many times did people in your circle go see it?',
    badge: '11 Academy Awards · $2B Gross'
  },
  {
    id: 'n-1999-prices',
    year: 1999,
    decade: 1990,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 1999: The Eve of the Millennium',
    storyContent: 'In 1999, as the world prepared for Y2K, a gallon of gas cost $1.22, a postage stamp was 33 cents, a movie ticket was $5.08, and the average new home sold for $131,000. Beanie Babies were trading like gold coins, and the Nokia 5110 was the cell phone of choice.',
    promptSuggestion: 'How did you ring in the New Year on December 31, 1999 as the millennium turned?',
    badge: 'Gas: $1.22 / gal · Stamp: 33¢'
  },

  // --- 2000s ---
  {
    id: 'n-2001-ipod',
    year: 2001,
    decade: 2000,
    category: 'POP_CULTURE',
    headline: 'Remember When: "1,000 Songs in Your Pocket"',
    storyContent: 'In October 2001, Apple introduced the original iPod with its revolutionary mechanical scroll wheel and white earbuds. Gone were bulky CD wallets and skipping discmans; you could now carry your entire lifetime music library in a device the size of a deck of cards.',
    promptSuggestion: 'What was your transition from cassettes/CDs to digital MP3s and streaming like? What songs were on your first playlist?',
    badge: 'Original iPod Release'
  },
  {
    id: 'n-2001-cinemamagic',
    year: 2001,
    decade: 2000,
    category: 'MOVIES_TV',
    headline: 'Remember When: Harry Potter & The Lord of the Rings Began',
    storyContent: 'In late 2001, movie theaters were spellbound as "Harry Potter and the Sorcerer’s Stone" and "The Fellowship of the Ring" premiered back-to-back. Midnight movie screenings, fantasy book midnight releases, and epic trilogy marathons defined the decade.',
    promptSuggestion: 'Did you or your family attend midnight premieres or read through the Harry Potter or Lord of the Rings books together?',
    badge: 'Fantasy Box Office Boom'
  },
  {
    id: 'n-2002-flipphone',
    year: 2002,
    decade: 2000,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Flip Phones, T9 Texting & Custom Ringtones',
    storyContent: 'In 2002, sleek flip phones like the Motorola Razr took over pockets everywhere. Tapping number keys three times for a single letter using T9 predictive text and purchasing 99-cent polyphonic midi ringtones of your favorite pop songs was the ultimate personal style statement.',
    promptSuggestion: 'What was your very first cell phone, and do you remember having to type text messages using numeric T9 keys?',
    badge: 'T9 Texting & Custom Ringtones'
  },
  {
    id: 'n-2004-socialmedia',
    year: 2004,
    decade: 2000,
    category: 'BIG_NEWS',
    headline: 'Big News: The Birth of Social Media & The Modern Web',
    storyContent: 'Between 2003 and 2005, MySpace, Facebook, and YouTube launched, permanently reshaping how people reconnected with old classmates, shared digital photos, and discovered viral video clips like never before.',
    promptSuggestion: 'Who was the first long-lost schoolmate or childhood friend you reconnected with through the early internet?',
    badge: 'Digital Connection Era'
  },
  {
    id: 'n-2004-prices',
    year: 2004,
    decade: 2000,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2004',
    storyContent: 'In 2004, a gallon of regular gasoline averaged $1.88, a first-class postage stamp was 37 cents, and a movie ticket cost $6.21. Apple’s vibrant new iPod Mini debuted at $249, and DVD box sets of entire TV seasons were the go-to gift for birthdays and holidays.',
    promptSuggestion: 'What was your favorite physical media collection you owned—like VHS tapes, DVDs, or CD binders?',
    badge: 'Gas: $1.88 / gal · Stamp: 37¢'
  },
  {
    id: 'n-2005-theoffice',
    year: 2005,
    decade: 2000,
    category: 'MOVIES_TV',
    headline: 'Remember When: The Office & Lost Dominated Watercoolers',
    storyContent: 'In 2005, television fans were captivated by the mystery of the island on "Lost" and the mockumentary antics of Dunder Mifflin in "The Office." Friends and coworkers spent Friday mornings dissecting theories, character pranks, and unforgettable plot twists.',
    promptSuggestion: 'What show had you and your coworkers or friends constantly talking and exchanging theories the next day at work or school?',
    badge: 'Golden Era of TV Sitcoms'
  },
  {
    id: 'n-2006-guitarhero',
    year: 2006,
    decade: 2000,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Guitar Hero Rocked Living Rooms',
    storyContent: 'In 2006, plastic miniature guitars and drum kits invaded living rooms and dorms as Guitar Hero and Rock Band turned ordinary gatherings into raucous rock concerts. Ripping solos to classic rock anthems on five colored buttons brought parents and kids together to jam.',
    promptSuggestion: 'Did you or your kids ever stage living room rock concerts with Guitar Hero or Nintendo Wii sports games?',
    badge: 'Living Room Rock Stars'
  },
  {
    id: 'n-2007-smartphone',
    year: 2007,
    decade: 2000,
    category: 'FADS_TRENDS',
    headline: 'Remember When: The First Touchscreen Smartphone',
    storyContent: 'In June 2007, the very first iPhone went on sale, replacing physical keypads with a multi-touch glass screen and pinching-to-zoom. Long lines wrapped around Apple stores as people marveled at carrying a full computer, camera, and map in their pocket.',
    promptSuggestion: 'Do you remember your first smartphone or touch device? What was the coolest feature you showed off to friends?',
    badge: 'Multi-Touch Revolution'
  },
  {
    id: 'n-2008-election',
    year: 2008,
    decade: 2000,
    category: 'BIG_NEWS',
    headline: 'Big News: Historic 2008 Presidential Election & NASA Mars Phoenix',
    storyContent: 'In November 2008, millions of citizens lined up for hours at polling stations across America in record numbers for a historic presidential election. Earlier that year, NASA’s Phoenix Mars Lander confirmed the presence of water ice on the Red Planet, capturing headlines worldwide.',
    promptSuggestion: 'Do you remember where you watched the historic 2008 election returns or other major civic moments with your family?',
    badge: 'Historic Voter Turnout'
  },
  {
    id: 'n-2008-popmusic',
    year: 2008,
    decade: 2000,
    category: 'POP_CULTURE',
    headline: 'Remember When: Single Ladies & The Late-2000s Pop Explosion',
    storyContent: 'In 2008, pop music entered a vibrant new dance era with Lady Gaga’s "Just Dance," Beyoncé’s iconic "Single Ladies (Put a Ring on It)" music video dance routine, and Coldplay’s "Viva La Vida." Viral dance tributes and digital music downloads on iTunes were at an all-time peak.',
    promptSuggestion: 'What songs from the 2000s immediately get you humming or remind you of road trips and celebrations with friends?',
    badge: '#1 Hit: "Viva La Vida"'
  },
  {
    id: 'n-2009-prices',
    year: 2009,
    decade: 2000,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2009',
    storyContent: 'In 2009, a gallon of gas averaged $2.35, a postage stamp was 44 cents, a movie ticket was $7.50, and the median family income in the US was $50,221. Digital cameras and GPS navigation units on windshields were at the height of their popularity.',
    promptSuggestion: 'What technological convenience from the 2000s are you most grateful for today?',
    badge: 'Gas: $2.35 / gal · Stamp: 44¢'
  },

  // --- 2010s ---
  {
    id: 'n-2010-instagram',
    year: 2010,
    decade: 2010,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Square Photos & Early Vintage Filters',
    storyContent: 'In October 2010, Instagram launched on smartphones, inspiring millions to snap square photos of latte art, golden-hour sunsets, and family pets using warm retro filters like Earlybird and Valencia, transforming everyday smartphone snapshots into artistic keepsakes.',
    promptSuggestion: 'When did you first start taking most of your family photos on a phone instead of a dedicated camera?',
    badge: 'The Photo Filter Craze'
  },
  {
    id: 'n-2011-finale',
    year: 2011,
    decade: 2010,
    category: 'MOVIES_TV',
    headline: 'Remember When: Harry Potter Finale & Game of Thrones Premiere',
    storyContent: 'In 2011, a decade of cinematic storytelling culminated with "Harry Potter and the Deathly Hallows – Part 2," bringing tears and cheers to sold-out theaters worldwide. That same spring, "Game of Thrones" made its debut on HBO, launching an unforgettable decade of fantasy television.',
    promptSuggestion: 'Which grand book or movie series finale made the biggest lasting impression on you?',
    badge: 'End of a Cinema Era'
  },
  {
    id: 'n-2012-curiosity',
    year: 2012,
    decade: 2010,
    category: 'BIG_NEWS',
    headline: 'Big News: NASA Curiosity Rover Lands on Mars via Sky Crane',
    storyContent: 'On August 6, 2012, millions watched NASA’s live broadcast in suspense during the "Seven Minutes of Terror" as the Curiosity rover successfully touched down in Gale Crater on Mars using a daring rocket-powered sky crane maneuver, sending back breathtaking high-definition color vistas of the Martian landscape.',
    promptSuggestion: 'Did you tune in to watch live science discoveries or space landings over the years? What was the most thrilling one you saw?',
    badge: 'Seven Minutes of Terror'
  },
  {
    id: 'n-2012-streaming',
    year: 2012,
    decade: 2010,
    category: 'POP_CULTURE',
    headline: 'Remember When: Binge-Watching & Red Envelopes',
    storyContent: 'By 2012, red DVD envelopes in the mailbox were quickly giving way to instant video streaming. "Binge-watching" entire seasons over a single weekend became a beloved pastime as smart TVs and tablets filled living rooms everywhere.',
    promptSuggestion: 'What was the first television show you remember binge-watching multiple episodes of in a row?',
    badge: 'The Streaming Era'
  },
  {
    id: 'n-2014-popera',
    year: 2014,
    decade: 2010,
    category: 'POP_CULTURE',
    headline: 'Remember When: Taylor Swift’s 1989 & Streaming Playlists',
    storyContent: 'In autumn 2014, Taylor Swift released her landmark pop album "1989" with smash hits "Shake It Off" and "Blank Space," selling over one million copies in its first week. Music lovers were officially trading MP3 files for personalized streaming playlists and wireless Bluetooth speakers.',
    promptSuggestion: 'What is your favorite go-to album or artist when you want an instant burst of joy and energy?',
    badge: 'Album of the Year: "1989"'
  },
  {
    id: 'n-2015-prices',
    year: 2015,
    decade: 2010,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2015',
    storyContent: 'In 2015, a gallon of regular gasoline averaged $2.40, a first-class postage stamp was 49 cents, a standard Netflix subscription was $8.99 a month, and the median home price in the United States was $296,000. Ride-sharing apps and food delivery on demand were becoming part of everyday life.',
    promptSuggestion: 'What modern convenience from the 2010s (like ride-sharing or grocery delivery) has changed your everyday routine the most?',
    badge: 'Gas: $2.40 / gal · Netflix: $8.99'
  },
  {
    id: 'n-2016-strangerthings',
    year: 2016,
    decade: 2010,
    category: 'MOVIES_TV',
    headline: 'Remember When: Stranger Things & The 80s Nostalgia Wave',
    storyContent: 'In July 2016, "Stranger Things" took the world by storm, transporting audiences back to 1983 Hawkins, Indiana with walkie-talkies, Dungeons & Dragons, synthwave soundtracks, and Eggo waffles. It sparked a worldwide renaissance of 80s pop culture, fashion, and vintage synthesizers.',
    promptSuggestion: 'What was your favorite childhood neighborhood adventure—riding bikes until streetlights came on, or exploring local woods?',
    badge: 'Global Streaming Phenomenon'
  },
  {
    id: 'n-2016-pokemongo',
    year: 2016,
    decade: 2010,
    category: 'FADS_TRENDS',
    headline: 'Remember When: The Pokémon GO Summer Craze',
    storyContent: 'In July 2016, millions of people of all ages spilled out into neighborhood parks, city plazas, and downtown sidewalks holding up their phones to catch augmented-reality creatures in Pokémon GO. Strangers made friends at PokéStops, walking miles together in what became the ultimate outdoor summer trend.',
    promptSuggestion: 'Did you or your family participate in the Pokémon GO summer walking craze or other outdoor gaming fads?',
    badge: 'Summer 2016 Phenomenon'
  },
  {
    id: 'n-2017-eclipse',
    year: 2017,
    decade: 2010,
    category: 'BIG_NEWS',
    headline: 'Big News: The Great American Total Solar Eclipse',
    storyContent: 'On August 21, 2017, a total solar eclipse swept across North America from Oregon to South Carolina. Millions of families, students, and travelers gathered in the path of totality wearing cardboard eclipse glasses, cheering as the moon completely blocked the sun for over two minutes of midday twilight.',
    promptSuggestion: 'Where were you during the 2017 or 2024 solar eclipses? Did you look through protective glasses or pinhole viewers with loved ones?',
    badge: 'Coast-to-Coast Totality'
  },
  {
    id: 'n-2017-smartfads',
    year: 2017,
    decade: 2010,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Fidget Spinners & Smart Home Speakers',
    storyContent: 'In 2017, ball-bearing fidget spinners became an overnight global sensation, with toy store shelves emptying as kids and adults spun them on desktops and fingertips. Meanwhile, hands-free smart home speakers like Amazon Echo and Google Home found their way onto kitchen counters across the nation.',
    promptSuggestion: 'Do you use voice assistants or smart home devices today to play music or check the weather?',
    badge: 'Fidget Spinner & Smart Home Boom'
  },
  {
    id: 'n-2018-prices',
    year: 2018,
    decade: 2010,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2018',
    storyContent: 'In 2018, regular gas cost an average of $2.72 per gallon, a postage stamp was 50 cents, a movie ticket was $9.11, and the average price of a cup of specialty coffee hovered around $3.50. Wireless AirPods and noise-canceling headphones were rapidly replacing corded earphones.',
    promptSuggestion: 'When did you first cut the cord on cable TV or switch from wired headphones to wireless earbuds?',
    badge: 'Gas: $2.72 / gal · Stamp: 50¢'
  },
  {
    id: 'n-2019-blackhole',
    year: 2019,
    decade: 2010,
    category: 'BIG_NEWS',
    headline: 'Big News: First Direct Image of a Black Hole Revealed',
    storyContent: 'On April 10, 2019, scientists from the global Event Horizon Telescope collaboration unveiled the historic first-ever direct photograph of a supermassive black hole at the center of the Messier 87 galaxy, 55 million light-years away. The glowing fiery ring captivated humanity and verified Einstein’s theories.',
    promptSuggestion: 'Which major scientific or astronomical discoveries over your lifetime have sparked your greatest sense of wonder?',
    badge: 'Historic Astrophysical Feat'
  },
  {
    id: 'n-2019-avengers',
    year: 2019,
    decade: 2010,
    category: 'MOVIES_TV',
    headline: 'Remember When: Avengers: Endgame Shattered Box Office History',
    storyContent: 'In April 2019, "Avengers: Endgame" arrived as the grand climax of 22 interconnected Marvel films over 11 years, grossing over $1.2 billion in its opening weekend alone. Theaters ran 24-hour round-the-clock screenings as crowds cheered and wept together during the iconic "Avengers Assemble" battle.',
    promptSuggestion: 'What is the most energetic, crowd-cheering movie theater crowd you have ever experienced in person?',
    badge: '$2.79 Billion Worldwide'
  },

  // --- 2020s ---
  {
    id: 'n-2020-mandalorian',
    year: 2020,
    decade: 2020,
    category: 'MOVIES_TV',
    headline: 'Remember When: The Mandalorian & "Baby Yoda" Stole Our Hearts',
    storyContent: 'In 2020, television viewers were charmed by the quiet bounty hunter and the adorable green Child ("Grogu" / "Baby Yoda") on "The Mandalorian." Fans greeted each Friday with excitement to hear the iconic catchphrase, "This is the Way," making family streaming nights the highlight of the week.',
    promptSuggestion: 'What comforting TV shows, movies, or comfort foods helped bring your family joy and peace during 2020?',
    badge: '"This is the Way"'
  },
  {
    id: 'n-2020-trends',
    year: 2020,
    decade: 2020,
    category: 'FADS_TRENDS',
    headline: 'Remember When: Sourdough Starters, Whipped Coffee & Island Getaways',
    storyContent: 'In 2020, kitchens smelled of freshly baked sourdough loaves, glasses were filled with frothy whipped Dalgona coffee, and millions tended peaceful virtual islands in "Animal Crossing: New Horizons." Creative hobbies, family board games, and balcony music brought people together across distances.',
    promptSuggestion: 'Did you pick up any new hobbies or cooking recipes (like bread baking or puzzles) during the stay-at-home period of 2020?',
    badge: 'Comfort Hobbies & Virtual Islands'
  },
  {
    id: 'n-2021-marsrover',
    year: 2021,
    decade: 2020,
    category: 'BIG_NEWS',
    headline: 'Big News: Perseverance Lands on Mars & Ingenuity Flies',
    storyContent: 'On February 18, 2021, NASA’s Perseverance rover touched down in Mars’s Jezero Crater, followed two months later by the miniature Ingenuity helicopter making the first powered, controlled flight on another planet. The tiny drone completed 72 flights, opening a whole new era of planetary exploration.',
    promptSuggestion: 'Do you remember watching the rover landing or hearing about the helicopter flying on Mars?',
    badge: 'First Powered Flight on Mars'
  },
  {
    id: 'n-2021-seashanty',
    year: 2021,
    decade: 2020,
    category: 'POP_CULTURE',
    headline: 'Remember When: Sea Shanties & Viral Harmony Waves',
    storyContent: 'In early 2021, a Scottish postman’s rendition of the 19th-century whaling ballad "The Wellerman" ignited an unexpected global sea shanty sensation. Millions of vocalists, instrumentalists, and choirs worldwide layered their harmonies online, proving that great traditional melodies never truly fade.',
    promptSuggestion: 'What surprising songs or unexpected musical trends have you found yourself singing along to in recent years?',
    badge: 'Global "Wellerman" Craze'
  },
  {
    id: 'n-2022-webbtelescope',
    year: 2022,
    decade: 2020,
    category: 'BIG_NEWS',
    headline: 'Big News: NASA’s James Webb Telescope Unveils the Deep Cosmos',
    storyContent: 'In July 2022, NASA released the first full-color infrared images from the James Webb Space Telescope, capturing glittering deep fields containing thousands of ancient galaxies formed over 13 billion years ago. The sparkling Carina Nebula and cosmic dust pillars left humanity in awe.',
    promptSuggestion: 'What are your favorite memories of looking up at the stars, meteor showers, or night skies with someone special?',
    badge: 'Deep Field Cosmic Clarity'
  },
  {
    id: 'n-2022-topgun',
    year: 2022,
    decade: 2020,
    category: 'MOVIES_TV',
    headline: 'Remember When: Top Gun: Maverick Revived the Box Office',
    storyContent: 'In summer 2022, Tom Cruise returned to the cockpit in "Top Gun: Maverick," 36 years after the original 1986 classic. With jaw-dropping real cockpit flight cinematography and Lady Gaga’s "Hold My Hand," the film grossed nearly $1.5 billion, celebrating the timeless magic of the big screen.',
    promptSuggestion: 'Did you see Top Gun in 1986, Top Gun: Maverick in 2022, or both? What was your favorite scene?',
    badge: '$1.49B Box Office Champion'
  },
  {
    id: 'n-2022-prices',
    year: 2022,
    decade: 2020,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2022: A Year of Shifting Prices',
    storyContent: 'In 2022, nationwide gas prices peaked at an average of $3.95 per gallon (reaching over $5 in several states), a first-class postage stamp was 60 cents, and electric vehicles surged past 5% of all new car sales in America. Smart watches and digital tap-to-pay became standard everywhere.',
    promptSuggestion: 'Do you remember any particular years where price jumps in gas, groceries, or housing stood out clearly in your memory?',
    badge: 'Gas: $3.95 / gal · Stamp: 60¢'
  },
  {
    id: 'n-2023-stadiumtours',
    year: 2023,
    decade: 2020,
    category: 'POP_CULTURE',
    headline: 'Remember When: The Eras Tour & Stadium Concert Boom',
    storyContent: 'In 2023, live concerts reached unprecedented cultural heights as Taylor Swift’s Eras Tour and Beyoncé’s Renaissance World Tour sold out football stadiums across the globe. Fans traded handmade beaded friendship bracelets, dressed in elaborate themed outfits, and boosted local economies in every host city.',
    promptSuggestion: 'What is the most incredible live concert or musical festival you have ever attended in your life?',
    badge: 'Friendship Bracelets & Stadiums'
  },
  {
    id: 'n-2023-barbenheimer',
    year: 2023,
    decade: 2020,
    category: 'MOVIES_TV',
    headline: 'Remember When: The "Barbenheimer" Double-Feature Phenomenon',
    storyContent: 'On July 21, 2023, Greta Gerwig’s vibrant "Barbie" and Christopher Nolan’s intense "Oppenheimer" opened on the exact same day, sparking the viral "Barbenheimer" double-feature craze. Millions wore bright pink outfits to morning screenings before settling into IMAX auditoriums for historical drama.',
    promptSuggestion: 'Did you or anyone you know take part in the Barbenheimer movie weekend? What was the energy in the cinema like?',
    badge: 'Summer 2023 Double Feature'
  },
  {
    id: 'n-2023-stanley',
    year: 2023,
    decade: 2020,
    category: 'FADS_TRENDS',
    headline: 'Remember When: The Stanley Quencher Tumbler Obsession',
    storyContent: 'In 2023, the 40-ounce Stanley Adventure Quencher tumbler with its sturdy handle and straw became the must-have lifestyle accessory. Shoppers lined up outside retail stores for limited-edition pastel color drops, carrying their giant hydration cups into offices, gyms, and classrooms.',
    promptSuggestion: 'What is a popular everyday gadget, water bottle, or accessory you find yourself taking everywhere you go?',
    badge: 'The 40oz Quencher Craze'
  },
  {
    id: 'n-2024-eclipse',
    year: 2024,
    decade: 2020,
    category: 'BIG_NEWS',
    headline: 'Big News: The 2024 Great North American Solar Eclipse',
    storyContent: 'On April 8, 2024, a total solar eclipse crossed 15 US states from Texas to Maine, plunging cities into over 4 minutes of daytime darkness. An estimated 32 million people lived directly in the path of totality, sharing a breathtaking view of the sun’s glowing corona with neighbors and friends.',
    promptSuggestion: 'Did you experience the solar eclipse in April 2024? What was the temperature drop and twilight like where you were?',
    badge: '32 Million in Totality Path'
  },
  {
    id: 'n-2024-prices',
    year: 2024,
    decade: 2020,
    category: 'COST_OF_LIVING',
    headline: 'What Things Cost in 2024: The Digital Modern Era',
    storyContent: 'In 2024, regular gas hovered around $3.50 a gallon, a first-class postage stamp reached 68 cents, a standard movie ticket was $10.50, and the median home sales price in the US was $412,000. Digital subscriptions, cloud backups, and smart home tech were staple household budget items.',
    promptSuggestion: 'How has your personal budget or the things you invest in changed compared to when you first started living on your own?',
    badge: 'Gas: $3.50 / gal · Stamp: 68¢'
  }
];

interface SbRememberWhenCardProps {
  onClickAuthorPage?: (initialPrompt?: string) => void;
}

export default function SbRememberWhenCard({ onClickAuthorPage }: SbRememberWhenCardProps) {
  const [activeMbrId, setActiveMbrId] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState<number>(1961);
  const [activeLifeStage, setActiveLifeStage] = useState<LifeStageKey>('TEEN');
  const [activeCategory, setActiveCategory] = useState<NostalgiaCategory>('ALL');
  const [currentItem, setCurrentItem] = useState<NostalgiaItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<NostalgiaItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState<boolean>(false);
  const [customYearInput, setCustomYearInput] = useState<string>('1961');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Load member details & determine birth year
  useEffect(() => {
    const resolveMemberData = async () => {
      let resolvedYear = 1961;

      // 1. Check session storage stored member
      const storedMbr = userManager.getStoredMember();
      if (storedMbr) {
        if (storedMbr.mbrId) setActiveMbrId(storedMbr.mbrId);
        if (storedMbr.mbrBirthDate) {
          const parsedYear = new Date(storedMbr.mbrBirthDate).getFullYear();
          if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
            resolvedYear = parsedYear;
          }
        }
      }

      // 2. Fallback check for session user / sandbox
      try {
        const u = await userManager.getCurrentUser();
        if (u.success && u.member) {
          if (u.member.mbrId) setActiveMbrId(u.member.mbrId);
          if (u.member.mbrBirthDate) {
            const parsedYear = new Date(u.member.mbrBirthDate).getFullYear();
            if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
              resolvedYear = parsedYear;
            }
          }
        } else if (u.user?.user_id) {
          const mbrProfile = await taskApi.getMemberByUserId(u.user.user_id);
          if (mbrProfile) {
            if (mbrProfile.mbrId) setActiveMbrId(mbrProfile.mbrId);
            if (mbrProfile.mbrBirthDate) {
              const parsedYear = new Date(mbrProfile.mbrBirthDate).getFullYear();
              if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
                resolvedYear = parsedYear;
              }
            }
          }
        }
      } catch (err) {
        // use fallback resolvedYear
      }

      // 3. Check sandbox profile
      try {
        const sandboxData = sessionStorage.getItem('sandbox_mbr');
        if (sandboxData) {
          const parsed = JSON.parse(sandboxData);
          if (parsed.mbrBirthDate) {
            const parsedYear = new Date(parsed.mbrBirthDate).getFullYear();
            if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
              resolvedYear = parsedYear;
            }
          }
        }
      } catch {
        // ignore
      }

      setBirthYear(resolvedYear);
      setCustomYearInput(resolvedYear.toString());
    };

    resolveMemberData();
  }, []);

  // Load saved favorites & history from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('sb_remember_when_favs');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedHist = localStorage.getItem('sb_remember_when_hist');
      if (savedHist) {
        setHistoryItems(JSON.parse(savedHist));
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute the exact target years range for each life stage based on birth year
  const lifeStageRanges = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;

    return LIFE_STAGES.map((stage) => {
      let startYear: number;
      let endYear: number;

      if (stage.key === 'BORN') {
        startYear = birthYear;
        endYear = birthYear;
      } else {
        startYear = birthYear + stage.minAge;
        endYear = birthYear + stage.maxAge;
      }

      const isLived = currentAge >= stage.minAge;

      return {
        ...stage,
        startYear,
        endYear,
        rangeLabel: stage.key === 'BORN' ? `${birthYear}` : `${startYear}–${endYear}`,
        isLived,
      };
    });
  }, [birthYear]);

  // Current active stage range
  const currentStageRange = useMemo(() => {
    return lifeStageRanges.find((s) => s.key === activeLifeStage) || lifeStageRanges[0];
  }, [lifeStageRanges, activeLifeStage]);

  // Filter items matching the current life stage era & category with accurate proximity matching
  const matchingItems = useMemo(() => {
    const startYr = currentStageRange.startYear;
    const endYr = currentStageRange.endYear;
    const midYr = Math.round((startYr + endYr) / 2);

    // 1. Direct matches: item.year falls within the life stage range (+/- 2 years) and category matches
    let filtered = NOSTALGIA_DATABASE.filter((item) => {
      const yearMatch = item.year >= startYr - 2 && item.year <= endYr + 2;
      const catMatch = activeCategory === 'ALL' || item.category === activeCategory;
      return yearMatch && catMatch;
    });

    // 2. If no exact match for this category in narrow window, expand to +/- 5 years with category match
    if (filtered.length === 0) {
      filtered = NOSTALGIA_DATABASE.filter((item) => {
        const yearMatch = item.year >= startYr - 5 && item.year <= endYr + 5;
        const catMatch = activeCategory === 'ALL' || item.category === activeCategory;
        return yearMatch && catMatch;
      });
    }

    // 3. If still no match in category, look in the target decade (+/- 10 years) with category match
    if (filtered.length === 0) {
      filtered = NOSTALGIA_DATABASE.filter((item) => {
        const yearDiff = Math.abs(item.year - midYr);
        const catMatch = activeCategory === 'ALL' || item.category === activeCategory;
        return yearDiff <= 12 && catMatch;
      });
    }

    // 4. If category has no match near the era, fall back to ANY category from the exact same era (+/- 5 years)
    if (filtered.length === 0) {
      filtered = NOSTALGIA_DATABASE.filter((item) => {
        return item.year >= startYr - 5 && item.year <= endYr + 5;
      });
    }

    // 5. Ultimate fallback: find items in the database closest in year to this era's midpoint (within closest decade)
    if (filtered.length === 0) {
      const sortedByProximity = [...NOSTALGIA_DATABASE].sort(
        (a, b) => Math.abs(a.year - midYr) - Math.abs(b.year - midYr)
      );
      const closestYear = sortedByProximity[0]?.year || midYr;
      filtered = sortedByProximity.filter((item) => Math.abs(item.year - closestYear) <= 6);
    }

    return filtered.length > 0 ? filtered : NOSTALGIA_DATABASE;
  }, [currentStageRange, activeCategory]);

  // Record item into browsing history
  const recordHistory = (item: NostalgiaItem) => {
    setHistoryItems((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [item, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('sb_remember_when_hist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Pick or cycle current item when life stage, category, or birth year changes
  useEffect(() => {
    if (matchingItems.length > 0) {
      // Pick a random item from matching items
      const randomIndex = Math.floor(Math.random() * matchingItems.length);
      const selected = matchingItems[randomIndex];
      setCurrentItem(selected);
      recordHistory(selected);
    }
  }, [activeLifeStage, activeCategory, birthYear]);

  // Next / Surprise Me generator (strictly stays within era-appropriate items)
  const handleSurpriseMe = () => {
    if (matchingItems.length === 0) return;

    // Filter out current item from candidates if more than 1 option exists
    const available = matchingItems.filter((i) => i.id !== currentItem?.id);
    const pool = available.length > 0 ? available : matchingItems;
    const nextItem = pool[Math.floor(Math.random() * pool.length)];

    if (nextItem) {
      setCurrentItem(nextItem);
      recordHistory(nextItem);
    }
  };

  // AI-powered nostalgia story generation (records tokens in mbrAiUsageLog)
  const handleGenerateWithAi = async () => {
    let mbrId = activeMbrId;
    if (!mbrId) {
      const storedMbr = userManager.getStoredMember();
      mbrId = storedMbr?.mbrId || null;
    }
    if (!mbrId) {
      try {
        const u = await userManager.getCurrentUser();
        if (u.member?.mbrId) mbrId = u.member.mbrId;
      } catch {
        // ignore
      }
    }
    if (!mbrId) {
      handleSurpriseMe();
      return;
    }

    setIsGeneratingAi(true);
    try {
      const startYr = currentStageRange.startYear;
      const endYr = currentStageRange.endYear;
      const randomYearInStage = Math.floor(Math.random() * (endYr - startYr + 1)) + startYr;

      const aiItem = await mbrRememberWhenApi.generateAiMemory(mbrId, {
        birthYear,
        lifeStage: activeLifeStage,
        lifeStageLabel: currentStageRange.label,
        targetYear: randomYearInStage,
        category: activeCategory
      });

      if (aiItem && aiItem.storyContent) {
        setCurrentItem(aiItem);
        recordHistory(aiItem);
      } else {
        handleSurpriseMe();
      }
    } catch (err) {
      console.warn('AI memory generation fallback to local archive:', err);
      handleSurpriseMe();
    } finally {
      setIsGeneratingAi(false);
    }
  };


  // Toggle favorite
  const handleToggleFavorite = () => {
    if (!currentItem) return;
    const isFav = favorites.includes(currentItem.id);
    const updated = isFav
      ? favorites.filter((id) => id !== currentItem.id)
      : [...favorites, currentItem.id];
    setFavorites(updated);
    try {
      localStorage.setItem('sb_remember_when_favs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle custom year save
  const handleSaveCustomYear = (e: React.FormEvent) => {
    e.preventDefault();
    const yr = parseInt(customYearInput, 10);
    if (!isNaN(yr) && yr >= 1910 && yr <= new Date().getFullYear()) {
      setBirthYear(yr);
      setShowSettingsPopover(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POP_CULTURE':
        return <Music className="w-3.5 h-3.5 text-rose-500" />;
      case 'BIG_NEWS':
        return <Newspaper className="w-3.5 h-3.5 text-blue-500" />;
      case 'MOVIES_TV':
        return <Tv className="w-3.5 h-3.5 text-purple-500" />;
      case 'FADS_TRENDS':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'COST_OF_LIVING':
        return <DollarSign className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'POP_CULTURE':
        return 'Pop Culture & Music';
      case 'BIG_NEWS':
        return 'Big News Headline';
      case 'MOVIES_TV':
        return 'Cinema & Television';
      case 'FADS_TRENDS':
        return 'Fads & Everyday Life';
      case 'COST_OF_LIVING':
        return 'What Things Cost';
      default:
        return 'Flashback';
    }
  };

  const isCurrentFavorite = currentItem ? favorites.includes(currentItem.id) : false;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Accent Gradient Header Line (Warm Nostalgia Coral / Amber) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />

      <div className="p-5 md:p-6 space-y-4">
        {/* Header Section with Badges, Year Adjuster, and Quick Action Icons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/70 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Remember When?
            </span>

            {currentItem && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {getCategoryIcon(currentItem.category)}
                {getCategoryLabel(currentItem.category)}
              </span>
            )}

            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]" title={`Era: ${currentStageRange.rangeLabel}`}>
              · {currentStageRange.label} ({currentStageRange.rangeLabel})
            </span>
          </div>

          {/* Top-Right Utility Actions: Birth Year Config, Favorite, History */}
          <div className="flex items-center gap-1">
            {/* Birth Year / Era Adjuster Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                title={`Born in ${birthYear} · Click to adjust era`}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline font-medium text-slate-600">Born {birthYear}</span>
              </button>

              {/* Adjust Birth Year Popover */}
              {showSettingsPopover && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-fade-in text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Adjust Your Birth Year</span>
                    <button
                      onClick={() => setShowSettingsPopover(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Personalize the nostalgia timeline for when you were a teen, in your 20s, or growing up.
                  </p>
                  <form onSubmit={handleSaveCustomYear} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="number"
                      min="1910"
                      max={new Date().getFullYear()}
                      value={customYearInput}
                      onChange={(e) => setCustomYearInput(e.target.value)}
                      placeholder="e.g. 1961"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shrink-0"
                    >
                      Set
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Favorite Button */}
            {currentItem && (
              <button
                onClick={handleToggleFavorite}
                title={isCurrentFavorite ? 'Remove from Saved Memories' : 'Save this Memory'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isCurrentFavorite
                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isCurrentFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            {/* History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              title="Past Memories & Almanac"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Memories</span>
            </button>
          </div>
        </div>

        {/* Life Stage Tabs Selector (When You Were a Teen, 20s, Childhood, etc.) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
          {lifeStageRanges.map((stage) => {
            const isActive = activeLifeStage === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => setActiveLifeStage(stage.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span>{stage.emoji}</span>
                <span>{stage.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-rose-100' : 'text-slate-400 font-normal'}`}>
                  ({stage.rangeLabel})
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filters (Pop Culture, Big News, Movies, Trends, Prices) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {(
            [
              { key: 'ALL', label: 'All Topics', icon: <Sparkles className="w-3 h-3" /> },
              { key: 'POP_CULTURE', label: '🎵 Pop Culture & Music', icon: null },
              { key: 'BIG_NEWS', label: '📰 Big News of the Times', icon: null },
              { key: 'MOVIES_TV', label: '📺 Movies & TV', icon: null },
              { key: 'FADS_TRENDS', label: '🕹️ Fads & Trends', icon: null },
              { key: 'COST_OF_LIVING', label: '💰 What Things Cost', icon: null },
            ] as const
          ).map((cat) => {
            const isCatActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                  isCatActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Nostalgia Content Card */}
        {currentItem ? (
          <div className="space-y-3.5 pt-1">
            {/* Headline and Year Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 leading-snug">
                  {currentItem.headline}
                </h3>
                {currentItem.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                    {currentItem.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Nostalgic Micro-Article Story Content */}
            <p className="font-serif text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {currentItem.storyContent}
            </p>

            {/* Story Spark / Prompt Suggestion */}
            {currentItem.promptSuggestion && (
              <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg shrink-0 mt-0.5">
                  <Feather className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <span>Memory Spark</span>
                    <span className="text-[10px] font-normal text-rose-700 lowercase">· your turn to tell the story</span>
                  </div>
                  <p className="text-xs md:text-sm text-rose-950 font-serif leading-relaxed italic">
                    "{currentItem.promptSuggestion}"
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm text-slate-500">No memories found for this category.</p>
            <button
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Discover Another
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              if (onClickAuthorPage) {
                onClickAuthorPage(currentItem?.promptSuggestion || currentItem?.headline);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs md:text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <Feather className="w-3.5 h-3.5" />
            Write Story About This
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateWithAi}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition-colors disabled:opacity-50"
              title="Generate a personalized nostalgic memory using AI"
            >
              <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              {isGeneratingAi ? 'Generating...' : 'AI Flashback'}
            </button>

            <button
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Next Memory
            </button>
          </div>
        </div>
      </div>

      {/* Memories & History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-rose-600" />
                <h4 className="font-serif font-bold text-lg text-slate-900">Your Nostalgia Almanac History</h4>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
              {historyItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500 font-serif">
                  No previous nostalgia articles viewed yet. Flip through memories to build your collection!
                </div>
              ) : (
                historyItems.map((item) => {
                  const isFav = favorites.includes(item.id);
                  return (
                    <div key={item.id} className="pt-3.5 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {getCategoryIcon(item.category)}
                          {getCategoryLabel(item.category)} · {item.year}
                        </span>
                        {isFav && (
                          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <BookmarkCheck className="w-3.5 h-3.5" /> Favorite
                          </span>
                        )}
                      </div>

                      <h5 className="font-serif font-bold text-base text-slate-900 leading-snug">
                        {item.headline}
                      </h5>

                      <p className="text-xs md:text-sm text-slate-600 font-serif line-clamp-3 leading-relaxed">
                        {item.storyContent}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.badge || `Decade: ${item.decade}s`}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentItem(item);
                            setShowHistoryModal(false);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          View Full Memory <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <AdminComponentTag name="SbRememberWhenCard" />
    </div>
  );
}
