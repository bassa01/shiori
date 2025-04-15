'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { FaSearch, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { searchLocation, formatAddress, NominatimResult } from '../../lib/location-utils';

interface AddressSearchProps {
  onLocationSelect: (address: string, latitude: number, longitude: number) => void;
  initialValue?: string;
  label?: string;
  placeholder?: string;
}

export default function AddressSearch({
  onLocationSelect,
  initialValue = '',
  label = '場所',
  placeholder = '場所名を入力して検索...'
}: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await searchLocation(query);
      setResults(searchResults);
      setShowResults(true);
    } catch (err) {
      console.error('検索エラー:', err);
      setError('検索中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  // 検索結果の外側をクリックしたら結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 検索クエリが変更されたら自動検索
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await handleSearch();
    }, 500); // 入力から500ms後に検索実行

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, handleSearch]);

  const handleSelectResult = (result: NominatimResult) => {
    const formattedAddress = formatAddress(result);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setQuery(formattedAddress);
    if (!isNaN(lat) && !isNaN(lon)) {
      onLocationSelect(formattedAddress, lat, lon);
    } else {
      console.warn('Invalid latitude/longitude received from Nominatim:', result.lat, result.lon);
      onLocationSelect(formattedAddress, 0, 0); 
    }
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="mb-1">
        <Label htmlFor="location-search">{label}</Label>
      </div>
      
      <div className="flex">
        <Input
          id="location-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-2"
          onClick={handleSearch}
          disabled={isSearching || query.trim().length < 2}
        >
          {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {results.map((result) => (
              <li
                key={result.place_id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => handleSelectResult(result)}
              >
                <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <div className="font-medium">{result.name || result.address.tourism || result.address.road}</div>
                  <div className="text-sm text-gray-600 truncate">{result.display_name}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showResults && results.length === 0 && query.trim().length >= 2 && !isSearching && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-500">検索結果が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}
