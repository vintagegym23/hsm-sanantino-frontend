import React from 'react';
import { motion } from 'motion/react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isSignature = item.isHsmSignature === true;

  const VEG_SUBCATEGORIES = new Set(['veg', 'paneer', 'gobi', 'mushroom', 'tofu', 'soya', 'vegetables', 'vegetarian']);
  const isVegSubCategory = (sub: string) => VEG_SUBCATEGORIES.has(sub.toLowerCase().trim());

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`group bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border p-8 hover:border-primary/50 transition-all duration-500 ${
        isSignature
          ? 'border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-amber-900/20'
          : 'border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-2xl font-black text-stone-900 dark:text-white font-headline italic group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            {isSignature && (
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full whitespace-nowrap">
                ⭐ Signature
              </span>
            )}
            {item.subCategory && (
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full whitespace-nowrap shadow-sm border ${
                isVegSubCategory(item.subCategory)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
              }`}>
                {item.subCategory}
              </span>
            )}
          </div>
          <div className="w-12 h-0.5 bg-primary/30 group-hover:w-24 transition-all duration-500" />
        </div>
        <span className="text-2xl font-black text-primary font-headline italic ml-4">
          ${item.price}
        </span>
      </div>
      <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed font-body">
        {item.description}
      </p>
    </motion.div>
  );
};
