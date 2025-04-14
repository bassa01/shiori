"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
  titleClassName?: string;
}

export default function EditableTitle({ title, onSave, className = '', titleClassName = '' }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedTitle.trim() !== '') {
      onSave(editedTitle);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border border-blue-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="タイトルを入力"
          />
          <div className="flex ml-2">
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 p-1"
              title="保存"
            >
              <FaCheck />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-500 hover:text-red-700 p-1 ml-1"
              title="キャンセル"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <h1 className={`${titleClassName}`}>{title}</h1>
          <button
            onClick={handleStartEditing}
            className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="タイトルを編集"
          >
            <FaPencilAlt />
          </button>
        </div>
      )}
    </div>
  );
}
