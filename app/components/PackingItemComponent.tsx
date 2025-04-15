"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PackingItem } from '../../lib/models';
import { FaGripVertical, FaTrash, FaPen, FaSave, FaTimes } from 'react-icons/fa';
import { updatePackingItem } from '../../lib/client-api';

interface PackingItemProps {
  item: PackingItem;
  onToggle: (id: string, isPacked: boolean) => void;
  onDelete: (id: string) => void;
  categoryIcon: React.ReactNode;
}

export default function PackingItemComponent({ 
  item, 
  onToggle, 
  onDelete,
  categoryIcon
}: PackingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedNotes, setEditedNotes] = useState(item.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) return;
    
    try {
      setIsSaving(true);
      await updatePackingItem(item.id, {
        name: editedName.trim(),
        quantity: editedQuantity,
        notes: editedNotes.trim() || null
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(item.name);
    setEditedQuantity(item.quantity);
    setEditedNotes(item.notes || '');
    setIsEditing(false);
  };

  return (
    <li 
      ref={setNodeRef} 
      style={style}
      className={`rounded-lg border ${
        item.isPacked 
          ? 'bg-gray-50 border-gray-200' 
          : item.isEssential 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-white border-gray-200'
      } transition-all duration-300 hover:shadow-sm`}
    >
      {isEditing ? (
        <div className="p-3">
          <div className="mb-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="アイテム名"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">数量</label>
              <input
                type="number"
                value={editedQuantity}
                onChange={(e) => setEditedQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center h-10 px-3 rounded-md bg-gray-100 text-gray-700">
                {categoryIcon}
                <span className="ml-2 text-sm">{item.category}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">メモ</label>
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="メモ（任意）"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm flex items-center gap-1"
              disabled={isSaving}
            >
              <FaTimes size={12} />
              <span>キャンセル</span>
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center gap-1"
              disabled={isSaving || !editedName.trim()}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <FaSave size={12} />
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center p-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab mr-2 text-gray-400 hover:text-gray-600 touch-manipulation"
          >
            <FaGripVertical />
          </div>
          
          <div className="flex-shrink-0 mr-3">
            <div 
              className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                item.isPacked 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-white border-gray-300 hover:border-indigo-500'
              }`}
              onClick={() => onToggle(item.id, !item.isPacked)}
            >
              {item.isPacked && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          
          <div className="flex-grow mr-2">
            <div className="flex items-center">
              <span className={`font-medium ${item.isPacked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {item.name}
              </span>
              {item.quantity > 1 && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  ×{item.quantity}
                </span>
              )}
              {item.isEssential && !item.isPacked && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  必須
                </span>
              )}
            </div>
            {item.notes && (
              <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500">
              {categoryIcon}
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
              aria-label="編集"
            >
              <FaPen size={12} />
            </button>
            
            <button
              onClick={() => onDelete(item.id)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              aria-label="削除"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
