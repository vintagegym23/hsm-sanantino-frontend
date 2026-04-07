import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { motion } from 'motion/react';
import { Category, Item, Media } from '../types';
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const filteredItems = activeCategory
    ? items.filter((item) => item.categoryId === activeCategory)
    : items;

  const activeCategoryData = categories.find(c => c.id === activeCategory);
  const heroMedia = media.find((m) => m.type === 'hero_video') || media.find((m) => m.type === 'hero_image');
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
          onClick={toggleTheme}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
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
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

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
                    onClick={() => setActiveCategory(null)}
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
