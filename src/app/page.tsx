'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  heroes, factions, items, emblemBuilds, battleSpells, heroCombos, teamComps,
  gameModes, tournaments, articles, skins, quizQuestions, rankedTiers, heroCounters
} from '@/data/mlbb-data';
import type { Hero, Faction, Item, Skin, HeroCombo, TeamComp } from '@/data/mlbb-data';
import {
  Home, Users, Trophy, TrendingUp, Map, BookOpen, PenTool, Wrench,
  Swords, FileText, Award, Palette, HelpCircle, Search, ChevronRight,
  ChevronDown, ChevronUp, Star, Shield, Zap, Target, Heart, Crosshair,
  Crown, Timer, Calendar, MapPin, DollarSign, ArrowUp, ArrowDown,
  Minus, Filter, X, Send, RotateCcw, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Flame, Snowflake, Ghost, Dragon, Sword, Skull, Eye, CircleDot,
  ArrowLeft, ArrowRight, Plus, MinusCircle, Layers
} from 'lucide-react';

// ======== CONSTANTS ========
const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'heroes', label: 'Heroes', icon: Users },
  { id: 'tier-list', label: 'Tier List', icon: Trophy },
  { id: 'meta', label: 'Meta Tracker', icon: TrendingUp },
  { id: 'lore', label: 'Lore', icon: Map },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'blog', label: 'Blog', icon: PenTool },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'matchups', label: 'Matchups', icon: Swords },
  { id: 'patches', label: 'Patches', icon: FileText },
  { id: 'esports', label: 'Esports', icon: Award },
  { id: 'skins', label: 'Skins', icon: Palette },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
] as const;

type TabId = typeof TABS[number]['id'];
type HeroRole = Hero['role'];

const ROLE_COLORS: Record<HeroRole, string> = {
  Tank: '#2196f3', Fighter: '#ff9800', Assassin: '#f44336',
  Mage: '#9c27b0', Marksman: '#ffd700', Support: '#4caf50',
};

const ROLE_ICONS: Record<HeroRole, React.ReactNode> = {
  Tank: <Shield size={14} />, Fighter: <Sword size={14} />, Assassin: <Crosshair size={14} />,
  Mage: <Sparkles size={14} />, Marksman: <Target size={14} />, Support: <Heart size={14} />,
};

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D'] as const;
const TIER_COLORS: Record<string, string> = { S: '#ffd700', A: '#4caf50', B: '#2196f3', C: '#9e9e9e', D: '#f44336' };

const ROLES: HeroRole[] = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const ALL_ROLES = ['All', ...ROLES] as const;

const RARITY_ORDER = ['Collector', 'Legend', 'Epic', 'Special', 'Elite', 'Normal'] as const;
const RARITY_COLORS: Record<string, string> = {
  Collector: 'rarity-collector', Legend: 'rarity-legend', Epic: 'rarity-epic',
  Special: 'rarity-special', Elite: 'rarity-elite', Normal: 'rarity-normal',
};

// Generate meta stats for heroes
function generateHeroMetaStats() {
  return heroes.map(h => {
    const tierMultiplier = { S: 1.15, A: 1.05, B: 0.95, C: 0.85, D: 0.75 }[h.tier] || 1;
    const rolePopularity = { Jungle: 1.1, Mid: 1.05, Gold: 1.0, EXP: 0.95, Roam: 0.9 }[h.lane] || 1;
    const baseWR = 48 + tierMultiplier * 4 + (h.difficulty >= 4 ? -1.5 : 0);
    const basePR = (40 + tierMultiplier * 20 + rolePopularity * 5);
    const baseBR = Math.max(0, tierMultiplier * 30 - (h.difficulty >= 4 ? 15 : 5));
    const trend = h.tier === 'S' ? 'up' as const : h.tier === 'A' ? 'stable' as const : h.tier === 'D' ? 'down' as const : 'stable' as const;
    return { ...h, winRate: Math.round(baseWR * 10) / 10, pickRate: Math.round(basePR * 10) / 10, banRate: Math.round(baseBR * 10) / 10, trend };
  });
}
const heroMetaStats = generateHeroMetaStats();

const PATCH_NOTES = [
  { id: 'p1', version: '1.8.96', date: '2025-05-01', title: 'Tank Rework & Assassin Nerfs',
    heroChanges: [
      { hero: 'Atlas', type: 'Buff' as const, changes: ['Ultimate cooldown reduced by 15%', 'Base HP increased by 150'] },
      { hero: 'Khufra', type: 'Buff' as const, changes: ['Skill 2 bounce speed increased', 'Damage scaling improved'] },
      { hero: 'Saber', type: 'Nerf' as const, changes: ['Ultimate base damage reduced by 8%'] },
      { hero: 'Hayabusa', type: 'Nerf' as const, changes: ['Shuriken scaling adjusted to favor extended fights'] },
      { hero: 'Gusion', type: 'Adjustment' as const, changes: ['Early game damage slightly reduced', 'Late game scaling increased'] },
      { hero: 'Yu Zhong', type: 'Adjustment' as const, changes: ['Dragon form HP regen reduced by 10%', 'Base damage increased by 5%'] },
    ],
    itemChanges: [
      { item: 'Brute Force Breastplate', type: 'Buff' as const, changes: ['Physical damage reduction increased to 8%'] },
      { item: 'Dominance Ice', type: 'Buff' as const, changes: ['Now provides 10% CDR at base'] },
      { item: 'Immortality', type: 'Buff' as const, changes: ['Resurrection HP increased from 15% to 20%'] },
    ],
    systemChanges: ['Improved matchmaking algorithm for ranked', 'New report categories added', 'FPS optimization for mid-range devices'],
    newHeroes: ['Obsidia'], newSkins: ['Dragon Emperor Yu Zhong']
  },
  { id: 'p2', version: '1.8.88', date: '2025-03-15', title: 'Season 32 Update',
    heroChanges: [
      { hero: 'Ling', type: 'Adjustment' as const, changes: ['Wall climb speed slightly reduced', 'Ultimate damage increased by 5%'] },
      { hero: 'Claude', type: 'Nerf' as const, changes: ['Bonus gold from passive reduced by 15%'] },
      { hero: 'Mathilda', type: 'Buff' as const, changes: ['Shield amount increased by 10%'] },
      { hero: 'Wanwan', type: 'Adjustment' as const, changes: ['Crosshair placement speed slightly faster'] },
    ],
    itemChanges: [
      { item: 'Divine Glaive', type: 'Adjustment' as const, changes: ['Magic penetration reduced from 45% to 40%'] },
    ],
    systemChanges: ['New ranked season rewards', 'Draft pick improvements', 'Emblem balance adjustments'],
    newSkins: ['Scarlet Phantom Brody', 'Soul Taker Ling']
  },
  { id: 'p3', version: '1.8.80', date: '2025-01-20', title: 'New Year Celebration',
    heroChanges: [
      { hero: 'Kagura', type: 'Buff' as const, changes: ['Skill 1 cooldown reduced by 1 second'] },
      { hero: 'Benedetta', type: 'Nerf' as const, changes: ['Skill 2 dash range slightly reduced'] },
    ],
    itemChanges: [],
    systemChanges: ['New Year events and rewards', 'Magic Chess balance patch', 'Brawl mode hero pool updated'],
    newHeroes: [], newSkins: ['Lightborn Striker Alucard (Collector)']
  },
];

