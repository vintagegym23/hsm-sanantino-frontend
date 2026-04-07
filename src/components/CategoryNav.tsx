// import React from 'react';
// import { Category } from '../types';
// import { cn } from '../lib/utils';

// interface CategoryNavProps {
//   categories: Category[];
//   activeCategory: string | null;
//   onSelect: (id: string | null) => void;
// }

// // export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
// //   return (
// //     <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
// //       <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 py-4">
// //         <button
// //           onClick={() => onSelect(null)}
// //           className={cn(
// //             "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
// //             activeCategory === null
// //               ? "bg-primary text-white shadow-lg shadow-primary/20"
// //               : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
// //           )}
// //         >
// //           All Items
// //         </button>
// //         {categories.map((category) => (
// //           <button
// //             key={category.id}
// //             onClick={() => onSelect(category.id)}
// //             className={cn(
// //               "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
// //               activeCategory === category.id
// //                 ? "bg-primary text-white shadow-lg shadow-primary/20"
// //                 : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
// //             )}
// //           >
// //             {category.imageUrl && (
// //               <img 
// //                 src={category.imageUrl} 
// //                 alt="" 
// //                 className="w-6 h-6 rounded-full object-cover border border-white/20"
// //                 referrerPolicy="no-referrer"
// //               />
// //             )}
// //             {category.name}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }








// export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
//   return (
//     <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
//       {/* 1. Added 'flex-nowrap' and ensured horizontal padding works on scroll */}
//       <div className="max-w-7xl mx-auto px-4 flex items-center flex-nowrap space-x-2 py-4">
        
//         <button
//           onClick={() => onSelect(null)}
//           className={cn(
//             // 2. Added 'flex-shrink-0' so it never squishes
//             "flex-shrink-0 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
//             activeCategory === null
//               ? "bg-primary text-white shadow-lg shadow-primary/20"
//               : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
//           )}
//         >
//           All Items
//         </button>

//         {categories.map((category) => (
//           <button
//             key={category.id}
//             onClick={() => onSelect(category.id)}
//             className={cn(
//               // 3. Added 'flex-shrink-0' here as well
//               "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
//               activeCategory === category.id
//                 ? "bg-primary text-white shadow-lg shadow-primary/20"
//                 : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
//             )}
//           >
//             {category.imageUrl && (
//               <img 
//                 src={category.imageUrl} 
//                 alt="" 
//                 className="w-6 h-6 rounded-full object-cover border border-white/20"
//                 referrerPolicy="no-referrer"
//               />
//             )}
//             {category.name}
//           </button>
//         ))}

//         {/* 4. Added a spacer at the end to prevent the last item from hitting the screen edge */}
//         <div className="flex-shrink-0 w-4 h-1" />
//       </div>
//     </div>
//   );
// }





import React, { useRef, useEffect } from 'react';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
  // 1. Create a ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 2. Effect to handle auto-scrolling when activeCategory changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center' // This centers the selected bubble
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div 
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto px-4 flex items-center flex-nowrap space-x-2 py-4 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <button
          onClick={() => onSelect(null)}
          data-active={activeCategory === null}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
            activeCategory === null
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
          )}
        >
          All Items
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            data-active={activeCategory === category.id} // 3. Data attribute for the querySelector
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
              activeCategory === category.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
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
        
        {/* Spacer for better mobile scrolling at the end */}
        <div className="flex-shrink-0 w-8 h-1" />
      </div>
    </div>
  );
}