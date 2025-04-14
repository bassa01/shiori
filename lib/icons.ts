import { 
  FaPlane, FaTrain, FaBus, FaCar, FaShip, FaWalking, FaBicycle, FaSubway,
  FaHotel, FaBed, FaHome, FaBuilding,
  FaUtensils, FaCoffee, FaGlassCheers, FaIceCream, FaShoppingBag,
  FaCamera, FaLandmark, FaTree, FaMountain, FaUmbrellaBeach, FaSwimmingPool,
  FaTicketAlt, FaTheaterMasks, FaMusic, FaFilm,
  FaMapMarkerAlt, FaInfoCircle, FaExclamationTriangle, FaStar
} from 'react-icons/fa';
import { IconType } from 'react-icons';

export interface IconOption {
  id: string;
  name: string;
  icon: IconType;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'other';
}

export const icons: IconOption[] = [
  // Transport
  { id: 'plane', name: '飛行機', icon: FaPlane, category: 'transport' },
  { id: 'train', name: '電車', icon: FaTrain, category: 'transport' },
  { id: 'bus', name: 'バス', icon: FaBus, category: 'transport' },
  { id: 'car', name: '車', icon: FaCar, category: 'transport' },
  { id: 'ship', name: '船', icon: FaShip, category: 'transport' },
  { id: 'walking', name: '徒歩', icon: FaWalking, category: 'transport' },
  { id: 'bicycle', name: '自転車', icon: FaBicycle, category: 'transport' },
  { id: 'subway', name: '地下鉄', icon: FaSubway, category: 'transport' },
  
  // Accommodation
  { id: 'hotel', name: 'ホテル', icon: FaHotel, category: 'accommodation' },
  { id: 'bed', name: '宿泊', icon: FaBed, category: 'accommodation' },
  { id: 'home', name: '家', icon: FaHome, category: 'accommodation' },
  { id: 'building', name: '建物', icon: FaBuilding, category: 'accommodation' },
  
  // Food
  { id: 'restaurant', name: 'レストラン', icon: FaUtensils, category: 'food' },
  { id: 'coffee', name: 'カフェ', icon: FaCoffee, category: 'food' },
  { id: 'bar', name: 'バー', icon: FaGlassCheers, category: 'food' },
  { id: 'icecream', name: 'アイス', icon: FaIceCream, category: 'food' },
  { id: 'shopping', name: 'ショッピング', icon: FaShoppingBag, category: 'food' },
  
  // Activity
  { id: 'camera', name: '観光', icon: FaCamera, category: 'activity' },
  { id: 'landmark', name: '名所', icon: FaLandmark, category: 'activity' },
  { id: 'nature', name: '自然', icon: FaTree, category: 'activity' },
  { id: 'mountain', name: '山', icon: FaMountain, category: 'activity' },
  { id: 'beach', name: 'ビーチ', icon: FaUmbrellaBeach, category: 'activity' },
  { id: 'pool', name: 'プール', icon: FaSwimmingPool, category: 'activity' },
  { id: 'ticket', name: 'チケット', icon: FaTicketAlt, category: 'activity' },
  { id: 'theater', name: '劇場', icon: FaTheaterMasks, category: 'activity' },
  { id: 'music', name: '音楽', icon: FaMusic, category: 'activity' },
  { id: 'movie', name: '映画', icon: FaFilm, category: 'activity' },
  
  // Other
  { id: 'location', name: '場所', icon: FaMapMarkerAlt, category: 'other' },
  { id: 'info', name: '情報', icon: FaInfoCircle, category: 'other' },
  { id: 'warning', name: '注意', icon: FaExclamationTriangle, category: 'other' },
  { id: 'star', name: 'お気に入り', icon: FaStar, category: 'other' },
];

export function getIconById(id: string | undefined): IconOption | undefined {
  if (!id) return undefined;
  return icons.find(icon => icon.id === id);
}
