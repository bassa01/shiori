"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FaPlus, FaFileImport } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { importItinerary } from '../../lib/client-api';

export default function HomeClientActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // インポート処理
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            throw new Error('ファイルの読み込みに失敗しました');
          }
          
          const importData = JSON.parse(event.target.result);
          const result = await importItinerary(importData);
          
          // インポート成功後、新しいしおりページに移動
          router.push(`/itinerary/${result.id}`);
        } catch (err) {
          console.error('Error processing import file:', err);
          setError('しおりのインポート中にエラーが発生しました');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
        setLoading(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Error importing itinerary:', err);
      setError('しおりのインポート中にエラーが発生しました');
      setLoading(false);
    } finally {
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <label
          htmlFor="import-file-home"
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md flex items-center cursor-pointer"
        >
          <FaFileImport className="mr-2" /> インポート
          <input
            id="import-file-home"
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
            ref={fileInputRef}
          />
        </label>
        
        <Link 
          href="/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> 新規作成
        </Link>
      </div>
      
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mt-4" role="alert">
          <p>処理中...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <p>{error}</p>
        </div>
      )}
    </>
  );
}
