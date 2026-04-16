import React, { useEffect, useRef } from 'react';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeElement instanceof HTMLElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      return;
    }

    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div className="bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto px-4 flex items-center flex-nowrap gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
          data-active={activeCategory === null}
          aria-pressed={activeCategory === null}
          className={cn(
            'shrink-0 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
            activeCategory === null
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
          )}
        >
          All Items
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            data-active={activeCategory === category.id}
            aria-pressed={activeCategory === category.id}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
              activeCategory === category.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            )}
          >
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
            )}
            {category.name}
          </button>
        ))}

        <div className="shrink-0 w-8 h-1" />
      </div>
    </div>
  );
}
