export type SiteMode = 'b2b' | 'toc';

export type B2BPage = 'home' | 'about' | 'products' | 'partners' | 'oem' | 'contact';
export type ToCPage =
  | 'home'
  | 'categories'
  | 'products'
  | 'product-detail'
  | 'story'
  | 'support'
  | 'contact'
  | 'cart';

export interface CategoryTreeNode {
  id: string;
  label: string;
  children?: CategoryTreeNode[];
}

export interface B2BPartner {
  id: string;
  name: string;
  sector: '日系機車大廠 OEM' | '歐美醫療通路品牌' | '國際授權兒童車廠' | '台灣連鎖醫療通路';
  region: string;
  cooperationYears: string;
  scope: string;
  outcome: string;
}

export interface B2BProduct {
  id: string;
  modelCode: string;
  name: string;
  englishName: string;
  category: '醫療電動代步車' | '電動輪椅' | 'C.T.M. 兒童騎乘車' | '機車精密零組件';
  subCategory: string;
  taxonomyPath: string[];
  certifications: ('ISO 13485' | 'CE MDR' | 'FDA 510k' | 'EN71' | 'IATF 16949')[];
  driveType: '後輪驅動' | '雙馬達驅動' | '折疊鋰電' | 'OEM 客製';
  coopMode: ('ODM 聯合開發' | 'OEM 代工製造' | '區域經銷代理')[];
  maxLoadKg: number;
  rangeKm: number;
  moq: string;
  leadTime: string;
  image: string;
  highlights: string[];
  specs: { label: string; value: string }[];
}

export interface ToCProduct {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  audience: '銀髮樂齡' | '居家照護' | '兒童親子';
  category: '折疊代步車' | '四輪戶外車' | '電動輪椅' | '授權兒童電動車';
  subCategory: string;
  taxonomyPath: string[];
  priceTWD: number;
  originalPriceTWD?: number;
  rangeLabel: '15km 輕旅行' | '25km 日常採買' | '40km+ 長距離' | '親子室內外';
  deliveryType: ('全台免運現貨' | '門市預約試乘')[];
  subsidyEligible: boolean;
  colors: { name: string; hex: string }[];
  image: string;
  badgeText?: string;
  features: string[];
  specs: { label: string; value: string }[];
}

export interface CartItem {
  product: ToCProduct;
  selectedColor: string;
  quantity: number;
}