const MAP_REGIONS = [
  { id: 'moniyan', name: 'Moniyan Empire', faction: 'Moniyan Empire', color: '#4169E1', desc: 'Seat of power and civilization', heroes: ['Lancelot', 'Tigreal', 'Eudora', 'Alucard'] },
  { id: 'abyss', name: 'The Abyss', faction: 'The Abyss', color: '#4B0082', desc: 'Dark dimension beneath the world', heroes: ['Selena', 'Karina', 'Helcurt'] },
  { id: 'agelta', name: 'Agelta Desert', faction: 'Agelta Desert', color: '#DAA520', desc: 'Ancient sands and hidden secrets', heroes: ['Khufra', 'Barats', 'Esmeralda'] },
  { id: 'north', name: 'North Valley', faction: 'North Valley', color: '#B0E0E6', desc: 'Frozen realm of eternal frost', heroes: ['Aurora', 'Fanny', 'Lylia'] },
  { id: 'cadia', name: 'Cadia Riverlands', faction: 'Cadia Riverlands', color: '#228B22', desc: 'Home of the Moon Elves', heroes: ['Miya', 'Estes', 'Diggie', 'Floryn'] },
  { id: 'lion-castle', name: 'Lion Castle', faction: 'Lion Castle', color: '#8B0000', desc: 'Where legends are forged', heroes: ['Chou', 'Gusion', 'Benedetta', 'Wanwan'] },
  { id: 'eastern', name: 'Eastern Lands', faction: 'Eastern Lands', color: '#C41E3A', desc: 'Ninja clans and dragon warriors', heroes: ['Hayabusa', 'Ling', 'Kagura', 'Hanabi'] },
  { id: 'shadowlands', name: 'Shadowlands', faction: 'Shadowlands', color: '#2F2F2F', desc: 'Between light and shadow', heroes: ['Granger', 'Brody', 'Lesley', 'Claude'] },
];

const LORE_TIMELINE = [
  { year: -1000, event: 'The Great Creation', desc: 'The World Tree is planted, giving life to the Land of Dawn and connecting all realms.', heroes: [] },
  { year: -500, event: 'Rise of the Abyss', desc: 'The dark dimension beneath the world begins to expand, threatening to consume the surface.', heroes: [] },
  { year: -100, event: 'Founding of the Moniyan Empire', desc: 'The human empire is established, uniting the scattered kingdoms under one banner.', heroes: ['Tigreal'] },
  { year: 0, event: 'The First Demon Invasion', desc: 'Demons from the Abyss attack the surface world. Heroes rise to defend the Land of Dawn.', heroes: ['Alucard', 'Tigreal'] },
  { year: 100, event: 'The Baroque Family Rises', desc: 'The noble Baroque family gains prominence with their legendary swordsmen.', heroes: ['Lancelot', 'Guinevere'] },
  { year: 200, event: 'Eastern Lands Unification', desc: 'The ninja clans and dragon warriors unite against a common threat from the east.', heroes: ['Hayabusa', 'Kagura'] },
  { year: 300, event: 'The Shadow Schism', desc: 'The Shadowlands are formed as a realm between light and dark, creating a new faction.', heroes: ['Granger', 'Brody'] },
  { year: 400, event: 'The Age of Exploration', desc: 'Heroes from all factions begin exploring beyond their borders, leading to new alliances and conflicts.', heroes: ['Franco', 'Layla'] },
  { year: 500, event: 'The Modern Era', desc: 'The current age where heroes from all factions compete in the Land of Dawn.', heroes: ['Ling', 'Wanwan', 'Mathilda', 'Obsidia'] },
];

