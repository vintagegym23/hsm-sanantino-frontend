import React, { useEffect, useState } from 'react';
import { authApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Stats, Category, Item, Media } from '../types';
import { 
  LayoutDashboard, 
  Utensils, 
  Layers, 
  Image as ImageIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2,
  Moon,
  Sun,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { categorySubCategoriesMap } from '../lib/categorySubCategories';
import { cn, normalizeSubCategories } from '../lib/utils';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'items' | 'media' | 'ticker'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    subCategory: '',
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    imageUrl: '',
    subCategories: [] as string[],
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([
    'Freshly Crafted',
    'Claypot Signature Blends',
    'Authentic Hyderabadi Flavors',
    'Open Daily For Dine-In & Takeaway',
  ]);
  const [newTickerItem, setNewTickerItem] = useState('');
  const [editingTickerIndex, setEditingTickerIndex] = useState<number | null>(null);
  const [editingTickerValue, setEditingTickerValue] = useState('');
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');

  const api = authApi(token ?? '');


  const handleAddSubCategory = () => {
    const nextSubCategory = newSubCategoryInput.trim();
    if (!nextSubCategory) return;

    setCategoryFormData((prev) => {
      const alreadyExists = prev.subCategories.some(
        (s) => s.toLowerCase() === nextSubCategory.toLowerCase()
      );
      if (alreadyExists) return prev;
      return { ...prev, subCategories: [...prev.subCategories, nextSubCategory] };
    });
    setNewSubCategoryInput('');
  };

  const handleRemoveSubCategory = (indexToRemove: number) => {
    setCategoryFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleToggleSubCategory = (subCat: string) => {
    setCategoryFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.includes(subCat)
        ? prev.subCategories.filter(s => s !== subCat)
        : [...prev.subCategories, subCat],
    }));
  };

  const fetchData = async () => {
    try {
      const [statsRes, catRes, itemRes, mediaRes] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/categories'),
        api.get('/api/items'),
        api.get('/api/media'),
      ]);
      setStats(statsRes.data);
      
      // Parse subCategories if they come as JSON strings
      const categoriesWithParsedSubCats = catRes.data.map((cat: Category) => {
        return {
          ...cat,
          subCategories: normalizeSubCategories(cat.subCategories),
        };
      });
      
      setCategories(categoriesWithParsedSubCats);
      setItems(itemRes.data);
      setMedia(mediaRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      const dbSubCats = normalizeSubCategories(category.subCategories);
      const defaultSubCats = dbSubCats.length > 0
        ? dbSubCats
        : (categorySubCategoriesMap[category.name] ?? []);
      setCategoryFormData({
        name: category.name,
        imageUrl: category.imageUrl || '',
        subCategories: defaultSubCats,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        imageUrl: '',
        subCategories: [],
      });
    }
    setNewSubCategoryInput('');
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', categoryFormData.name);
    data.append('subCategories', JSON.stringify(categoryFormData.subCategories));
    if (categoryImageFile) {
      data.append('image', categoryImageFile);
    } else {
      data.append('imageUrl', categoryFormData.imageUrl);
    }

    try {
      if (editingCategory) {
        const res = await api.put(`/api/categories/${editingCategory.id}`, data);
        const updated = res.data;
        // Immediately reflect the saved sub-categories in state so the UI
        // is consistent before fetchData() completes.
        setCategories((prev) =>
          prev.map((c) =>
            c.id === updated.id
              ? { ...updated, subCategories: normalizeSubCategories(updated.subCategories) }
              : c
          )
        );
      } else {
        await api.post('/api/categories', data);
      }
      setIsCategoryModalOpen(false);
      setNewSubCategoryInput('');
      setCategoryImageFile(null);
      await fetchData();
    } catch (err: any) {
      alert('Error saving category');
    }
  };

  const handleOpenItemModal = (item: Item | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.categoryId,
        subCategory: item.subCategory || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id || '',
        subCategory: '',
      });
    }
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      subCategory: formData.subCategory || null,
    };

    try {
      if (editingItem) {
        await api.put(`/api/items/${editingItem.id}`, data);
      } else {
        await api.post('/api/items', data);
      }
      setIsItemModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error saving item');
    }
  };

  const handleAddMedia = async (type: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = new FormData();
      data.append('type', type);
      data.append('file', file);
      try {
        // If it's a hero type, we might want to delete existing ones first to "remove duplicates"
        // but for now let's just add it and the UI will show the latest/first.
        // Actually, let's just update the existing one if it exists.
        const existing = media.find(m => m.type === type);
        if (existing) {
          await api.put(`/api/media/${existing.id}`, data);
        } else {
          await api.post('/api/media', data);
        }
        fetchData();
      } catch (err) {
        alert('Error adding media');
      }
    };
    fileInput.click();
  };

  const handleCategoryBackgroundChange = async (categoryId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = new FormData();
      const cat = categories.find(c => c.id === categoryId);
      if (!cat) return;
      data.append('name', cat.name);
      data.append('image', file);
      try {
        await api.put(`/api/categories/${categoryId}`, data);
        fetchData();
      } catch (err) {
        alert('Error updating category background');
      }
    };
    fileInput.click();
  };

  const handleMediaChange = async (id: string, type: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = new FormData();
      data.append('type', type);
      data.append('file', file);
      try {
        await api.put(`/api/media/${id}`, data);
        fetchData();
      } catch (err) {
        alert('Error updating media');
      }
    };
    fileInput.click();
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      await api.delete(`/api/media/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting media');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/api/items/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting item');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-primary font-headline italic">Admin Panel</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-primary font-headline italic">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'categories' ? 'bg-primary text-white' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          >
            <Layers size={20} /> Categories
          </button>
          <button
            onClick={() => { setActiveTab('items'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'items' ? 'bg-primary text-white' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          >
            <Utensils size={20} /> Menu Items
          </button>
          <button
            onClick={() => { setActiveTab('media'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'media' ? 'bg-primary text-white' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          >
            <ImageIcon size={20} /> Media
          </button>
          <button
            onClick={() => { setActiveTab('ticker'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'ticker' ? 'bg-primary text-white' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          >
            <Zap size={20} /> Scrolling Bar
          </button>
        </nav>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <button
            onClick={() => { toggleTheme(); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800">
                <p className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs mb-2">Total Categories</p>
                <p className="text-5xl font-black text-primary">{stats.categoryCount}</p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800">
                <p className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs mb-2">Total Menu Items</p>
                <p className="text-5xl font-black text-primary">{stats.itemCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="p-6 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">Recently Added Items</h3>
              </div>
              <div className="divide-y divide-stone-200 dark:divide-stone-800">
                {stats.recentItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-stone-500">{item.category?.name}</p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Manage Categories</h2>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Plus size={20} /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-bold text-stone-900 dark:text-white">{cat.name}</p>
                      <p className="text-sm text-stone-500">{cat._count?.items || 0} Items</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-2 text-stone-400 hover:text-primary transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {cat.imageUrl && (
                    <div className="aspect-video rounded-2xl overflow-hidden">
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Menu Items</h2>
              <button
                onClick={() => handleOpenItemModal()}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Plus size={20} /> Add Item
              </button>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="px-6 py-4 font-bold text-stone-700 dark:text-stone-300">Item</th>
                      <th className="px-6 py-4 font-bold text-stone-700 dark:text-stone-300">Category</th>
                      <th className="px-6 py-4 font-bold text-stone-700 dark:text-stone-300">Price</th>
                      <th className="px-6 py-4 font-bold text-stone-700 dark:text-stone-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-stone-900 dark:text-white">{item.name}</span>
                        </td>
                        <td className="px-6 py-4 text-stone-600 dark:text-stone-400">{item.category?.name}</td>
                        <td className="px-6 py-4 font-bold text-primary">₹{item.price}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenItemModal(item)}
                              className="p-2 text-stone-400 hover:text-primary transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Media Management</h2>
                <p className="text-stone-500 text-sm mt-2">Manage the visual assets for your landing page and menu backgrounds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {/* Hero Section Media */}
              <div className="space-y-6">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white">Hero Section</h3>
                    <p className="text-sm text-stone-500">The main visual for your landing page. Only one of each type is active.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['hero_image', 'hero_video'].map((type) => {
                    const m = media.find(item => item.type === type);
                    const duplicates = media.filter(item => item.type === type).slice(1);
                    
                    return (
                      <div key={type} className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="font-bold uppercase tracking-widest text-xs text-primary">
                            {type === 'hero_video' ? 'Hero Video' : 'Hero Image'}
                          </p>
                          <div className="flex items-center gap-3">
                            {m ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Active</span>
                            ) : (
                              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-bold uppercase">Not Set</span>
                            )}
                            {m && (
                              <button 
                                onClick={() => handleDeleteMedia(m.id)}
                                className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative group">
                          {m ? (
                            type === 'hero_video' ? (
                              <video src={m.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={m.url} alt={type} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs italic">No {type.replace('hero_', '')} uploaded</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => m ? handleMediaChange(m.id, type) : handleAddMedia(type)}
                              className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold shadow-lg"
                            >
                              {m ? 'Change' : 'Upload'} {type.replace('hero_', '')}
                            </button>
                          </div>
                        </div>
                        {duplicates.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-[10px] font-bold text-red-500 uppercase mb-2">Duplicates Detected ({duplicates.length})</p>
                            <div className="space-y-2">
                              {duplicates.map(dup => (
                                <div key={dup.id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                                  <p className="text-[10px] text-stone-400 truncate flex-1 mr-2">{dup.url}</p>
                                  <button onClick={() => handleDeleteMedia(dup.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specials Section */}
              <div className="space-y-6">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Specials Section</h3>
                  <p className="text-sm text-stone-500">Image displayed in the specials section on the homepage if it exists.</p>
                </div>
                <div>
                  {(() => {
                    const specialsMedia = media.find(m => m.type === 'special_section');
                    return (
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="font-bold uppercase tracking-widest text-xs text-primary">Specials Image</p>
                          <div className="flex items-center gap-3">
                            {specialsMedia ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Active</span>
                            ) : (
                              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full font-bold uppercase">Not Set</span>
                            )}
                            {specialsMedia && (
                              <button 
                                onClick={() => handleDeleteMedia(specialsMedia.id)}
                                className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative group">
                          {specialsMedia ? (
                            <img src={specialsMedia.url} alt="Specials" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs italic">No image uploaded</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => specialsMedia ? handleMediaChange(specialsMedia.id, 'special_section') : handleAddMedia('special_section')}
                              className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold shadow-lg"
                            >
                              {specialsMedia ? 'Change' : 'Upload'} Image
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Global Default Background */}
              <div className="space-y-6">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Global Menu Background</h3>
                  <p className="text-sm text-stone-500">Fallback background when no category is selected or category has no background.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {media.filter(m => m.type === 'menu_bg').map((m, idx) => (
                    <div key={m.id} className={cn(
                      "bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border space-y-4 relative group",
                      idx === 0 ? "border-primary/30 ring-1 ring-primary/10" : "border-stone-200 dark:border-stone-800"
                    )}>
                      <div className="flex justify-between items-center">
                        <p className="font-bold uppercase tracking-widest text-xs text-primary">Default Background</p>
                        <div className="flex items-center gap-3">
                          {idx === 0 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">Active</span>
                          )}
                          <button 
                            onClick={() => handleDeleteMedia(m.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative group">
                        <img src={m.url} alt={m.type} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => handleMediaChange(m.id, m.type)}
                            className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold shadow-lg"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {media.filter(m => m.type === 'menu_bg').length === 0 && (
                    <button 
                      onClick={() => handleAddMedia('menu_bg')}
                      className="aspect-video rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-stone-400 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      <Plus size={32} className="mb-2" />
                      <span className="font-bold uppercase tracking-widest text-xs">Upload Default Background</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ticker' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Scrolling Bar Management</h2>
                <p className="text-stone-500 text-sm mt-2">Manage the text phrases that appear in the scrolling bar at the top of the homepage hero section.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="p-6 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">Add New Phrase</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTickerItem}
                    onChange={(e) => setNewTickerItem(e.target.value)}
                    placeholder="Enter a new phrase..."
                    className="flex-1 px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (newTickerItem.trim()) {
                        setTickerItems([...tickerItems, newTickerItem.trim()]);
                        setNewTickerItem('');
                      }
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Phrases ({tickerItems.length})</h3>
                {tickerItems.length === 0 ? (
                  <p className="text-stone-500 text-center py-8">No phrases added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tickerItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="flex-1">
                          {editingTickerIndex === index ? (
                            <input
                              type="text"
                              value={editingTickerValue}
                              onChange={(e) => setEditingTickerValue(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            />
                          ) : (
                            <p className="text-stone-900 dark:text-white font-bold">{item}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {editingTickerIndex === index ? (
                            <>
                              <button
                                onClick={() => {
                                  if (editingTickerValue.trim()) {
                                    const updated = [...tickerItems];
                                    updated[index] = editingTickerValue.trim();
                                    setTickerItems(updated);
                                    setEditingTickerIndex(null);
                                  }
                                }}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-all"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTickerIndex(null)}
                                className="px-3 py-2 bg-stone-400 text-white rounded-lg font-bold text-sm hover:bg-stone-500 transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingTickerIndex(index);
                                  setEditingTickerValue(item);
                                }}
                                className="p-2 text-stone-400 hover:text-primary transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setTickerItems(tickerItems.filter((_, i) => i !== index));
                                }}
                                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <span className="font-bold">💡 Tip:</span> These phrases will appear in the scrolling bar at the top of the homepage hero section. They will repeat continuously as the ticker scrolls from right to left.
              </p>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 w-full max-w-md max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewSubCategoryInput('');
                }} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCategorySubmit} className="p-6 space-y-6 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Category Name</label>
                  <input
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Sub-Categories</label>
                  
                  {/* Input to add new sub-categories */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubCategoryInput}
                        onChange={(e) => setNewSubCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubCategory();
                          }
                        }}
                        placeholder="Enter new sub-category and press Enter"
                        className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubCategory}
                        className="px-4 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Type a sub-category name and press Enter or click Add</p>
                  </div>

                  {/* Unified checkbox list: map sub-categories + any custom ones added via input */}
                  {(() => {
                    const mapSubCats = categorySubCategoriesMap[categoryFormData.name] ?? [];
                    const allAvailable = [...new Set([...mapSubCats, ...categoryFormData.subCategories])];
                    if (allAvailable.length === 0) return null;
                    return (
                      <div className="space-y-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                        <p className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest">
                          Sub-Categories
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {allAvailable.map((subCat) => (
                            <label
                              key={subCat}
                              className="inline-flex items-center gap-2 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={categoryFormData.subCategories.includes(subCat)}
                                onChange={() => handleToggleSubCategory(subCat)}
                                className="w-4 h-4 accent-primary rounded"
                              />
                              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{subCat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Background Image</label>
                  <input
                    type="file"
                    onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  />
                  <p className="text-xs text-stone-400 mt-2">This image will be shown as background when this category is selected.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModalOpen(false);
                      setNewSubCategoryInput('');
                    }}
                    className="flex-1 px-6 py-4 rounded-xl font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button onClick={() => setIsItemModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleItemSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Item Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, categoryId: e.target.value, subCategory: '' });
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Sub-Category</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    disabled={!formData.categoryId}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(() => {
                      const selectedCat = categories.find(c => c.id === formData.categoryId);
                      const dbSubCats = selectedCat?.subCategories ?? [];
                      const subCats = dbSubCats.length > 0
                        ? dbSubCats
                        : (selectedCat ? (categorySubCategoriesMap[selectedCat.name] ?? []) : []);
                      return subCats.length > 0
                        ? <option value="">Select a sub-category (optional)</option>
                        : <option value="">No sub-categories available</option>;
                    })()}
                    {(() => {
                      const selectedCat = categories.find(c => c.id === formData.categoryId);
                      const dbSubCats = selectedCat?.subCategories ?? [];
                      const subCats = dbSubCats.length > 0
                        ? dbSubCats
                        : (selectedCat ? (categorySubCategoriesMap[selectedCat.name] ?? []) : []);
                      return subCats.map((subCat) => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      ));
                    })()}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl font-bold uppercase tracking-widest border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                  >
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
