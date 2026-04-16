import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { motion } from 'motion/react';
import { Category, Item, Media } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CategoryNav } from '../components/CategoryNav';
import { SubCategoryNav } from '../components/SubCategoryNav';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import logo from "../images/logo-white.png";

const SUB_CATEGORIES = ['Veg', 'paneer', 'egg', 'chicken', 'goat', 'fish', 'shrimp'] as const;

const heroTickerText = [
  'Freshly Crafted',
  'Claypot Signature Blends',
  'Authentic Hyderabadi Flavors',
  'Open Daily For Dine-In & Takeaway',
];

const specialHighlights = [
  {
    name: 'Matka Mirchi Feast',
    detail: 'Slow-fired claypot rice with roasted chilies, mint, and a smoky finish.',
    price: '$18',
  },
  {
    name: 'Weekend Haleem Bowl',
    detail: 'Silky lentils, tender spice, crisp onions, and a bright squeeze of lime.',
    price: '$14',
  },
  {
    name: 'Charcoal Chai Float',
    detail: 'Cold chai, vanilla cream, and a cardamom dusting for the final spoonful.',
    price: '$7',
  },
];

const defaultSpecialSectionImage =
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=80';

export default function MenuView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes, mediaRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/items'),
          api.get('/api/media'),
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
        setMedia(mediaRes.data);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const itemMatchesSubCategory = (item: Item, subCategory: string | null) => {
    if (!subCategory) {
      return true;
    }

    const itemName = item.name.toLowerCase();

    if (subCategory === 'Veg') {
      const nonVegPattern = /(chicken|goat|lamb|mutton|fish|shrimp|prawn|jhinga|egg|gosht|nalli|natukodi)/;
      return !nonVegPattern.test(itemName);
    }

    const subCategoryMatchers: Record<string, RegExp> = {
      paneer: /paneer/,
      egg: /egg/,
      chicken: /chicken/,
      goat: /(goat|lamb|mutton|gosht|nalli)/,
      fish: /(fish|pomfret)/,
      shrimp: /(shrimp|prawn|jhinga)/,
    };

    const matcher = subCategoryMatchers[subCategory.toLowerCase()];
    return matcher ? matcher.test(itemName) : true;
  };

  const filteredItems = items.filter((item) => {
    const categoryMatch = activeCategory ? item.categoryId === activeCategory : true;
    if (!categoryMatch) {
      return false;
    }
    return itemMatchesSubCategory(item, activeSubCategory);
  });

  const activeCategoryData = categories.find(c => c.id === activeCategory);
  const heroMedia = media.find((m) => m.type === 'hero_video') || media.find((m) => m.type === 'hero_image');
  const specialSection = media.find((m) => m.type === 'special_section');
  const specialSectionImage = specialSection?.url || defaultSpecialSectionImage;
  const menuBg = activeCategoryData?.imageUrl || media.find((m) => m.type === 'menu_bg')?.url;

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        ) : (
          <img
            src={heroMedia?.url}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="hero-ticker-shell absolute top-0 left-0 right-0 z-30 h-12 overflow-hidden border-b border-white/20 bg-black/45 backdrop-blur-md">
          <div className="hero-ticker-track">
            {[0, 1, 2, 3].map((groupIndex) => (
              <div key={groupIndex} className="hero-ticker-group" aria-hidden={groupIndex > 0}>
                {heroTickerText.map((text) => (
                  <span
                    key={`${text}-${groupIndex}`}
                    className="hero-ticker-item text-[11px] md:text-xs font-bold uppercase tracking-[0.24em] text-stone-200"
                  >
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 1. ADD YOUR LOGO HERE */}
    <img 
      src={logo} 
      alt="Spicy Matka Logo" 
      className="mx-auto mb-6 h-64 md:h-96 w-auto object-contain" 
    />
            {/* 2. UPDATED TEXT TO HYDERABADI SPICY MATKA */}
    {/* <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-headline italic tracking-tight">
      Hyderabadi Spicy Matka
    </h1> */}

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

      <section className="relative overflow-hidden bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 opacity-15 md:opacity-100">
          <img
            src={specialSectionImage}
            alt="Specials"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-white dark:to-stone-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6 }}
              className="lg:pl-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary mb-4">
                Today&apos;s Specials
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-stone-950 dark:text-white font-headline italic mb-5">
                Fresh claypot favorites, poured hot.
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-lg leading-8 max-w-xl">
                Small-batch dishes picked for the day, built around bold spice, slow heat, and a little tableside drama.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specialHighlights.map((special, index) => (
                <motion.article
                  key={special.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-900/95 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                      Limited
                    </span>
                    <span className="text-primary font-black">{special.price}</span>
                  </div>
                  <h3 className="text-xl font-black text-stone-950 dark:text-white font-headline italic mb-3">
                    {special.name}
                  </h3>
                  <p className="text-sm leading-6 text-stone-600 dark:text-stone-400">
                    {special.detail}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <div 
        id="menu-section"
        className="relative min-h-screen transition-all duration-700"
        style={{ 
          backgroundImage: activeCategory && menuBg ? `url(${menuBg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
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
              onSelect={(categoryId) => {
                setActiveCategory(categoryId);
                setActiveSubCategory(null);
              }}
            />
            {activeCategory && (
              <SubCategoryNav
                subCategories={[...SUB_CATEGORIES]}
                activeSubCategory={activeSubCategory}
                onSelect={setActiveSubCategory}
              />
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
                        setActiveCategory(category.id);
                        setActiveSubCategory(null);
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
                  </h2>
                  <button 
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveSubCategory(null);
                    }}
                    className="text-stone-500 hover:text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Back to Categories
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {activeCategory && filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-stone-500 dark:text-stone-400 text-xl">
                  No items found in this category.
                </p>
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
