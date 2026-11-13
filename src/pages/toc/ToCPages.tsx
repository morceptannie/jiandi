import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Layers,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { CartItem, ToCPage, ToCProduct } from '../../types';
import {
  IMAGES,
  TOC_CATEGORY_SHOWCASE,
  TOC_PRODUCTS,
  TOC_TAXONOMY_TREE,
} from '../../data/chientiData';
import {
  AnimatedNumber,
  HighlightText,
  RevealBlock,
  SafeImage,
} from '../../components/MotionPrimitives';
import {
  FacetGroup,
  FilterEverythingPro,
} from '../../components/FilterEverythingPro';

interface ToCPagesProps {
  page: ToCPage;
  onNavigate: (page: ToCPage) => void;
  cart: CartItem[];
  onAddToCart: (product: ToCProduct, color: string) => void;
  onUpdateCartQty: (sku: string, color: string, delta: number) => void;
  onRemoveCartItem: (sku: string, color: string) => void;
  onClearCart: () => void;
}

export const ToCPages: React.FC<ToCPagesProps> = ({
  page,
  onNavigate,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
}) => {
  // Filter Everything Pro State (Multi-level Hierarchy + Facets + Price Range)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreeNodes, setSelectedTreeNodes] = useState<string[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([10000, 80000]);
  const [sortBy, setSortBy] = useState('featured');

  // PDP State
  const [selectedProduct, setSelectedProduct] = useState<ToCProduct>(TOC_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<string>(TOC_PRODUCTS[0].colors[0].name);
  const [addedToast, setAddedToast] = useState<string>('');

  // Unified ToC Contact & Test-Ride Form State
  const [contactTab, setContactTab] = useState<'商品諮詢與補助' | '預約門市試乘' | '售後保固維修'>(
    '商品諮詢與補助'
  );
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    store: '新北新莊原廠體驗館',
    date: '2026-11-20',
    model: TOC_PRODUCTS[0].name,
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactTicketId, setContactTicketId] = useState('');

  // Cart Checkout Form
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    postalCode: '',
    payment: '貨到付款 / 專人到府交車收款',
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const handleToggleTreeNode = (nodeId: string) => {
    setSelectedTreeNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleToggleFacet = (groupId: string, value: string) => {
    setSelectedFacets((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(value);
      const next = exists ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [groupId]: next };
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTreeNodes([]);
    setSelectedFacets({});
    setPriceRange([10000, 80000]);
    setSortBy('featured');
  };

  const getTreeNodeCount = (nodeId: string) =>
    TOC_PRODUCTS.filter((p) => p.taxonomyPath.includes(nodeId)).length;

  const openProductDetail = (p: ToCProduct) => {
    setSelectedProduct(p);
    setSelectedColor(p.colors[0].name);
    onNavigate('product-detail');
  };

  const goToShopWithFilter = (opts?: { treeNode?: string; audience?: string }) => {
    setSelectedTreeNodes(opts?.treeNode ? [opts.treeNode] : []);
    setSelectedFacets(opts?.audience ? { audience: [opts.audience] } : {});
    onNavigate('products');
  };

  const triggerAddToast = (product: ToCProduct, color: string) => {
    onAddToCart(product, color);
    setAddedToast(`已將「${product.name}」(${color}) 加入購物車`);
    setTimeout(() => setAddedToast(''), 2600);
  };

  const facets: FacetGroup[] = useMemo(() => {
    const audiences = ['銀髮樂齡', '居家照護', '兒童親子'];
    const ranges = ['15km 輕旅行', '25km 日常採買', '40km+ 長距離', '親子室內外'];
    const deliveries = ['全台免運現貨', '門市預約試乘'];

    return [
      {
        id: 'audience',
        title: '適用對象',
        options: audiences.map((a) => ({
          value: a,
          label: a,
          count: TOC_PRODUCTS.filter((p) => p.audience === a).length,
        })),
      },
      {
        id: 'rangeLabel',
        title: '使用續航情境',
        options: ranges.map((r) => ({
          value: r,
          label: r,
          count: TOC_PRODUCTS.filter((p) => p.rangeLabel === r).length,
        })),
      },
      {
        id: 'deliveryType',
        title: '配送與試乘服務',
        options: deliveries.map((d) => ({
          value: d,
          label: d,
          count: TOC_PRODUCTS.filter((p) => p.deliveryType.includes(d as never)).length,
        })),
      },
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    let list = TOC_PRODUCTS.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (selectedTreeNodes.length > 0) {
        const matchTree = selectedTreeNodes.some((nodeId) =>
          p.taxonomyPath.includes(nodeId)
        );
        if (!matchTree) return false;
      }

      if (p.priceTWD < priceRange[0] || p.priceTWD > priceRange[1]) return false;

      const audSel = selectedFacets.audience || [];
      if (audSel.length > 0 && !audSel.includes(p.audience)) return false;

      const rngSel = selectedFacets.rangeLabel || [];
      if (rngSel.length > 0 && !rngSel.includes(p.rangeLabel)) return false;

      const delSel = selectedFacets.deliveryType || [];
      if (delSel.length > 0 && !delSel.some((d) => p.deliveryType.includes(d as never))) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.priceTWD - b.priceTWD);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.priceTWD - a.priceTWD);
    }
    return list;
  }, [searchQuery, selectedTreeNodes, priceRange, selectedFacets, sortBy]);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.priceTWD * item.quantity, 0);
  const freeShippingThreshold = 15000;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !checkoutForm.name.trim() ||
      !checkoutForm.phone.trim() ||
      !checkoutForm.address.trim() ||
      !checkoutForm.postalCode.trim()
    ) {
      setCheckoutError('請完整填寫收件人姓名、聯絡電話、郵遞區號與送貨地址。');
      return;
    }
    setCheckoutError('');
    setConfirmedOrderId(`CTM-${Math.floor(100000 + Math.random() * 900000)}`);
    onClearCart();
  };

  const handleToCContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.email.includes('@')) {
      setContactError('請填寫姓名、手機號碼與有效電子信箱，以便客服人員回覆。');
      return;
    }
    setContactError('');
    setContactTicketId(`CS-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  // =========================================================================
  // PAGE 1: ToC HOME (Minimal headings + direct navigation to Categories/Shop/Contact)
  // =========================================================================
  if (page === 'home') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738]">
        <section className="relative bg-[#123738] text-[#EFE8D8] overflow-hidden">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 px-4 sm:px-8 py-14 sm:py-20 flex flex-col justify-center space-y-6">
              <div className="text-xs sm:text-sm font-bold tracking-widest text-[#F59E0B]">
                建迪企業股份有限公司 · C.T.M. 原廠直營館
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl leading-[1.15] text-balance text-white">
                台灣半世紀工藝
                <span className="block mt-2">
                  陪伴全家
                  <HighlightText variant="coral" className="!text-amber-300">
                    安心出發
                  </HighlightText>
                </span>
              </h1>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('categories')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D94E34] text-white font-bold text-sm sm:text-base hover:bg-[#c24129] transition-colors shadow-lg shadow-black/20 min-h-[44px]"
                >
                  瀏覽產品分類
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#EFE8D8]/40 text-[#EFE8D8] font-bold text-sm sm:text-base hover:bg-white/10 transition-colors min-h-[44px]"
                >
                  聯繫我們 / 預約試乘
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 min-h-[300px] sm:min-h-[420px] relative">
              <SafeImage
                src={IMAGES.heroToC}
                alt="台灣樂齡銀髮族騎乘建迪電動代步車開心出遊"
                darkSurface={false}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Warm Trust Strip */}
        <section className="bg-[#194A4B] text-[#EFE8D8] border-b border-[#123738]/20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#F59E0B]">
                <AnimatedNumber target={50} suffix=" 年" />
              </div>
              <div className="text-xs sm:text-sm opacity-85 mt-0.5">台灣建迪原廠製造史</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white">
                <AnimatedNumber target={3} suffix=" 年保固" />
              </div>
              <div className="text-xs sm:text-sm opacity-85 mt-0.5">車架原廠安心保障</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#F59E0B]">
                <AnimatedNumber target={100} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm opacity-85 mt-0.5">衛福部醫器字號合規</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white">專人到府</div>
              <div className="text-xs sm:text-sm opacity-85 mt-0.5">交車教學與長照補助協助</div>
            </div>
          </div>
        </section>

        {/* Minimal Category Portals */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14 sm:py-16 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-[#123738]">
              依對象探索<HighlightText variant="teal">產品分類</HighlightText>
            </h2>
            <button
              type="button"
              onClick={() => goToShopWithFilter()}
              className="text-sm font-bold text-[#D94E34] hover:underline inline-flex items-center gap-1"
            >
              開啟多層級商品篩選 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '銀髮樂齡代步車',
                sub: '輕量秒收 · 外出旅遊首選',
                treeNode: 'senior-scooters',
                image: IMAGES.foldingScooter,
              },
              {
                title: '居家照護電動輪椅',
                sub: '符合長照補助 · 室內迴轉靈巧',
                treeNode: 'homecare-chairs',
                image: IMAGES.powerWheelchair,
              },
              {
                title: 'C.T.M. 親子電動童車',
                sub: '歐盟無毒認證 · 家長遙控急停',
                treeNode: 'family-rideon',
                image: IMAGES.kidsRideOn,
              },
            ].map((cat, idx) => (
              <RevealBlock key={cat.title} delay={idx * 0.08}>
                <button
                  type="button"
                  onClick={() => goToShopWithFilter({ treeNode: cat.treeNode })}
                  className="group w-full text-left rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#123738]/15 hover:border-[#D94E34] transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#DDD3BC]">
                    <SafeImage
                      src={cat.image}
                      alt={cat.title}
                      darkSurface={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-display font-bold text-[#123738] group-hover:text-[#D94E34] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#123738]/75 mt-1">{cat.sub}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#D94E34] shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </RevealBlock>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('story')}
              className="p-6 sm:p-8 rounded-2xl bg-[#123738] text-[#EFE8D8] text-left flex items-center justify-between gap-4 hover:bg-[#174647] transition-colors group"
            >
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  認識建迪 50 年品牌故事
                </h3>
                <p className="text-sm opacity-80 mt-1">從山葉機車零件到全台家庭信賴的輔具專家</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#F59E0B] shrink-0 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="p-6 sm:p-8 rounded-2xl bg-[#D94E34] text-white text-left flex items-center justify-between gap-4 hover:bg-[#c34129] transition-colors group"
            >
              <div>
                <h3 className="text-xl font-display font-bold">線上聯繫我們 & 預約試乘</h3>
                <p className="text-sm opacity-90 mt-1">長照補助申請諮詢 · 原廠技師一對一服務</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white shrink-0 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // PAGE 2: ToC CATEGORIES ARCHITECTURE (產品分類專頁)
  // =========================================================================
  if (page === 'categories') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738] py-12 sm:py-16 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#123738]/15 pb-6">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-mono-tabular font-bold tracking-widest text-[#D94E34]">
                PRODUCT ARCHITECTURE · 產品分類總覽
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black">
                建迪生活館<HighlightText variant="teal">四大產品分類</HighlightText>
              </h1>
              <p className="text-sm sm:text-base opacity-80">
                點擊任一分類或細分車款，立即進入「嚴選商品」並自動套用多層級篩選條件。
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToShopWithFilter()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123738] text-[#EFE8D8] font-bold text-sm min-h-[44px] shrink-0"
            >
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              瀏覽全部商品與篩選器
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TOC_CATEGORY_SHOWCASE.map((cat, idx) => (
              <RevealBlock
                key={cat.id}
                delay={idx * 0.08}
                className="rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 overflow-hidden flex flex-col justify-between"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch flex-1">
                  <div className="sm:col-span-5 bg-[#DDD3BC] min-h-[200px]">
                    <SafeImage
                      src={cat.image}
                      alt={cat.title}
                      darkSurface={false}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#0F766E]">
                        {cat.parent} · {cat.priceHint}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-display font-black">{cat.title}</h2>
                      <p className="text-sm opacity-80 leading-relaxed">{cat.tagline}</p>

                      {/* Clickable Level-3 Subcategories */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {cat.subItems.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => goToShopWithFilter({ treeNode: sub })}
                            className="px-3 py-1.5 rounded-lg bg-[#E6DEC8] border border-[#123738]/20 text-xs font-bold hover:bg-[#123738] hover:text-[#EFE8D8] transition-colors"
                          >
                            {sub} →
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => goToShopWithFilter({ treeNode: cat.id })}
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-[#D94E34] hover:underline pt-2"
                    >
                      查看「{cat.title}」全系列
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </RevealBlock>
            ))}
          </div>

          {/* 3-Step Purchase & Care Guide */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#123738] text-[#EFE8D8] space-y-6">
            <h2 className="text-2xl font-display font-bold text-white">
              挑選適合家人的移動夥伴：三步驟指南
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01. 依生活動線選分類',
                  desc: '常搭車出遊或進出社區電梯選「折疊代步車」；長距離散步選「四輪避震車」；室內照護選「電動輪椅」。',
                },
                {
                  step: '02. 確認長照 / 身障補助',
                  desc: '多款電動輪椅與代步車具備衛福部醫器字號，可先透過聯繫表單由專員協助確認補助額度。',
                },
                {
                  step: '03. 預約試乘或到府交車',
                  desc: '全台指定車款免運費，並提供專人到府組裝與一對一安全駕駛教學。',
                },
              ].map((s) => (
                <div key={s.step} className="p-5 rounded-xl bg-[#194A4B] space-y-2">
                  <div className="text-sm font-bold text-[#F59E0B]">{s.step}</div>
                  <p className="text-sm opacity-90 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 3: ToC PRODUCTS + MULTI-LEVEL FILTER EVERYTHING PRO
  // =========================================================================
  if (page === 'products') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738] py-10 sm:py-14 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#123738]/15 pb-6">
            <div className="space-y-2">
              <div className="text-xs font-mono-tabular font-bold tracking-widest text-[#D94E34]">
                C.T.M. STORE · MULTI-LEVEL FILTER EVERYTHING PRO
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-[#123738]">
                建迪原廠<HighlightText variant="coral">直購商品館</HighlightText>
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('cart')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123738] text-[#EFE8D8] font-bold text-sm min-h-[44px] shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
              查看購物車 ({cart.reduce((s, i) => s + i.quantity, 0)})
            </button>
          </div>

          <AnimatePresence>
            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 rounded-xl bg-[#123738] text-[#EFE8D8] text-sm font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {addedToast}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('cart')}
                  className="text-[#F59E0B] font-bold underline underline-offset-4"
                >
                  前往結帳
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <FilterEverythingPro
            theme="toc"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="搜尋車款名稱、折疊、輪椅、童車..."
            hierarchyTree={{
              title: '多層級商品分類樹',
              tree: TOC_TAXONOMY_TREE,
              selectedNodeIds: selectedTreeNodes,
              onToggleNode: handleToggleTreeNode,
              getNodeCount: getTreeNodeCount,
            }}
            facets={facets}
            selectedFacets={selectedFacets}
            onToggleFacet={handleToggleFacet}
            rangeConfig={{
              label: '價格預算區間',
              unit: 'NT$',
              min: 10000,
              max: 80000,
              step: 2000,
              value: priceRange,
              onChange: setPriceRange,
            }}
            sortOptions={[
              { value: 'featured', label: '熱門精選推薦' },
              { value: 'price-asc', label: '價格：由低到高' },
              { value: 'price-desc', label: '價格：由高到低' },
            ]}
            sortValue={sortBy}
            onSortChange={setSortBy}
            onResetAll={handleResetFilters}
            totalResults={filteredProducts.length}
            totalCatalog={TOC_PRODUCTS.length}
          >
            {filteredProducts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 text-center space-y-4">
                <p className="text-lg font-bold">目前多層級條件下尚無符合商品</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#D94E34] text-white font-bold text-sm"
                >
                  清除條件看全部商品
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <motion.article
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 overflow-hidden flex flex-col justify-between hover:border-[#D94E34] transition-colors group"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => openProductDetail(product)}
                        className="w-full aspect-[4/3] bg-[#DDD3BC] overflow-hidden block text-left"
                      >
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          darkSurface={false}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>

                      <div className="p-5 sm:p-6 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#123738]/75">
                          <span>{product.category}</span>
                          <span aria-hidden="true">›</span>
                          <span>{product.subCategory}</span>
                          {product.badgeText && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#D94E34] font-bold">{product.badgeText}</span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openProductDetail(product)}
                          className="text-left block"
                        >
                          <h2 className="text-lg sm:text-xl font-display font-bold text-[#123738] group-hover:text-[#D94E34] transition-colors">
                            {product.name}
                          </h2>
                        </button>
                        <p className="text-sm text-[#123738]/80">{product.subtitle}</p>

                        <div className="pt-2 flex items-baseline gap-2.5">
                          <span className="text-xl font-display font-black text-[#D94E34] font-mono-tabular">
                            NT$ {product.priceTWD.toLocaleString()}
                          </span>
                          {product.originalPriceTWD && (
                            <span className="text-xs line-through opacity-55 font-mono-tabular">
                              NT$ {product.originalPriceTWD.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 sm:px-6 pb-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => triggerAddToast(product, product.colors[0].name)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#D94E34] text-white font-bold text-sm hover:bg-[#bd3f28] transition-colors min-h-[44px]"
                      >
                        加入購物車
                      </button>
                      <button
                        type="button"
                        onClick={() => openProductDetail(product)}
                        className="py-2.5 px-4 rounded-xl border border-[#123738]/30 text-[#123738] font-bold text-sm hover:bg-[#123738]/8 transition-colors min-h-[44px]"
                      >
                        詳情規格
                      </button>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </FilterEverythingPro>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 4: ToC PRODUCT DETAIL (PDP)
  // =========================================================================
  if (page === 'product-detail') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738] py-10 sm:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="text-sm font-bold text-[#123738]/80 hover:text-[#D94E34] inline-flex items-center gap-1"
          >
            ← 返回嚴選商品列表
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#123738]/15 lg:sticky lg:top-24">
              <div className="aspect-[4/3]">
                <SafeImage
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  darkSurface={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#D94E34]">
                  {selectedProduct.sku} · {selectedProduct.category} › {selectedProduct.subCategory}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-[#123738]">
                  {selectedProduct.name}
                </h1>
                <p className="text-sm sm:text-base text-[#123738]/80">{selectedProduct.subtitle}</p>
              </div>

              <div className="flex items-baseline gap-3 pb-4 border-b border-[#123738]/15">
                <span className="text-3xl font-display font-black text-[#D94E34] font-mono-tabular">
                  NT$ {selectedProduct.priceTWD.toLocaleString()}
                </span>
                {selectedProduct.subsidyEligible && (
                  <span className="text-xs font-bold text-[#0F766E]">
                    可申請長照 / 身障輔具補助
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold">
                  選擇車身配色：<span className="text-[#D94E34]">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border min-h-[40px] transition-all ${
                        selectedColor === c.name
                          ? 'bg-[#123738] text-[#EFE8D8] border-[#123738]'
                          : 'bg-[#E6DEC8]/70 text-[#123738] border-[#123738]/20'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                {selectedProduct.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E] mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="divide-y divide-[#123738]/10 border border-[#123738]/15 rounded-xl overflow-hidden">
                {selectedProduct.specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between px-4 py-2.5 text-sm bg-[#E6DEC8]/45"
                  >
                    <span className="opacity-75">{s.label}</span>
                    <span className="font-mono-tabular font-bold">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(selectedProduct, selectedColor);
                    onNavigate('cart');
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#D94E34] text-white font-extrabold text-sm hover:bg-[#bd3f28] transition-colors min-h-[44px]"
                >
                  立即購買 / 加入購物車
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactTab('預約門市試乘');
                    setContactForm((f) => ({ ...f, model: selectedProduct.name }));
                    onNavigate('contact');
                  }}
                  className="py-3.5 px-5 rounded-xl border border-[#123738]/30 font-bold text-sm hover:bg-[#123738]/8 min-h-[44px]"
                >
                  聯繫預約試乘
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 5: ToC BRAND STORY
  // =========================================================================
  if (page === 'story') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738] py-12 sm:py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-4 max-w-3xl">
            <div className="text-xs font-bold tracking-widest text-[#D94E34]">
              OUR HERITAGE · 建迪品牌故事
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black leading-tight">
              把<HighlightText variant="coral">造機車的嚴謹</HighlightText>，放進守護家人的每一台車
            </h1>
            <p className="text-base leading-relaxed opacity-85">
              許多人不知道，建迪企業自 1975 年起便為日本知名機車大廠代工精密車架與引擎零件。因為懂得金屬安全與機構耐用的重要，我們把最高規格帶進銀髮代步車與 C.T.M. 兒童騎乘車。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden bg-[#123738] text-[#EFE8D8] p-8 space-y-4">
              <HeartHandshake className="w-8 h-8 text-[#F59E0B]" />
              <h2 className="text-2xl font-display font-bold text-white">
                台灣原廠保固，絕不變成輔具孤兒
              </h2>
              <p className="text-sm opacity-85 leading-relaxed">
                坊間許多來路不明的進口代步車缺乏維修零件。建迪在桃園新屋與新北新莊擁有完整原廠備料與技師團隊，提供零件供應與到府維修支援。
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden bg-[#EFE8D8] border border-[#123738]/15 p-8 space-y-4">
              <Truck className="w-8 h-8 text-[#D94E34]" />
              <h2 className="text-2xl font-display font-bold">
                全台專人交車教學與長照補助協助
              </h2>
              <p className="text-sm opacity-85 leading-relaxed">
                購買建迪醫療電動輪椅或代步車，由專人送到府上組裝調校並手把手教導長輩操作，同時提供衛福部核准字號文件協助申請政府補助。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 6: ToC CONTACT & TEST-RIDE / SUPPORT FORM (聯繫我們)
  // =========================================================================
  if (page === 'contact' || page === 'support') {
    return (
      <div className="bg-[#E6DEC8] text-[#123738] py-12 sm:py-16">
        <div className="max-w-[1060px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-3">
            <div className="text-xs font-mono-tabular font-bold tracking-widest text-[#D94E34]">
              CONTACT & SERVICE · 消費者聯繫與試乘表單
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black">
              聯繫<HighlightText variant="teal">建迪原廠客服</HighlightText>與預約試乘
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 space-y-6">
              {/* Inquiry Mode Tabs */}
              <div className="flex flex-wrap gap-2">
                {(
                  ['商品諮詢與補助', '預約門市試乘', '售後保固維修'] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setContactTab(tab);
                      setContactTicketId('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors min-h-[40px] ${
                      contactTab === tab
                        ? 'bg-[#123738] text-[#EFE8D8]'
                        : 'bg-[#E6DEC8] text-[#123738] hover:bg-[#123738]/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {contactTicketId ? (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#0F766E] mx-auto" />
                  <h2 className="text-2xl font-bold">
                    已收到您的「{contactTab}」申請（單號 #{contactTicketId}）
                  </h2>
                  <p className="text-sm opacity-85">
                    建迪專員將於 1 個工作天內透過電話 {contactForm.phone} 或信箱 {contactForm.email} 與您聯繫。
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactTicketId('')}
                    className="px-5 py-2.5 rounded-xl bg-[#123738] text-[#EFE8D8] font-bold text-sm"
                  >
                    填寫另一則聯繫表單
                  </button>
                </div>
              ) : (
                <form onSubmit={handleToCContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">您的姓名 *</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="陳小姐"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none focus:border-[#D94E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">聯絡手機 *</label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="0912-345-678"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none focus:border-[#D94E34]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5">電子信箱 *</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none focus:border-[#D94E34]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5">感興趣或購買車款</label>
                      <select
                        value={contactForm.model}
                        onChange={(e) => setContactForm({ ...contactForm, model: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none"
                      >
                        {TOC_PRODUCTS.map((p) => (
                          <option key={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {contactTab === '預約門市試乘' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5">體驗據點</label>
                        <select
                          value={contactForm.store}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, store: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none"
                        >
                          <option>新北新莊原廠體驗館</option>
                          <option>桃園新屋展示中心</option>
                          <option>台中南屯特約門市</option>
                          <option>高雄左營特約門市</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1.5">期望試乘日期</label>
                        <input
                          type="date"
                          value={contactForm.date}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, date: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1.5">諮詢或服務需求說明</label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder={
                        contactTab === '商品諮詢與補助'
                          ? '請留下長輩身高體重、使用情境或是否需要協助申請長照輔具補助...'
                          : contactTab === '預約門市試乘'
                          ? '請說明同行人數或偏好的預約時段（上午 / 下午）...'
                          : '請簡述產品序號、購買日期與需要檢測維修的狀況...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/75 border border-[#123738]/20 text-sm outline-none focus:border-[#D94E34]"
                    />
                  </div>

                  {contactError && (
                    <p className="text-xs font-bold text-[#D94E34]">{contactError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#D94E34] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#bd3f28] transition-colors min-h-[44px]"
                  >
                    {contactTab === '預約門市試乘' ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    送出「{contactTab}」表單
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="p-6 rounded-2xl bg-[#123738] text-[#EFE8D8] space-y-4">
                <h2 className="text-lg font-display font-bold text-white">原廠直營客服與展示據點</h2>
                <div className="space-y-3 text-sm opacity-90">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                    <span>新北新莊原廠體驗館：新北市新莊區民安路 420 號（備有專屬試乘車道）</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono-tabular">
                    <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span>免付費諮詢專線：0800-889-575</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span>care@chienti.com.tw</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 space-y-2">
                <h3 className="font-bold text-base">服務時間與售後承諾</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  週一至週六 09:00–18:00。台灣本島享有原廠技師到府保養維修服務，保固期內零件透明計價，長照補助文件免費協助整理。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 7: ToC CART & CHECKOUT
  // =========================================================================
  return (
    <div className="bg-[#E6DEC8] text-[#123738] py-12 sm:py-16 min-h-[75vh]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-8">
        <h1 className="text-3xl font-display font-black">
          購物車與<HighlightText variant="coral">安心結帳</HighlightText>
        </h1>

        {confirmedOrderId ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#0F766E] mx-auto" />
            <h2 className="text-2xl font-display font-bold">
              訂單 #{confirmedOrderId} 已確認 — 正在為您備貨
            </h2>
            <p className="text-sm opacity-85">
              專人將於出貨前致電 {checkoutForm.phone} 與您確認到府交車教學時段。
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmedOrderId('');
                onNavigate('products');
              }}
              className="px-6 py-3 rounded-xl bg-[#123738] text-[#EFE8D8] font-bold text-sm"
            >
              繼續逛嚴選商品
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 text-center space-y-4">
            <ShoppingBag className="w-10 h-10 mx-auto opacity-50" />
            <p className="text-lg font-bold">您的購物車目前是空的</p>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="px-6 py-3 rounded-xl bg-[#D94E34] text-white font-bold text-sm"
            >
              前往嚴選商品館挑選車款
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.sku}-${item.selectedColor}`}
                  className="p-4 sm:p-5 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 flex items-center gap-4"
                >
                  <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-[#DDD3BC]">
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      darkSurface={false}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{item.product.name}</h3>
                    <div className="text-xs opacity-70 mt-0.5">配色：{item.selectedColor}</div>
                    <div className="font-mono-tabular font-bold text-[#D94E34] mt-1">
                      NT$ {(item.product.priceTWD * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCartQty(item.product.sku, item.selectedColor, -1)
                      }
                      className="w-8 h-8 rounded-lg border border-[#123738]/25 flex items-center justify-center"
                      aria-label="減少數量"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-tabular font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCartQty(item.product.sku, item.selectedColor, 1)
                      }
                      className="w-8 h-8 rounded-lg border border-[#123738]/25 flex items-center justify-center"
                      aria-label="增加數量"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.product.sku, item.selectedColor)}
                      className="w-8 h-8 rounded-lg text-rose-700 hover:bg-rose-700/10 flex items-center justify-center ml-1"
                      aria-label="移除商品"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCheckoutSubmit}
              className="lg:col-span-5 p-6 rounded-2xl bg-[#EFE8D8] border border-[#123738]/15 space-y-4"
            >
              <h2 className="text-lg font-bold border-b border-[#123738]/15 pb-3">
                訂購資訊與免運總計
              </h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>商品小計</span>
                  <span className="font-mono-tabular font-bold">
                    NT$ {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>專人配送費用</span>
                  <span className="font-mono-tabular font-bold text-[#0F766E]">
                    {cartSubtotal >= freeShippingThreshold ? '已達免運門檻 (NT$ 0)' : 'NT$ 500'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 border-t border-[#123738]/15">
                  <span>應付總額</span>
                  <span className="font-mono-tabular text-[#D94E34]">
                    NT${' '}
                    {(
                      cartSubtotal + (cartSubtotal >= freeShippingThreshold ? 0 : 500)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="收件人姓名 *"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/70 border border-[#123738]/20 text-sm outline-none"
                />
                <input
                  type="tel"
                  placeholder="聯絡電話 *"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/70 border border-[#123738]/20 text-sm outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="郵遞區號 *"
                    value={checkoutForm.postalCode}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })
                    }
                    className="col-span-1 px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/70 border border-[#123738]/20 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="送貨地址 *"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/70 border border-[#123738]/20 text-sm outline-none"
                  />
                </div>
                <select
                  value={checkoutForm.payment}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, payment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E6DEC8]/70 border border-[#123738]/20 text-sm outline-none"
                >
                  <option>貨到付款 / 專人到府交車收款</option>
                  <option>線上信用卡分期 (0 利率)</option>
                  <option>銀行轉帳匯款</option>
                </select>
              </div>

              {checkoutError && (
                <p className="text-xs font-bold text-[#D94E34]">{checkoutError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D94E34] text-white font-extrabold text-sm hover:bg-[#bd3f28] transition-colors min-h-[44px]"
              >
                確認送出訂單
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
