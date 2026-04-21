import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Item, Media, Ticker, Special } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CategoryNav } from '../components/CategoryNav';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import logo from "../images/logo-white.png";

export default function MenuView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [ticker, setTicker] = useState<Ticker[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes, mediaRes, tickerRes, specialsRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/items'),
          api.get('/api/media'),
          api.get('/api/ticker'),
          api.get('/api/specials'),
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
        setMedia(mediaRes.data);
        setTicker(tickerRes.data);
        setSpecials(specialsRes.data);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [signatureFilter, setSignatureFilter] = useState(false);

  const selectCategory = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
    setSignatureFilter(false);
  };

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (activeCategory && item.categoryId !== activeCategory) return false;
      if (activeSubCategory && item.subCategory !== activeSubCategory) return false;
      if (signatureFilter && !item.isHsmSignature) return false;
      return true;
    });
    // Signature items always float to the top regardless of active filters
    return [...filtered].sort((a, b) => (b.isHsmSignature ? 1 : 0) - (a.isHsmSignature ? 1 : 0));
  }, [items, activeCategory, activeSubCategory, signatureFilter]);

  const activeCategoryData = useMemo(() => categories.find(c => c.id === activeCategory), [categories, activeCategory]);
  const activeSubCategories = useMemo(() => activeCategoryData?.subCategories ?? [], [activeCategoryData]);

  // Counts are scoped to the active category and NEVER change when filters are applied
  const categoryItems = useMemo(() =>
    activeCategory ? items.filter(i => i.categoryId === activeCategory) : [],
  [items, activeCategory]);

  const signatureCount = useMemo(() =>
    categoryItems.filter(i => i.isHsmSignature).length,
  [categoryItems]);

  const subCategoryCount = useMemo(() =>
    activeSubCategories.reduce<Record<string, number>>((acc, sub) => {
      acc[sub] = categoryItems.filter(i => i.subCategory === sub).length;
      return acc;
    }, {}),
  [categoryItems, activeSubCategories]);

  const heroMedia = useMemo(() =>
    media.find((m) => ['hero_image', 'hero_video'].includes(m.type) && m.isActive) ||
    media.find((m) => ['hero_image', 'hero_video'].includes(m.type)),
  [media]);
  const menuBg = useMemo(() => activeCategoryData?.imageUrl || media.find((m) => m.type === 'menu_bg')?.url, [activeCategoryData, media]);

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 animate-pulse">
        {/* Skeleton Hero */}
        <div className="h-screen bg-stone-200 dark:bg-stone-900 w-full flex flex-col items-center justify-center">
          <div className="w-64 h-64 bg-stone-300 dark:bg-stone-800 rounded-full mb-8" />
          <div className="w-3/4 max-w-lg h-8 bg-stone-300 dark:bg-stone-800 rounded-full mb-8" />
          <div className="w-40 h-12 bg-stone-300 dark:bg-stone-800 rounded-full" />
        </div>
        
        {/* Skeleton Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 overflow-hidden">
          <div className="h-10 w-24 bg-stone-200 dark:bg-stone-800 rounded-full shrink-0" />
          <div className="h-10 w-32 bg-stone-200 dark:bg-stone-800 rounded-full shrink-0" />
          <div className="h-10 w-28 bg-stone-200 dark:bg-stone-800 rounded-full shrink-0" />
          <div className="h-10 w-36 bg-stone-200 dark:bg-stone-800 rounded-full shrink-0" />
        </div>

        {/* Skeleton Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-stone-200 dark:bg-stone-900 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroMedia?.type === 'hero_video' ? (
          <video
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
            src={heroMedia.url}
          />
        ) : heroMedia?.url ? (
          <img
            src={heroMedia.url}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        {/* Scrolling Ticker — only rendered when backend has data */}
        {ticker.length > 0 && (
          <div className="hero-ticker-shell absolute top-0 left-0 right-0 z-30 h-12 overflow-hidden border-b border-white/20 bg-black/45 backdrop-blur-md">
            <div className="hero-ticker-track">
              {[0, 1, 2, 3].map((groupIndex) => (
                <div key={groupIndex} className="hero-ticker-group" aria-hidden={groupIndex > 0}>
                  {ticker.map((t) => (
                    <span
                      key={`${t.id}-${groupIndex}`}
                      className="hero-ticker-item text-[11px] md:text-xs font-bold uppercase tracking-[0.24em] text-stone-200"
                    >
                      {t.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={logo}
              alt="Spicy Matka Logo"
              className="mx-auto mb-6 h-64 md:h-96 w-auto object-contain"
            />
            <p className="text-xl md:text-2xl text-stone-300 mb-8 max-w-2xl mx-auto font-body">
              Crafted Heritage • Elevated Spice • Authentic Claypot Experience
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(null);
                scrollToMenu();
              }}
              className="bg-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/40 flex items-center gap-2 mx-auto"
            >
              Explore Menu <ChevronDown size={20} />
            </motion.button>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="absolute top-16 md:top-[4.4rem] right-4 md:right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </section>

      {/* Specials Posters Section */}
      {specials.length > 0 && (
        <section className="relative overflow-hidden bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-4">
              Don&apos;t Miss Out
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white font-headline italic">
              Today&apos;s Specials
            </h2>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            <div className={cn(
              "grid gap-6 md:gap-10",
              specials.length === 1 ? "grid-cols-1 max-w-lg mx-auto" :
              specials.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" :
              "grid-cols-1 md:grid-cols-3"
            )}>
              {specials.map((special, index) => (
                <motion.div
                  key={special.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 aspect-[1/1.414]"
                >
                  <img
                    src={special.imageUrl}
                    alt={`Special Poster ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Section */}
      <div
        id="menu-section"
        className="relative min-h-screen transition-all duration-700"
        style={{
          backgroundImage: activeCategory && menuBg ? `url(${menuBg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          activeCategory ? "bg-white/70 dark:bg-stone-950/90 backdrop-blur-[4px]" : "bg-stone-50 dark:bg-stone-950"
        )} />
        <div className="relative z-10">
          <div className="sticky top-0 z-40 shadow-sm shadow-black/5 dark:shadow-black/20">
            <CategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onSelect={selectCategory}
            />
            {activeCategory && (activeSubCategories.length > 0 || signatureCount > 0) && (
              <div className="bg-white/75 dark:bg-stone-950/75 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 flex items-center flex-nowrap gap-2 py-3 overflow-x-auto no-scrollbar scroll-smooth">
                  {signatureCount > 0 && (
                    <button
                      type="button"
                      aria-pressed={signatureFilter}
                      onClick={() => setSignatureFilter(f => !f)}
                      className={cn(
                        'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap tracking-wide transition-all',
                        signatureFilter
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                      )}
                    >
                      ⭐ Signature ({signatureCount})
                    </button>
                  )}
                  {activeSubCategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      aria-pressed={activeSubCategory === sub}
                      onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                      className={cn(
                        'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap uppercase tracking-wide transition-all',
                        activeSubCategory === sub
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                      )}
                    >
                      {sub} ({subCategoryCount[sub] ?? 0})
                    </button>
                  ))}
                  <div className="shrink-0 w-8 h-1" />
                </div>
              </div>
            )}
          </div>

          <main className="max-w-7xl mx-auto px-4 py-12">
            {!activeCategory ? (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-4xl font-black text-stone-900 dark:text-white font-headline italic mb-4">Our Categories</h2>
                  <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ y: -10 }}
                      onClick={() => {
                        selectCategory(category.id);
                        scrollToMenu();
                      }}
                      className="group relative h-80 rounded-3xl overflow-hidden shadow-2xl text-left"
                    >
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8">
                        <h3 className="text-3xl font-black text-white font-headline italic mb-2">{category.name}</h3>
                        <p className="text-stone-300 text-sm font-bold uppercase tracking-widest">
                          {items.filter(i => i.categoryId === category.id).length} Items
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black text-stone-900 dark:text-white font-headline italic">
                    {activeCategoryData?.name}
                    <span className="text-stone-400 dark:text-stone-500 font-bold text-2xl ml-2">({categoryItems.length})</span>
                  </h2>
                  <button
                    onClick={() => selectCategory(null)}
                    className="text-stone-500 hover:text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Back to Categories
                  </button>
                </div>
                {filteredItems.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 space-y-2">
                    <p className="text-stone-500 dark:text-stone-400 text-xl">No items match the selected filters.</p>
                    {(activeSubCategory || signatureFilter) && (
                      <button
                        onClick={() => { setActiveSubCategory(null); setSignatureFilter(false); }}
                        className="text-primary font-bold text-sm underline underline-offset-4"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="bg-stone-100 dark:bg-stone-900 py-12 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4 font-headline italic">Spicy Matka</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            © 2026 Spicy Matka. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
