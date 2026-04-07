import React from 'react';
import { motion } from 'motion/react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800 p-8 hover:border-primary/50 transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-stone-900 dark:text-white font-headline italic mb-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <div className="w-12 h-0.5 bg-primary/30 group-hover:w-24 transition-all duration-500" />
        </div>
        <span className="text-2xl font-black text-primary font-headline italic">
          ₹{item.price}
        </span>
      </div>
      <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed font-body">
        {item.description}
      </p>
    </motion.div>
  );
};