// ======== HELPER COMPONENTS ========
function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}>{children}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const cls = `tier-${tier.toLowerCase()}`;
  return <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${cls}`}>{tier}</span>;
}

function RoleBadge({ role }: { role: HeroRole }) {
  const cls = `role-${role.toLowerCase()}`;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-white ${cls}`}>{ROLE_ICONS[role]} {role}</span>;
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= level ? 'bg-gold' : 'bg-gray-600'}`} />
      ))}
    </div>
  );
}

function StatBar({ value, max = 100, color = '#ffd700', label }: { value: number; max?: number; color?: string; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full stat-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-gray-300 w-8">{value}</span>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
      />
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="text-gold">{icon}</div>}
      <h2 className="text-2xl font-bold text-white">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
    </div>
  );
}

function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`glass-card p-4 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ======== MAIN PAGE ========
export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [navRef, setNavRef] = useState<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a1a' }}>
      {/* HEADER / NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10" style={{ background: 'rgba(10, 10, 26, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 shrink-0">
              <Crown size={24} className="text-gold" />
              <span className="text-lg font-bold text-gold hidden sm:block">Dawn of Legends</span>
            </button>
            <nav ref={setNavRef} className="nav-scroll flex-1 flex items-center gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-all ${activeTab === tab.id ? 'active text-gold' : 'text-gray-400'}`}
                >
                  <tab.icon size={15} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === 'home' && <HomeSection />}
        {activeTab === 'heroes' && <HeroesSection />}
        {activeTab === 'tier-list' && <TierListSection />}
        {activeTab === 'meta' && <MetaSection />}
        {activeTab === 'lore' && <LoreSection />}
        {activeTab === 'guides' && <GuidesSection />}
        {activeTab === 'blog' && <BlogSection />}
        {activeTab === 'tools' && <ToolsSection />}
        {activeTab === 'matchups' && <MatchupsSection />}
        {activeTab === 'patches' && <PatchesSection />}
        {activeTab === 'esports' && <EsportsSection />}
        {activeTab === 'skins' && <SkinsSection />}
        {activeTab === 'quiz' && <QuizSection />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 mt-auto" style={{ background: 'rgba(10, 10, 26, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gold mb-3">Dawn of Legends</h4>
              <p className="text-sm text-gray-400">Your ultimate Mobile Legends: Bang Bang companion. Guides, tier lists, tools, and more.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Database</h4>
              <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                <span>{heroes.length}+ Heroes</span><span>{items.length} Items</span><span>{skins.length} Skins</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Community</h4>
              <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                <span>Blog & Guides</span><span>Meta Tracker</span><span>Quiz & Tools</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Esports</h4>
              <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                <span>M-Series Coverage</span><span>Team Rankings</span><span>Patch Analysis</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">© 2025 Dawn of Legends. Not affiliated with Moonton.</p>
            <p className="text-xs text-gray-500">Built with ❤️ for MLBB players</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ======== HOME SECTION ========
function HomeSection() {
  const [heroIdx, setHeroIdx] = useState(0);
  const featuredHeroes = heroes.filter(h => h.tier === 'S').slice(0, 6);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featuredHeroes.length), 4000);
    return () => clearInterval(t);
  }, [featuredHeroes.length]);

  const fh = featuredHeroes[heroIdx];

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="hero-gradient rounded-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} className="text-gold" />
            <span className="text-gold text-sm font-semibold uppercase tracking-wider">Featured Hero</span>
          </div>
          {fh && (
            <>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2">{fh.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <RoleBadge role={fh.role} />
                <TierBadge tier={fh.tier} />
                <span className="text-sm text-gray-300">• {fh.lane} Lane</span>
                <DifficultyDots level={fh.difficulty} />
              </div>
              <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed">{fh.description}</p>
            </>
          )}
          <div className="flex gap-2 mt-6">
            {featuredHeroes.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'bg-gold w-6' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counters */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Heroes', value: heroes.length + '+', icon: <Users size={20} />, color: '#ffd700' },
          { label: 'Roles', value: ROLES.length, icon: <Layers size={20} />, color: '#00bcd4' },
          { label: 'Skins', value: skins.length + '+', icon: <Palette size={20} />, color: '#e91e63' },
          { label: 'Pro Tournaments', value: tournaments.length, icon: <Award size={20} />, color: '#4caf50' },
        ].map(s => (
          <GlassCard key={s.label} className="text-center">
            <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </GlassCard>
        ))}
      </section>

      {/* Quick Links */}
      <section>
        <SectionTitle icon={<Sparkles size={24} />}>Explore</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TABS.filter(t => t.id !== 'home').map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabId)}
              className="glass-card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform text-left">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gold"><tab.icon size={20} /></div>
              <span className="text-sm font-medium text-white">{tab.label}</span>
              <ChevronRight size={16} className="text-gray-500 ml-auto" />
            </button>
          ))}
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section>
        <SectionTitle icon={<PenTool size={24} />}>Latest Articles</SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.slice(0, 3).map(a => (
            <GlassCard key={a.id} className="cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => setActiveTab('blog')}>
              <Badge className={`mb-2 ${a.category === 'Guide' ? 'bg-green-500/20 text-green-400' : a.category === 'Esports' ? 'bg-red-500/20 text-red-400' : a.category === 'Meta' ? 'bg-gold/20 text-gold' : 'bg-purple-500/20 text-purple-400'}`}>{a.category}</Badge>
              <h3 className="font-bold text-white mb-1 line-clamp-2">{a.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{a.excerpt}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                <span className="flex items-center gap-1"><Timer size={12} /> {a.readTime} min</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Ranked Tiers Preview */}
      <section>
        <SectionTitle icon={<Trophy size={24} />}>Ranked Journey</SectionTitle>
        <div className="flex gap-2 overflow-x-auto pb-2 nav-scroll">
          {rankedTiers.map(rt => (
            <div key={rt.name} className="glass-card p-3 min-w-[120px] text-center shrink-0">
              <div className="text-xs font-bold mb-1" style={{ color: rt.color }}>{rt.name}</div>
              {rt.stars && <div className="flex justify-center gap-0.5 mb-1">{Array.from({ length: rt.stars }).map((_, i) => <Star key={i} size={8} fill={rt.color} style={{ color: rt.color }} />)}</div>}
              <div className="text-xs text-gray-500">{rt.percentage}% of players</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ======== HEROES DATABASE ========
function HeroesSection() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'tier' | 'difficulty'>('name');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const filtered = useMemo(() => {
    let result = [...heroes];
    if (search) result = result.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'All') result = result.filter(h => h.role === roleFilter);
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'tier') return TIER_ORDER.indexOf(a.tier as typeof TIER_ORDER[number]) - TIER_ORDER.indexOf(b.tier as typeof TIER_ORDER[number]);
      return a.difficulty - b.difficulty;
    });
    return result;
  }, [search, roleFilter, sortBy]);

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Users size={24} />}>Heroes Database</SectionTitle>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search heroes..." /></div>
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${roleFilter === r ? 'text-gold bg-gold/10 border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent hover:border-white/20'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <span className="text-xs text-gray-500 flex items-center">Sort:</span>
        {(['name', 'tier', 'difficulty'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className={`px-2 py-1 rounded text-xs capitalize ${sortBy === s ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} heroes</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(h => (
          <GlassCard key={h.id} className="cursor-pointer hover:scale-[1.03] transition-all text-center" onClick={() => setSelectedHero(h)}>
            <div className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-3xl font-bold" style={{ background: `linear-gradient(135deg, ${h.imageColor}40, ${h.imageColor}10)`, border: `2px solid ${h.imageColor}50` }}>
              {h.name.charAt(0)}
            </div>
            <h3 className="font-bold text-white text-sm">{h.name}</h3>
            <div className="flex justify-center gap-1.5 mt-1.5">
              <RoleBadge role={h.role} />
              <TierBadge tier={h.tier} />
            </div>
            <div className="flex justify-center mt-1.5"><DifficultyDots level={h.difficulty} /></div>
          </GlassCard>
        ))}
      </div>

      {/* Hero Detail Modal */}
      <Modal open={!!selectedHero} onClose={() => setSelectedHero(null)} title={selectedHero?.name || ''}>
        {selectedHero && <HeroDetail hero={selectedHero} />}
      </Modal>
    </div>
  );
}

function HeroDetail({ hero }: { hero: Hero }) {
  const counters = heroCounters.find(c => c.hero === hero.name);
  const relatedCombos = heroCombos.filter(c => c.hero1 === hero.name || (c as Record<string, unknown>).hero2 === hero.name);
  const factionData = factions.find(f => f.heroes.includes(hero.name));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${hero.imageColor}50, ${hero.imageColor}20)`, border: `2px solid ${hero.imageColor}60` }}>
          {hero.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RoleBadge role={hero.role} />
            <TierBadge tier={hero.tier} />
            <Badge className="bg-white/10 text-gray-300">{hero.lane}</Badge>
          </div>
          <p className="text-sm text-gray-300">{hero.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>Released: {hero.releaseYear}</span>
            {factionData && <span>Faction: {factionData.name}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h4 className="font-semibold text-white mb-3">Stats</h4>
        <div className="space-y-2">
          <StatBar value={hero.stats.hp} label="HP" color="#4caf50" />
          <StatBar value={hero.stats.attack} label="Attack" color="#f44336" />
          <StatBar value={hero.stats.defense} label="Defense" color="#2196f3" />
          <StatBar value={hero.stats.speed} label="Speed" color="#ffd700" />
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="font-semibold text-white mb-3">Skills</h4>
        <div className="space-y-2">
          {hero.skills.map((sk, i) => (
            <div key={i} className="glass-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={sk.type === 'Ultimate' ? 'bg-gold/20 text-gold' : sk.type === 'Passive' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'}>{sk.type}</Badge>
                <span className="font-semibold text-white text-sm">{sk.name}</span>
              </div>
              <p className="text-xs text-gray-400">{sk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lore */}
      <div>
        <h4 className="font-semibold text-white mb-2">Lore</h4>
        <p className="text-sm text-gray-400 leading-relaxed">{hero.lore}</p>
      </div>

      {/* Counters */}
      {counters && (
        <div>
          <h4 className="font-semibold text-white mb-2">Counters & Matchups</h4>
          <p className="text-xs text-gray-400 mb-2">{counters.tips}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-2">
              <span className="text-xs text-green-400 font-semibold">Strong Against:</span>
              <div className="flex flex-wrap gap-1 mt-1">{counters.strongAgainst.map(s => <Badge key={s} className="bg-green-500/10 text-green-400 text-xs">{s}</Badge>)}</div>
            </div>
            <div className="glass-card p-2">
              <span className="text-xs text-red-400 font-semibold">Weak Against:</span>
              <div className="flex flex-wrap gap-1 mt-1">{counters.weakAgainst.map(w => <Badge key={w} className="bg-red-500/10 text-red-400 text-xs">{w}</Badge>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Combos */}
      {relatedCombos.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">Synergies</h4>
          <div className="space-y-2">
            {relatedCombos.slice(0, 3).map(c => (
              <div key={c.id} className="glass-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gold">{c.comboName}</span>
                  <Badge className="bg-cyan/20 text-cyan">{c.synergyType}</Badge>
                  <div className="flex gap-0.5 ml-auto">{Array.from({ length: c.rating }).map((_, i) => <Star key={i} size={10} fill="#ffd700" style={{ color: '#ffd700' }} />)}</div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ======== TIER LIST ========
function TierListSection() {
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredHeroes = useMemo(() => {
    if (roleFilter === 'All') return heroes;
    return heroes.filter(h => h.role === roleFilter);
  }, [roleFilter]);

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Trophy size={24} />}>Tier List</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {ALL_ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${roleFilter === r ? 'text-gold bg-gold/10 border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {TIER_ORDER.map(tier => {
          const tierHeroes = filteredHeroes.filter(h => h.tier === tier);
          if (tierHeroes.length === 0) return null;
          return (
            <div key={tier} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <TierBadge tier={tier} />
                <span className="text-sm font-semibold text-white">{tier} Tier</span>
                <span className="text-xs text-gray-500">({tierHeroes.length} heroes)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {tierHeroes.sort((a, b) => a.name.localeCompare(b.name)).map(h => (
                  <div key={h.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${h.imageColor}30`, border: `1px solid ${h.imageColor}50` }}>
                      {h.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{h.name}</div>
                      <div className="text-xs text-gray-500">{h.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======== META TRACKER ========
function MetaSection() {
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = useMemo(() => {
    if (roleFilter === 'All') return heroMetaStats;
    return heroMetaStats.filter(h => h.role === roleFilter);
  }, [roleFilter]);

  const byWinRate = useMemo(() => [...filtered].sort((a, b) => b.winRate - a.winRate).slice(0, 10), [filtered]);
  const byPickRate = useMemo(() => [...filtered].sort((a, b) => b.pickRate - a.pickRate).slice(0, 10), [filtered]);
  const byBanRate = useMemo(() => [...filtered].sort((a, b) => b.banRate - a.banRate).slice(0, 10), [filtered]);

  const roleBreakdown = useMemo(() => {
    return ROLES.map(role => {
      const roleHeroes = heroMetaStats.filter(h => h.role === role);
      const avgWR = roleHeroes.reduce((s, h) => s + h.winRate, 0) / (roleHeroes.length || 1);
      const top = roleHeroes.sort((a, b) => b.winRate - a.winRate)[0];
      return { role, avgWR: Math.round(avgWR * 10) / 10, count: roleHeroes.length, top: top?.name || '-' };
    });
  }, []);

  return (
    <div className="space-y-8">
      <SectionTitle icon={<TrendingUp size={24} />}>Meta Tracker <span className="text-sm font-normal text-gray-500 ml-2">Patch 1.8.96</span></SectionTitle>

      {/* Patch Overview */}
      <GlassCard className="border-l-4" style={{ borderLeftColor: '#ffd700' }}>
        <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Flame size={18} className="text-gold" /> Current Patch Overview</h3>
        <p className="text-sm text-gray-400">Tanks and supports are stronger than ever following item buffs. Mobile assassins remain dominant in the jungle, while hyper-carries like Brody and Claude define the Gold lane meta. Teamfight-oriented compositions are favored.</p>
      </GlassCard>

      {/* Role Filter */}
      <div className="flex gap-2 flex-wrap">
        {ALL_ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${roleFilter === r ? 'text-gold bg-gold/10 border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Win Rate */}
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-green-400" /> Top Win Rate</h3>
          <div className="space-y-2">
            {byWinRate.map((h, i) => (
              <div key={h.id} className="glass-card p-2.5 flex items-center gap-2">
                <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${h.imageColor}30` }}>{h.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white">{h.name}</span>
                    {h.trend === 'up' && <ArrowUp size={12} className="text-green-400" />}
                    {h.trend === 'down' && <ArrowDown size={12} className="text-red-400" />}
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-1"><div className="h-full rounded-full bg-green-400" style={{ width: `${(h.winRate - 40) * 10}%` }} /></div>
                </div>
                <span className="text-xs font-mono text-green-400">{h.winRate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pick Rate */}
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Eye size={16} className="text-cyan" /> Top Pick Rate</h3>
          <div className="space-y-2">
            {byPickRate.map((h, i) => (
              <div key={h.id} className="glass-card p-2.5 flex items-center gap-2">
                <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${h.imageColor}30` }}>{h.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><span className="text-xs font-semibold text-white">{h.name}</span></div>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-1"><div className="h-full rounded-full bg-cyan" style={{ width: `${h.pickRate}%` }} /></div>
                </div>
                <span className="text-xs font-mono" style={{ color: '#00bcd4' }}>{h.pickRate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ban Rate */}
        <div>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Skull size={16} className="text-red-400" /> Top Ban Rate</h3>
          <div className="space-y-2">
            {byBanRate.map((h, i) => (
              <div key={h.id} className="glass-card p-2.5 flex items-center gap-2">
                <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${h.imageColor}30` }}>{h.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><span className="text-xs font-semibold text-white">{h.name}</span></div>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-1"><div className="h-full rounded-full bg-red-400" style={{ width: `${h.banRate * 2}%` }} /></div>
                </div>
                <span className="text-xs font-mono text-red-400">{h.banRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Breakdown */}
      <div>
        <h3 className="font-semibold text-white mb-3">Role Meta Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {roleBreakdown.map(rb => (
            <GlassCard key={rb.role} className="text-center">
              <div className="text-lg font-bold" style={{ color: ROLE_COLORS[rb.role as HeroRole] }}>{rb.role}</div>
              <div className="text-2xl font-black text-white mt-1">{rb.avgWR}%</div>
              <div className="text-xs text-gray-500">Avg Win Rate</div>
              <div className="text-xs text-gray-400 mt-1">{rb.count} heroes</div>
              <div className="text-xs text-gold mt-0.5">Top: {rb.top}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======== LORE SECTION ========
function LoreSection() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regionHeroes = useMemo(() => {
    if (!selectedRegion) return [];
    const region = MAP_REGIONS.find(r => r.id === selectedRegion);
    if (!region) return [];
    return heroes.filter(h => region.heroes.includes(h.name));
  }, [selectedRegion]);

  return (
    <div className="space-y-8">
      <SectionTitle icon={<Map size={24} />}>Land of Dawn</SectionTitle>

      {/* Map */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MAP_REGIONS.map(r => (
          <button key={r.id} onClick={() => setSelectedRegion(selectedRegion === r.id ? null : r.id)}
            className={`glass-card p-4 text-left transition-all hover:scale-[1.02] ${selectedRegion === r.id ? 'ring-2' : ''}`}
            style={selectedRegion === r.id ? { ringColor: r.color, borderColor: r.color } : {}}>
            <div className="w-full h-3 rounded mb-2" style={{ background: r.color }} />
            <h3 className="font-bold text-white text-sm">{r.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{r.desc}</p>
            <p className="text-xs mt-2" style={{ color: r.color }}>{r.heroes.length} heroes</p>
          </button>
        ))}
      </div>

      {/* Region Heroes */}
      {selectedRegion && regionHeroes.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-3">Heroes of {MAP_REGIONS.find(r => r.id === selectedRegion)?.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {regionHeroes.map(h => (
              <div key={h.id} className="glass-card p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${h.imageColor}30` }}>{h.name.charAt(0)}</div>
                <div><div className="text-sm font-semibold text-white">{h.name}</div><div className="text-xs text-gray-500">{h.role}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factions */}
      <div>
        <h3 className="font-semibold text-white mb-3">Factions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {factions.map(f => (
            <GlassCard key={f.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: f.color }} />
              <div className="pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white">{f.name}</h4>
                  <Badge className="bg-white/10 text-gray-300">{f.heroes.length} heroes</Badge>
                </div>
                <p className="text-xs text-gold italic mb-2">&ldquo;{f.bannerTagline}&rdquo;</p>
                <p className="text-sm text-gray-400 line-clamp-3">{f.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">{f.heroes.slice(0, 6).map(h => <Badge key={h} className="bg-white/5 text-gray-300">{h}</Badge>)}{f.heroes.length > 6 && <Badge className="bg-white/5 text-gray-500">+{f.heroes.length - 6}</Badge>}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-semibold text-white mb-3">Timeline of the Land of Dawn</h3>
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-cyan to-red-500" />
          {LORE_TIMELINE.map((e, i) => (
            <div key={i} className="relative mb-6">
              <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full border-2 border-gold bg-background" />
              <div className="glass-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-gold/20 text-gold">{e.year < 0 ? `${Math.abs(e.year)} BE` : `${e.year} AE`}</Badge>
                  <h4 className="font-semibold text-white text-sm">{e.event}</h4>
                </div>
                <p className="text-xs text-gray-400">{e.desc}</p>
                {e.heroes.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{e.heroes.map(h => <Badge key={h} className="bg-white/5 text-gray-300">{h}</Badge>)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======== GUIDES SECTION ========
function GuidesSection() {
  const [itemFilter, setItemFilter] = useState('All');
  const [activeGuide, setActiveGuide] = useState<'items' | 'emblems' | 'spells' | 'jungle' | 'ranked' | 'roles'>('items');

  const filteredItems = useMemo(() => {
    if (itemFilter === 'All') return items;
    return items.filter(it => it.category === itemFilter);
  }, [itemFilter]);

  const categories = ['All', 'Attack', 'Defense', 'Magic', 'Movement', 'Jungle', 'Roaming'];

  return (
    <div className="space-y-6">
      <SectionTitle icon={<BookOpen size={24} />}>Guides</SectionTitle>

      {/* Guide Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'items' as const, label: 'Item Builds', icon: <Sword size={14} /> },
          { id: 'emblems' as const, label: 'Emblems', icon: <Star size={14} /> },
          { id: 'spells' as const, label: 'Battle Spells', icon: <Zap size={14} /> },
          { id: 'jungle' as const, label: 'Jungle Guide', icon: <Trees size={14} /> },
          { id: 'ranked' as const, label: 'Ranked Climbing', icon: <Trophy size={14} /> },
          { id: 'roles' as const, label: 'Role Guide', icon: <Shield size={14} /> },
        ].map(g => (
          <button key={g.id} onClick={() => setActiveGuide(g.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeGuide === g.id ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent'}`}>
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      {/* Items Guide */}
      {activeGuide === 'items' && (
        <div>
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map(c => (
              <button key={c} onClick={() => setItemFilter(c)}
                className={`px-2 py-1 rounded text-xs ${itemFilter === c ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {filteredItems.map(item => (
              <GlassCard key={item.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.iconColor}30`, border: `1px solid ${item.iconColor}50` }}>
                    <Sword size={16} style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                      <Badge className="bg-gold/10 text-gold">{item.price}g</Badge>
                    </div>
                    <Badge className={`mb-1.5 text-xs ${item.category === 'Attack' ? 'bg-red-500/10 text-red-400' : item.category === 'Defense' ? 'bg-blue-500/10 text-blue-400' : item.category === 'Magic' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>{item.category}</Badge>
                    <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                    <p className="text-xs text-cyan mt-1">{item.stats}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Emblems */}
      {activeGuide === 'emblems' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emblemBuilds.map(eb => (
            <GlassCard key={eb.role}>
              <div className="flex items-center gap-2 mb-3">
                <RoleBadge role={eb.role} />
                <h4 className="font-bold text-white">{eb.emblemName}</h4>
              </div>
              <div className="space-y-2 mb-3">
                {eb.talents.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge className={`shrink-0 ${i === 2 ? 'bg-gold/20 text-gold' : 'bg-white/10 text-gray-300'}`}>Tier {t.tier}</Badge>
                    <div><div className="text-xs font-semibold text-white">{t.name}</div><div className="text-xs text-gray-500">{t.description}</div></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">{eb.description}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Battle Spells */}
      {activeGuide === 'spells' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {battleSpells.map(bs => (
            <GlassCard key={bs.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${bs.iconColor}30` }}>
                  <Zap size={14} style={{ color: bs.iconColor }} />
                </div>
                <h4 className="font-semibold text-white text-sm">{bs.name}</h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">{bs.description}</p>
              <div className="flex flex-wrap gap-1 mb-1">{bs.bestRoles.map(r => <Badge key={r} className={`text-xs ${`role-${r.toLowerCase()}`}`}>{r}</Badge>)}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Timer size={10} /> {bs.cooldown}s cooldown</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Jungle Guide */}
      {activeGuide === 'jungle' && (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-bold text-white mb-3">🏋️ Jungle Routing Guide</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Early Game (0:00 - 4:00)</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Start from the buff closest to your EXP lane</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Clear efficiently - stack camps when possible</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Use Retribution on buff for faster clear</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> First gank around 1:30 mark</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Turtle spawns at 2:00 - be ready!</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Mid/Late Game (4:00+)</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li className="flex items-start gap-2"><Star size={14} className="text-gold mt-0.5 shrink-0" /> Track enemy jungler via buff timers</li>
                  <li className="flex items-start gap-2"><Star size={14} className="text-gold mt-0.5 shrink-0" /> Contest every Turtle (400+ gold to team)</li>
                  <li className="flex items-start gap-2"><Star size={14} className="text-gold mt-0.5 shrink-0" /> Lord spawns at 8:00 - game-ender</li>
                  <li className="flex items-start gap-2"><Star size={14} className="text-gold mt-0.5 shrink-0" /> Cross-map plays when lanes are pushed</li>
                  <li className="flex items-start gap-2"><Star size={14} className="text-gold mt-0.5 shrink-0" /> Vision control is crucial for objectives</li>
                </ul>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-bold text-white mb-2">🎯 60/40 Jungle Split</h3>
            <p className="text-sm text-gray-400">Give your EXP lane 60% of your jungle (the side they&apos;re on) and leave 40% for your Gold laner. This ensures both laners get enough gold while you maintain jungle control.</p>
          </GlassCard>
        </div>
      )}

      {/* Ranked Guide */}
      {activeGuide === 'ranked' && (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-bold text-white mb-3">🚀 Ranked Climbing Guide</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Warrior → Elite</h4>
                <p className="text-sm text-gray-400">Master 2-3 easy heroes. Focus on last hitting and map awareness. Play your best role every game.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Master → Grandmaster</h4>
                <p className="text-sm text-gray-400">Expand hero pool to 5+. Learn wave management and objective timing. Start playing jungle or roam for more impact.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Epic → Legend</h4>
                <p className="text-sm text-gray-400">Master drafting. Understand team compositions. Track enemy cooldowns. Shot call for your team.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gold mb-2">Mythic → Mythical Glory</h4>
                <p className="text-sm text-gray-400">Perfect mechanics on multiple heroes. Deep macro understanding. Adapt to any situation. Consistency is key.</p>
              </div>
            </div>
          </GlassCard>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {rankedTiers.map(rt => (
              <GlassCard key={rt.name} className="text-center" style={{ borderTopColor: rt.color, borderTopWidth: 2 }}>
                <div className="font-bold text-sm" style={{ color: rt.color }}>{rt.name}</div>
                <div className="text-xs text-gray-500 mt-1">{rt.percentage}% of players</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Role Guide */}
      {activeGuide === 'roles' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map(role => {
            const roleHeroes = heroes.filter(h => h.role === role);
            const tips: Record<string, string> = {
              Tank: 'Initiate fights, protect carries, absorb damage. Build defense items and control objectives.',
              Fighter: 'Dominate your lane, create pressure, and dive carries. Balance between damage and durability.',
              Assassin: 'Farm efficiently, track enemy carries, and strike when they are vulnerable. High risk, high reward.',
              Mage: 'Control zones with AoE, burst down targets, and position safely in teamfights. Magic penetration is key.',
              Marksman: 'Farm safely in the early game, become unstoppable late game. Positioning is your most important skill.',
              Support: 'Enable your team with heals, shields, and vision. Your carries are your priority - keep them alive.',
            };
            return (
              <GlassCard key={role}>
                <div className="flex items-center gap-2 mb-2">
                  <RoleBadge role={role} />
                  <span className="text-sm font-bold text-white">{roleHeroes.length} Heroes</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{tips[role]}</p>
                <div className="flex flex-wrap gap-1">{roleHeroes.slice(0, 8).map(h => <Badge key={h.id} className="bg-white/5 text-gray-300">{h.name}</Badge>)}{roleHeroes.length > 8 && <Badge className="bg-white/5 text-gray-500">+{roleHeroes.length - 8}</Badge>}</div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ======== BLOG SECTION ========
function BlogSection() {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const categories = ['All', 'Lore', 'Guide', 'Esports', 'Meta', 'Tips', 'Patch'];
  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return articles;
    return articles.filter(a => a.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="space-y-6">
      <SectionTitle icon={<PenTool size={24} />}>Blog</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === c ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(a => (
          <GlassCard key={a.id} className="cursor-pointer hover:scale-[1.005] transition-transform" onClick={() => setExpandedPost(expandedPost === a.id ? null : a.id)}>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${
                a.category === 'Guide' ? 'bg-green-500/20 text-green-400' :
                a.category === 'Esports' ? 'bg-red-500/20 text-red-400' :
                a.category === 'Meta' ? 'bg-gold/20 text-gold' :
                a.category === 'Patch' ? 'bg-orange-500/20 text-orange-400' :
                a.category === 'Lore' ? 'bg-purple-500/20 text-purple-400' :
                'bg-cyan/20 text-cyan'
              }`}>{a.category}</Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10} /> {a.date}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Timer size={10} /> {a.readTime} min read</span>
              <span className="text-xs text-gray-500">by {a.author}</span>
            </div>
            <h3 className="font-bold text-white mb-1">{a.title}</h3>
            {expandedPost === a.id ? (
              <div className="mt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-line">{a.content}</div>
            ) : (
              <p className="text-sm text-gray-400">{a.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-3">{a.tags.map(t => <Badge key={t} className="bg-white/5 text-gray-500">#{t}</Badge>)}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ======== TOOLS SECTION ========
function ToolsSection() {
  const [activeTool, setActiveTool] = useState<'combo' | 'team' | 'counter' | 'ai' | 'quiz'>('combo');
  return (
    <div className="space-y-6">
      <SectionTitle icon={<Wrench size={24} />}>Tools</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'combo' as const, label: 'Combo Finder', icon: <Swords size={14} /> },
          { id: 'team' as const, label: 'Team Builder', icon: <Users size={14} /> },
          { id: 'counter' as const, label: 'Counter Finder', icon: <Shield size={14} /> },
          { id: 'ai' as const, label: 'AI Recommender', icon: <Sparkles size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTool === t.id ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 bg-white/5 border border-transparent'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {activeTool === 'combo' && <ComboFinder />}
      {activeTool === 'team' && <TeamBuilder />}
      {activeTool === 'counter' && <CounterFinder />}
      {activeTool === 'ai' && <AIRecommender />}
    </div>
  );
}

function ComboFinder() {
  const [h1, setH1] = useState('');
  const [h2, setH2] = useState('');
  const result = useMemo(() => {
    if (!h1 || !h2) return null;
    return heroCombos.find(c => {
      const c2 = (c as Record<string, unknown>).hero2 as string || c.hero1;
      return (c.hero1 === h1 && c2 === h2) || (c.hero1 === h2 && c2 === h1);
    });
  }, [h1, h2]);

  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-bold text-white mb-3">Hero Combo Finder</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero 1</label>
            <select value={h1} onChange={e => setH1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select hero...</option>
              {heroes.map(h => <option key={h.id} value={h.name}>{h.name} ({h.role})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero 2</label>
            <select value={h2} onChange={e => setH2(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select hero...</option>
              {heroes.map(h => <option key={h.id} value={h.name}>{h.name} ({h.role})</option>)}
            </select>
          </div>
        </div>
        {result ? (
          <div className="glass-card p-4" style={{ borderTopColor: '#ffd700', borderTopWidth: 2 }}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-gold">{result.comboName}</h4>
              <Badge className="bg-cyan/20 text-cyan">{result.synergyType}</Badge>
              <div className="flex gap-0.5 ml-auto">{Array.from({ length: result.rating }).map((_, i) => <Star key={i} size={12} fill="#ffd700" style={{ color: '#ffd700' }} />)}</div>
            </div>
            <p className="text-sm text-gray-300">{result.description}</p>
          </div>
        ) : h1 && h2 ? (
          <p className="text-sm text-gray-500 text-center">No known combo found for this pair. Try different heroes!</p>
        ) : (
          <p className="text-sm text-gray-500 text-center">Select two heroes to find their combo synergy.</p>
        )}
      </GlassCard>
    </div>
  );
}

function TeamBuilder() {
  const [team, setTeam] = useState<(Hero | null)[]>([null, null, null, null, null]);

  const analysis = useMemo(() => {
    const filled = team.filter(Boolean) as Hero[];
    if (filled.length < 2) return null;
    const roles = filled.map(h => h.role);
    const uniqueRoles = new Set(roles);
    const roleCoverage = Math.round((uniqueRoles.size / 6) * 100);
    const avgTier = filled.reduce((s, h) => {
      const v = { S: 5, A: 4, B: 3, C: 2, D: 1 }[h.tier] || 3;
      return s + v;
    }, 0) / filled.length;
    const synergyCount = heroCombos.filter(c => {
      const c2 = (c as Record<string, unknown>).hero2 as string || c.hero1;
      const names = filled.map(h => h.name);
      return names.includes(c.hero1) && names.includes(c2);
    }).length;
    const synergyScore = Math.min(100, Math.round((roleCoverage * 0.4 + avgTier * 10 + synergyCount * 8)));
    return { roleCoverage, uniqueRoles: [...uniqueRoles], synergyCount, synergyScore, filled };
  }, [team]);

  const addHero = (idx: number, hero: Hero) => {
    const newTeam = [...team];
    newTeam[idx] = hero;
    setTeam(newTeam);
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-bold text-white mb-3">Team Comp Builder</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {team.map((h, i) => (
            <div key={i} className="text-center">
              <div className={`w-full aspect-square rounded-xl border-2 border-dashed flex items-center justify-center mb-1 ${h ? 'border-gold/50' : 'border-white/20'}`}
                style={h ? { background: `linear-gradient(135deg, ${h.imageColor}30, ${h.imageColor}10)` } : {}}>
                {h ? <span className="text-lg font-bold text-white">{h.name.charAt(0)}</span> : <Plus size={20} className="text-gray-500" />}
              </div>
              <p className="text-xs text-white font-semibold truncate">{h?.name || `Slot ${i + 1}`}</p>
              {h && <p className="text-xs" style={{ color: ROLE_COLORS[h.role] }}>{h.role}</p>}
              <select value={h?.id || ''} onChange={e => { const hero = heroes.find(x => x.id === e.target.value); if (hero) addHero(i, hero); }}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-xs text-white">
                <option value="">Pick</option>
                {heroes.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={() => setTeam([null, null, null, null, null])} className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
      </GlassCard>
      {analysis && (
        <div className="grid sm:grid-cols-3 gap-3">
          <GlassCard className="text-center">
            <div className="text-3xl font-black" style={{ color: analysis.synergyScore >= 70 ? '#4caf50' : analysis.synergyScore >= 40 ? '#ffd700' : '#f44336' }}>{analysis.synergyScore}</div>
            <div className="text-xs text-gray-400">Synergy Score</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-black text-cyan">{analysis.roleCoverage}%</div>
            <div className="text-xs text-gray-400">Role Coverage</div>
            <div className="flex flex-wrap gap-1 justify-center mt-1">{analysis.uniqueRoles.map(r => <Badge key={r} className={`text-xs ${`role-${r.toLowerCase()}`}`}>{r}</Badge>)}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-black text-gold">{analysis.synergyCount}</div>
            <div className="text-xs text-gray-400">Known Synergies</div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function CounterFinder() {
  const [selectedHero, setSelectedHero] = useState('');
  const counter = useMemo(() => heroCounters.find(c => c.hero === selectedHero), [selectedHero]);
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="font-bold text-white mb-3">Counter Finder</h3>
        <select value={selectedHero} onChange={e => setSelectedHero(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4">
          <option value="">Select a hero...</option>
          {heroCounters.map(c => <option key={c.hero} value={c.hero}>{c.hero}</option>)}
        </select>
        {counter && (
          <div className="space-y-3">
            <div className="glass-card p-3"><p className="text-sm text-gray-300">{counter.tips}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">Strong Against</h4>
                <div className="space-y-1">{counter.strongAgainst.map(s => <div key={s} className="glass-card p-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400" /><span className="text-sm text-white">{s}</span></div>)}</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">Weak Against</h4>
                <div className="space-y-1">{counter.weakAgainst.map(w => <div key={w} className="glass-card p-2 flex items-center gap-2"><XCircle size={14} className="text-red-400" /><span className="text-sm text-white">{w}</span></div>)}</div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function AIRecommender() {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-recommender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <GlassCard className="flex flex-col" style={{ minHeight: 400 }}>
      <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Sparkles size={18} className="text-gold" /> AI Hero Recommender</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[400px] p-2">
        {messages.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Ask me anything about MLBB heroes, builds, or strategies!</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-gold/20 text-gold' : 'bg-white/5 text-gray-300'}`}>
              <div className="whitespace-pre-line">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-xs text-gray-500">Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about heroes, builds, strategies..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50" />
        <button onClick={send} disabled={loading} className="px-4 py-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </GlassCard>
  );
}

// ======== MATCHUPS SECTION ========
function MatchupsSection() {
  const [h1, setH1] = useState('');
  const [h2, setH2] = useState('');

  const matchup = useMemo(() => {
    if (!h1 || !h2) return null;
    const c1 = heroCounters.find(c => c.hero === h1);
    const c2 = heroCounters.find(c => c.hero === h2);
    let advantage = 50;
    let tips: string[] = [];
    if (c1 && c1.strongAgainst.includes(h2)) { advantage += 20; tips.push(`${h1} counters ${h2} naturally`); }
    if (c2 && c2.strongAgainst.includes(h1)) { advantage -= 20; tips.push(`${h2} counters ${h1} naturally`); }
    if (c1 && c1.weakAgainst.includes(h2)) { advantage -= 10; tips.push(`${h1} is weak against ${h2}`); }
    if (c2 && c2.weakAgainst.includes(h1)) { advantage += 10; tips.push(`${h2} is weak against ${h1}`); }
    if (tips.length === 0) tips.push('These heroes have no known direct counter relationship.');
    advantage = Math.max(20, Math.min(80, advantage));
    return { advantage, tips, difficulty: advantage >= 65 ? 'Easy' as const : advantage >= 45 ? 'Medium' as const : 'Hard' as const };
  }, [h1, h2]);

  return (
    <div className="space-y-4">
      <SectionTitle icon={<Swords size={24} />}>Hero Matchups</SectionTitle>
      <GlassCard>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero 1</label>
            <select value={h1} onChange={e => setH1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select...</option>
              {heroes.map(h => <option key={h.id} value={h.name}>{h.name} ({h.role})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hero 2</label>
            <select value={h2} onChange={e => setH2(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Select...</option>
              {heroes.map(h => <option key={h.id} value={h.name}>{h.name} ({h.role})</option>)}
            </select>
          </div>
        </div>
        {matchup && (
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div>
                <div className="text-xl font-bold text-white">{h1}</div>
              </div>
              <div className="text-3xl font-black" style={{ color: matchup.advantage >= 55 ? '#4caf50' : matchup.advantage <= 45 ? '#f44336' : '#ffd700' }}>
                {matchup.advantage >= 55 ? `${matchup.advantage}%` : matchup.advantage <= 45 ? `${100 - matchup.advantage}%` : '50%'}
              </div>
              <div>
                <div className="text-xl font-bold text-white">{h2}</div>
              </div>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex mb-4">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${matchup.advantage}%` }} />
              <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - matchup.advantage}%` }} />
            </div>
            <Badge className={matchup.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : matchup.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}>
              {matchup.difficulty} for {h1}
            </Badge>
            <div className="mt-3 space-y-1">
              {matchup.tips.map((t, i) => <p key={i} className="text-sm text-gray-400">{t}</p>)}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ======== PATCH NOTES ========
function PatchesSection() {
  const [expanded, setExpanded] = useState<string | null>(PATCH_NOTES[0]?.id || null);
  return (
    <div className="space-y-6">
      <SectionTitle icon={<FileText size={24} />}>Patch Notes</SectionTitle>
      <div className="space-y-4">
        {PATCH_NOTES.map(p => (
          <GlassCard key={p.id} className="cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div className="flex items-center gap-3 mb-1">
              <Badge className="bg-gold/20 text-gold font-bold">{p.version}</Badge>
              <h3 className="font-bold text-white">{p.title}</h3>
              <span className="text-xs text-gray-500 ml-auto flex items-center gap-1"><Calendar size={10} /> {p.date}</span>
              {expanded === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>

            {expanded === p.id && (
              <div className="mt-4 space-y-4">
                {/* Hero Changes */}
                {p.heroChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Hero Changes</h4>
                    <div className="space-y-2">
                      {p.heroChanges.map((hc, i) => (
                        <div key={i} className="glass-card p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-white">{hc.hero}</span>
                            <Badge className={hc.type === 'Buff' ? 'bg-green-500/20 text-green-400' : hc.type === 'Nerf' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}>{hc.type}</Badge>
                          </div>
                          <ul className="space-y-0.5">{hc.changes.map((c, j) => <li key={j} className="text-xs text-gray-400">• {c}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Item Changes */}
                {p.itemChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Item Changes</h4>
                    <div className="space-y-2">
                      {p.itemChanges.map((ic, i) => (
                        <div key={i} className="glass-card p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-white">{ic.item}</span>
                            <Badge className={ic.type === 'Buff' ? 'bg-green-500/20 text-green-400' : ic.type === 'Nerf' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}>{ic.type}</Badge>
                          </div>
                          <ul className="space-y-0.5">{ic.changes.map((c, j) => <li key={j} className="text-xs text-gray-400">• {c}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Changes */}
                {p.systemChanges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">System Changes</h4>
                    <ul className="space-y-1">{p.systemChanges.map((sc, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><CircleDot size={12} className="text-cyan mt-0.5 shrink-0" /> {sc}</li>)}</ul>
                  </div>
                )}

                {/* New Content */}
                {(p.newHeroes && p.newHeroes.length > 0) && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">New Heroes:</span>
                    {p.newHeroes.map(h => <Badge key={h} className="bg-green-500/20 text-green-400">{h}</Badge>)}
                  </div>
                )}
                {(p.newSkins && p.newSkins.length > 0) && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">New Skins:</span>
                    {p.newSkins.map(s => <Badge key={s} className="bg-purple-500/20 text-purple-400">{s}</Badge>)}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ======== ESPORTS SECTION ========
function EsportsSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const selTourney = tournaments.find(t => t.id === selected);

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Award size={24} />}>Esports</SectionTitle>

      {/* Tournaments */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.map(t => (
          <GlassCard key={t.id} className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setSelected(selected === t.id ? null : t.id)}>
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-gold/20 text-gold font-bold">{t.name}</Badge>
              <span className="text-xs text-gray-500">{t.year}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2"><Trophy size={14} className="text-gold" /><span className="text-sm font-semibold text-white">{t.winner}</span></div>
              <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Runner-up:</span><span className="text-sm text-gray-300">{t.runnerUp}</span></div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><DollarSign size={10} /> {t.prizePool}</span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {t.location}</span>
              </div>
              <div className="text-xs text-gray-500">{t.teams} teams</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Tournament Detail Modal */}
      <Modal open={!!selTourney} onClose={() => setSelected(null)} title={selTourney?.name || ''}>
        {selTourney && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="text-center" style={{ borderTopWidth: 3, borderTopColor: '#ffd700' }}>
                <Trophy size={24} className="mx-auto mb-2 text-gold" />
                <div className="text-xs text-gray-500">Champion</div>
                <div className="font-bold text-white">{selTourney.winner}</div>
              </GlassCard>
              <GlassCard className="text-center">
                <span className="text-2xl">🥈</span>
                <div className="text-xs text-gray-500 mt-1">Runner-up</div>
                <div className="font-bold text-white">{selTourney.runnerUp}</div>
              </GlassCard>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <GlassCard><div className="text-xs text-gray-500">Prize Pool</div><div className="font-bold text-gold">{selTourney.prizePool}</div></GlassCard>
              <GlassCard><div className="text-xs text-gray-500">Location</div><div className="font-bold text-white text-sm">{selTourney.location}</div></GlassCard>
              <GlassCard><div className="text-xs text-gray-500">Teams</div><div className="font-bold text-white">{selTourney.teams}</div></GlassCard>
            </div>
          </div>
        )}
      </Modal>

      {/* Game Modes */}
      <div>
        <h3 className="font-semibold text-white mb-3">Game Modes</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {gameModes.map(gm => (
            <GlassCard key={gm.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${gm.iconColor}30` }}>
                  {gm.isCompetitive ? <Trophy size={14} style={{ color: gm.iconColor }} /> : <Swords size={14} style={{ color: gm.iconColor }} />}
                </div>
                <h4 className="font-semibold text-white text-sm">{gm.name}</h4>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{gm.description}</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>{gm.playerCount} players</span>
                {gm.isCompetitive && <Badge className="bg-gold/20 text-gold">Competitive</Badge>}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======== SKINS SECTION ========
function SkinsSection() {
  const [rarityFilter, setRarityFilter] = useState('All');
  const [heroFilter, setHeroFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...skins];
    if (rarityFilter !== 'All') result = result.filter(s => s.rarity === rarityFilter);
    if (heroFilter !== 'All') result = result.filter(s => s.hero === heroFilter);
    if (search) result = result.filter(s => s.skinName.toLowerCase().includes(search.toLowerCase()) || s.hero.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [rarityFilter, heroFilter, search]);

  const heroNames = useMemo(() => [...new Set(skins.map(s => s.hero))].sort(), []);

  return (
    <div className="space-y-6">
      <SectionTitle icon={<Palette size={24} />}>Skins Gallery</SectionTitle>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search skins..." /></div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...RARITY_ORDER].map(r => (
            <button key={r} onClick={() => setRarityFilter(r)}
              className={`px-2 py-1 rounded text-xs ${rarityFilter === r ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select value={heroFilter} onChange={e => setHeroFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white">
          <option value="All">All Heroes</option>
          {heroNames.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="text-xs text-gray-500 flex items-center">{filtered.length} skins</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(s => (
          <GlassCard key={s.id} className="text-center">
            <div className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${s.color}30, ${s.color}10)`, border: `2px solid ${s.color}40` }}>
              <span className="text-3xl font-bold" style={{ color: s.color }}>{s.hero.charAt(0)}</span>
            </div>
            <Badge className={`${RARITY_COLORS[s.rarity] || ''} mb-1`}>{s.rarity}</Badge>
            <h4 className="text-sm font-bold text-white">{s.skinName}</h4>
            <p className="text-xs text-gray-400">{s.hero}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-gold">{s.price}</span>
              <Badge className="bg-white/5 text-gray-500">{s.theme}</Badge>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ======== QUIZ SECTION ========
function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [roleScores, setRoleScores] = useState<Record<string, number>>({});

  const question = quizQuestions[currentQ];

  const answer = (roleMapping: string) => {
    const newAnswers = [...answers, roleMapping];
    setAnswers(newAnswers);
    setRoleScores(prev => ({ ...prev, [roleMapping]: (prev[roleMapping] || 0) + 1 }));
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const getResult = () => {
    const maxRole = Object.entries(roleScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Fighter';
    const resultHeroes = heroes.filter(h => h.role === maxRole);
    const hero = resultHeroes[Math.floor(Math.random() * Math.min(3, resultHeroes.length))];
    return { role: maxRole as HeroRole, hero };
  };

  const reset = () => { setCurrentQ(0); setAnswers([]); setShowResult(false); setRoleScores({}); };

  if (showResult) {
    const result = getResult();
    return (
      <div className="space-y-6">
        <SectionTitle icon={<HelpCircle size={24} />}>Quiz Results</SectionTitle>
        <GlassCard className="text-center p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">Your MLBB Personality</h3>
          <div className="inline-flex items-center gap-2 mb-4"><RoleBadge role={result.role} /></div>
          {result.hero && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">You are most like:</p>
              <div className="w-24 h-24 rounded-2xl mx-auto mb-3 flex items-center justify-center text-4xl font-bold" style={{ background: `linear-gradient(135deg, ${result.hero.imageColor}50, ${result.hero.imageColor}20)`, border: `3px solid ${result.hero.imageColor}60` }}>
                {result.hero.name.charAt(0)}
              </div>
              <h4 className="text-xl font-bold text-gold">{result.hero.name}</h4>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">{result.hero.description}</p>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {Object.entries(roleScores).sort((a, b) => b[1] - a[1]).map(([role, score]) => (
              <div key={role} className="glass-card px-3 py-1">
                <span className="text-xs" style={{ color: ROLE_COLORS[role as HeroRole] }}>{role}</span>
                <span className="text-xs text-white ml-1">{score} pts</span>
              </div>
            ))}
          </div>
          <button onClick={reset} className="mt-6 px-6 py-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors flex items-center gap-2 mx-auto">
            <RotateCcw size={14} /> Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon={<HelpCircle size={24} />}>Which Hero Are You?</SectionTitle>

      {/* Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Question {currentQ + 1} of {quizQuestions.length}</span>
          <span className="text-sm text-gold">{Math.round(((currentQ) / quizQuestions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-cyan transition-all" style={{ width: `${(currentQ / quizQuestions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      {question && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 text-center">{question.question}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => answer(opt.roleMapping)}
                className="glass-card p-4 text-left hover:scale-[1.02] hover:border-gold/30 transition-all">
                <span className="text-sm text-white">{opt.text}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      <button onClick={reset} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mx-auto">
        <RotateCcw size={12} /> Restart Quiz
      </button>
    </div>
  );
}

// ======== PLACEHOLDER COMPONENT (for Tree icon used in Guides) ========
function Trees(props: { size?: number }) { return <Sword size={props.size || 14} />; }
