"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { PackingItem, PACKING_CATEGORIES } from '../../lib/models';
import { 
  fetchPackingItems, 
  createPackingItem, 
  updatePackingItem, 
  deletePackingItem, 
  reorderPackingItems, 
  togglePackedStatus 
} from '../../lib/client-api';
import PackingItemComponent from './PackingItemComponent';
import { 
  FaPlus, 
  FaSuitcase, 
  FaTshirt, 
  FaBath, 
  FaLaptop, 
  FaFile, 
  FaPills, 
  FaRing, 
  FaUtensils, 
  FaBox,
  FaShoppingBag
} from 'react-icons/fa';
import { FiFilter, FiCheckCircle, FiAlertCircle, FiSearch } from 'react-icons/fi';

interface PackingListProps {
  itineraryId: string;
}

export default function PackingList({ itineraryId }: PackingListProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('clothing');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemIsEssential, setNewItemIsEssential] = useState(false);
  const [filter, setFilter] = useState<'all' | 'packed' | 'unpacked' | 'essential'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // アイコンマッピング
  const categoryIcons: Record<string, React.ReactNode> = {
    clothing: <FaTshirt />,
    toiletries: <FaBath />,
    electronics: <FaLaptop />,
    documents: <FaFile />,
    medicine: <FaPills />,
    accessories: <FaRing />,
    food: <FaUtensils />,
    other: <FaBox />,
  };

  // パッキングアイテムの取得
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await fetchPackingItems(itineraryId);
        setItems(data);
        setFilteredItems(data);
        setError(null);
      } catch (err) {
        console.error('Error loading packing items:', err);
        setError('パッキングリストの読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, [itineraryId]);

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...items];
    
    // カテゴリーでフィルタリング
    if (activeCategory) {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // ステータスでフィルタリング
    if (filter === 'packed') {
      filtered = filtered.filter(item => item.isPacked);
    } else if (filter === 'unpacked') {
      filtered = filtered.filter(item => !item.isPacked);
    } else if (filter === 'essential') {
      filtered = filtered.filter(item => item.isEssential);
    }
    
    // 検索クエリでフィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(filtered);
  }, [items, filter, searchQuery, activeCategory]);

  // 新しいアイテムの追加
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName.trim()) {
      return;
    }
    
    try {
      setAddingItem(true);
      
      const newItem = await createPackingItem({
        itineraryId,
        name: newItemName.trim(),
        category: newItemCategory,
        isPacked: false,
        quantity: newItemQuantity,
        notes: '',
        isEssential: newItemIsEssential,
        orderIndex: items.length
      });
      
      setItems(prev => [...prev, newItem]);
      setNewItemName('');
      setNewItemCategory('clothing');
      setNewItemQuantity(1);
      setNewItemIsEssential(false);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('アイテムの追加中にエラーが発生しました');
    } finally {
      setAddingItem(false);
    }
  };

  // アイテムの削除
  const handleDeleteItem = async (id: string) => {
    try {
      await deletePackingItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('アイテムの削除中にエラーが発生しました');
    }
  };

  // チェック状態の切り替え
  const handleToggleChecked = async (id: string, isPacked: boolean) => {
    try {
      const updatedItem = await togglePackedStatus(id, isPacked);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (err) {
      console.error('Error toggling item:', err);
      setError('アイテムの更新中にエラーが発生しました');
    }
  };

  // ドラッグアンドドロップの処理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
        
        try {
          await reorderPackingItems(
            itineraryId, 
            newItems.map(item => item.id)
          );
        } catch (err) {
          console.error('Error reordering items:', err);
          setError('アイテムの並び替え中にエラーが発生しました');
        }
      }
    }
  };

  // 進捗状況の計算
  const packedCount = items.filter(item => item.isPacked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  // カテゴリー別のアイテム数を計算
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 md:mb-0">
          <FaSuitcase className="text-indigo-600" />
          <span>パッキングリスト</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({packedCount}/{totalCount} アイテム完了)
            </span>
          )}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              filter === 'all' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter size={14} />
            <span>すべて</span>
          </button>
          <button
            onClick={() => setFilter('unpacked')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              filter === 'unpacked' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiAlertCircle size={14} />
            <span>未パック</span>
          </button>
          <button
            onClick={() => setFilter('packed')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              filter === 'packed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiCheckCircle size={14} />
            <span>パック済み</span>
          </button>
          <button
            onClick={() => setFilter('essential')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              filter === 'essential' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiAlertCircle size={14} />
            <span>必須アイテム</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 進捗バー */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>パッキング進捗</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 検索ボックス */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="アイテムを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
        />
      </div>

      {/* カテゴリータブ */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
              activeCategory === null 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaShoppingBag size={14} />
            <span>すべてのカテゴリー</span>
          </button>
          
          {PACKING_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                activeCategory === category.id 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryIcons[category.id]}
              <span>{category.name}</span>
              {categoryCounts[category.id] && (
                <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 text-xs">
                  {categoryCounts[category.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* アイテムリスト */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
            <FaSuitcase className="text-gray-400 text-4xl" />
          </div>
          <p className="text-gray-500 mb-4">
            {items.length === 0 
              ? 'パッキングリストにアイテムがありません。' 
              : '条件に一致するアイテムがありません。'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            <span>アイテムを追加</span>
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {filteredItems.map(item => (
                <PackingItemComponent
                  key={item.id}
                  item={item}
                  onToggle={handleToggleChecked}
                  onDelete={handleDeleteItem}
                  categoryIcon={categoryIcons[item.category]}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* 新規アイテム追加フォーム */}
      {showAddForm ? (
        <form onSubmit={handleAddItem} className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-3">新しいアイテムを追加</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                アイテム名 *
              </label>
              <input
                type="text"
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例: パスポート、歯ブラシなど"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリー *
                </label>
                <select
                  id="itemCategory"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PACKING_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                  数量
                </label>
                <input
                  type="number"
                  id="itemQuantity"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="itemEssential"
                checked={newItemIsEssential}
                onChange={(e) => setNewItemIsEssential(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="itemEssential" className="ml-2 block text-sm text-gray-700">
                必須アイテム（重要なもの）
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={addingItem}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                disabled={addingItem || !newItemName.trim()}
              >
                {addingItem ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    追加中...
                  </>
                ) : (
                  <>
                    <FaPlus size={14} />
                    追加する
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            <span>アイテムを追加</span>
          </button>
        </div>
      )}
    </div>
  );
}
