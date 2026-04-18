import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

interface SubCategoryNavProps {
  subCategories: string[];
  activeSubCategory: string | null;
  onSelect: (subCategory: string | null) => void;
}

export function SubCategoryNav({ subCategories, activeSubCategory, onSelect }: SubCategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeElement instanceof HTMLElement) {
      const container = scrollContainerRef.current;
      const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      return;
    }

    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeSubCategory]);

  return (
    <div className="bg-white/75 dark:bg-stone-950/75 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto px-4 flex items-center flex-nowrap gap-2 py-3 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <button
          type="button"
          data-active={activeSubCategory === null}
          aria-pressed={activeSubCategory === null}
          onClick={() => onSelect(null)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap uppercase tracking-wide transition-all',
            activeSubCategory === null
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
          )}
        >
          All
        </button>

        {subCategories.map((subCategory) => {
          const isActive = activeSubCategory === subCategory;
          return (
            <button
              key={subCategory}
              type="button"
              onClick={() => onSelect(subCategory)}
              data-active={isActive}
              aria-pressed={isActive}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap uppercase tracking-wide transition-all',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              )}
            >
              {subCategory}
            </button>
          );
        })}
        <div className="shrink-0 w-8 h-1" />
      </div>
    </div>
  );
}
