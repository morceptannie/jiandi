import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Factory,
  FileText,
  Globe2,
  Handshake,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { B2BPage, B2BProduct } from '../../types';
import {
  B2B_PARTNERS,
  B2B_PRODUCTS,
  B2B_TAXONOMY_TREE,
  COMPANY_MILESTONES,
  GLOBAL_BASES,
  IMAGES,
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

interface B2BPagesProps {
  page: B2BPage;
  onNavigate: (page: B2BPage) => void;
}

export const B2BPages: React.FC<B2BPagesProps> = ({ page, onNavigate }) => {
  // Filter Everything Pro State (Multi-level Hierarchy + Facets + Range)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreeNodes, setSelectedTreeNodes] = useState<string[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [loadRange, setLoadRange] = useState<[number, number]>([40, 220]);
  const [sortBy, setSortBy] = useState('featured');

  // Partners Sector Filter
  const [partnerSector, setPartnerSector] = useState<string>('全部');

  // Product Quick Spec & RFQ Modal
  const [activeProduct, setActiveProduct] = useState<B2BProduct | null>(null);
  const [rfqList, setRfqList] = useState<B2BProduct[]>([]);

  // Accordion State on OEM page
  const [openFaq, setOpenFaq] = useState<number>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    company: '',
    contactName: '',
    phone: '',
    email: '',
    coopType: 'ODM / OEM 客製代工',
    region: '歐洲市場',
    message: '',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    setLoadRange([40, 220]);
    setSortBy('featured');
  };

  const getTreeNodeCount = (nodeId: string) =>
    B2B_PRODUCTS.filter((p) => p.taxonomyPath.includes(nodeId)).length;

  const facets: FacetGroup[] = useMemo(() => {
    const certs = ['ISO 13485', 'CE MDR', 'FDA 510k', 'EN71', 'IATF 16949'];
    const drives = ['後輪驅動', '雙馬達驅動', '折疊鋰電', 'OEM 客製'];
    const coops = ['ODM 聯合開發', 'OEM 代工製造', '區域經銷代理'];

    return [
      {
        id: 'certification',
        title: '國際合規認證',
        options: certs.map((c) => ({
          value: c,
          label: c,
          count: B2B_PRODUCTS.filter((p) => p.certifications.includes(c as never)).length,
        })),
      },
      {
        id: 'driveType',
        title: '驅動與結構架構',
        options: drives.map((d) => ({
          value: d,
          label: d,
          count: B2B_PRODUCTS.filter((p) => p.driveType === d).length,
        })),
      },
      {
        id: 'coopMode',
        title: 'B2B 合作模式',
        options: coops.map((m) => ({
          value: m,
          label: m,
          count: B2B_PRODUCTS.filter((p) => p.coopMode.includes(m as never)).length,
        })),
      },
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    let list = B2B_PRODUCTS.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          p.modelCode.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedTreeNodes.length > 0) {
        const matchTree = selectedTreeNodes.some((nodeId) =>
          p.taxonomyPath.includes(nodeId)
        );
        if (!matchTree) return false;
      }

      if (p.maxLoadKg < loadRange[0] || p.maxLoadKg > loadRange[1]) return false;

      const certSel = selectedFacets.certification || [];
      if (certSel.length > 0 && !certSel.some((c) => p.certifications.includes(c as never))) {
        return false;
      }

      const driveSel = selectedFacets.driveType || [];
      if (driveSel.length > 0 && !driveSel.includes(p.driveType)) return false;

      const coopSel = selectedFacets.coopMode || [];
      if (coopSel.length > 0 && !coopSel.some((m) => p.coopMode.includes(m as never))) {
        return false;
      }

      return true;
    });

    if (sortBy === 'load-desc') {
      list = [...list].sort((a, b) => b.maxLoadKg - a.maxLoadKg);
    } else if (sortBy === 'range-desc') {
      list = [...list].sort((a, b) => b.rangeKm - a.rangeKm);
    }

    return list;
  }, [searchQuery, selectedTreeNodes, loadRange, selectedFacets, sortBy]);

  const toggleRfqItem = (product: B2BProduct) => {
    setRfqList((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product]
    );
  };

  const goToProductsWithNode = (nodeId?: string) => {
    setSelectedFacets({});
    setSelectedTreeNodes(nodeId ? [nodeId] : []);
    onNavigate('products');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !contactForm.company.trim() ||
      !contactForm.contactName.trim() ||
      !contactForm.email.includes('@') ||
      !contactForm.phone.trim()
    ) {
      setFormError('請完整填寫公司名稱、聯絡人姓名、聯絡電話與有效電子郵件。');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  // =========================================================================
  // PAGE 1: B2B HOME (Minimal titles + links to About, Products, Partners, Contact)
  // =========================================================================
  if (page === 'home') {
    const subpagePortals: {
      title: string;
      subtitle: string;
      target: B2BPage;
      treeNode?: string;
      image: string;
      accent: string;
    }[] = [
      {
        title: '產品介紹 · 多層級篩選',
        subtitle: '醫療代步車 / 電動輪椅 / C.T.M. 童車 / CNC 零件',
        target: 'products',
        image: IMAGES.foldingScooter,
        accent: 'from-sky-500/20 to-cyan-500/5 border-sky-400/30',
      },
      {
        title: '關於我們 · 企業簡介',
        subtitle: '1975 創立 · 台灣 / 上海 / 美國營運中心',
        target: 'about',
        image: IMAGES.heroToB,
        accent: 'from-amber-500/20 to-orange-500/5 border-amber-400/30',
      },
      {
        title: '全球合作廠商實績',
        subtitle: 'YAMAHA · SUZUKI · 歐美醫療與授權通路',
        target: 'partners',
        image: IMAGES.powerWheelchair,
        accent: 'from-emerald-500/20 to-teal-500/5 border-emerald-400/30',
      },
      {
        title: '聯繫我們 · 報價洽詢表單',
        subtitle: 'OEM / ODM 開發評估 · 經銷代理申請',
        target: 'contact',
        image: IMAGES.kidsRideOn,
        accent: 'from-indigo-500/20 to-sky-500/5 border-indigo-400/30',
      },
    ];

    return (
      <div className="bg-[#09111E] text-slate-100">
        <section className="relative overflow-hidden border-b border-sky-400/15">
          <div className="absolute inset-0">
            <SafeImage
              src={IMAGES.heroToB}
              alt="建迪企業股份有限公司 醫療輔具與精密載具智慧製造工廠"
              className="w-full h-full object-cover opacity-35 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09111E] via-[#09111E]/85 to-[#09111E]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09111E] via-transparent to-transparent" />
          </div>

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-6"
            >
              <div className="text-sm sm:text-base font-bold tracking-wider text-amber-400">
                SINCE 1975 · TAIWAN PRECISION MANUFACTURING
              </div>

              <h1 className="font-display font-black tracking-tight text-balance leading-[1.12] text-3xl sm:text-5xl lg:text-[58px] text-white">
                建迪企業股份有限公司
                <span className="block mt-2 text-2xl sm:text-4xl lg:text-[42px] text-slate-200">
                  全球<HighlightText variant="cyan">醫療輔具</HighlightText>與
                  <HighlightText variant="amber">載具製造</HighlightText>領航者
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => goToProductsWithNode()}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-[#09111E] font-extrabold text-sm sm:text-base hover:brightness-110 transition-all shadow-lg shadow-sky-500/25 min-h-[44px]"
                >
                  進入 B2B 產品介紹
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-amber-400/50 bg-[#111C30]/80 text-amber-300 font-bold text-sm sm:text-base hover:bg-amber-400/10 transition-colors min-h-[44px]"
                >
                  填寫 B2B 聯繫表單
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Certification Marquee */}
        <div className="bg-[#111C30] border-b border-sky-400/15 py-3.5 overflow-hidden">
          <div className="animate-marquee flex items-center gap-10 text-xs sm:text-sm font-bold tracking-wider text-sky-300">
            {[
              'ISO 13485 醫療器材品質認證',
              'CE MDR 歐盟法規合規',
              'FDA 510(k) 美國核准外銷',
              'C.T.M. 全球註冊自有品牌',
              'YAMAHA / SUZUKI 長期合作夥伴',
              '桃園新屋工業 4.0 研發廠',
              'ISO 13485 醫療器材品質認證',
              'CE MDR 歐盟法規合規',
              'FDA 510(k) 美國核准外銷',
              'C.T.M. 全球註冊自有品牌',
              'YAMAHA / SUZUKI 長期合作夥伴',
              '桃園新屋工業 4.0 研發廠',
            ].map((item, idx) => (
              <span key={idx} className="whitespace-nowrap flex items-center gap-3">
                <span className="w-1.5 h-1.5 rotate-45 bg-amber-400 shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Enfold Animated Numbers Row */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: 1975, suffix: '', label: '創立年份 · 台灣製造', color: 'text-sky-400' },
              { num: 60, suffix: '+', label: '全球外銷國家與地區', color: 'text-amber-400' },
              { num: 4, suffix: ' 大據點', label: '新北 · 桃園 · 上海 · 美國', color: 'text-emerald-400' },
              { num: 13485, prefix: 'ISO ', label: '醫療輔具最高品管認證', color: 'text-cyan-300' },
            ].map((stat, idx) => (
              <RevealBlock
                key={idx}
                delay={idx * 0.08}
                className="p-6 rounded-2xl bg-[#111C30] border border-sky-400/15 hover:border-sky-400/40 transition-colors"
              >
                <div className={`text-3xl sm:text-4xl font-display font-black ${stat.color}`}>
                  <AnimatedNumber target={stat.num} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-xs sm:text-sm font-medium text-slate-300">
                  {stat.label}
                </div>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* Subpage Portals */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              網站架構<HighlightText variant="cyan">專頁導覽</HighlightText>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('oem')}
              className="text-sm font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5"
            >
              查看 OEM / ODM 智慧製造 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subpagePortals.map((card, idx) => (
              <RevealBlock key={card.title} delay={idx * 0.08}>
                <button
                  type="button"
                  onClick={() =>
                    card.treeNode
                      ? goToProductsWithNode(card.treeNode)
                      : onNavigate(card.target)
                  }
                  className={`group w-full text-left rounded-2xl overflow-hidden border bg-gradient-to-br ${card.accent} transition-transform duration-300 hover:-translate-y-1 flex flex-col sm:flex-row items-stretch`}
                >
                  <div className="sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#0D1729]">
                    <SafeImage
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white group-hover:text-sky-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">{card.subtitle}</p>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-400">
                      前往分頁
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </RevealBlock>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // PAGE 2: B2B ABOUT US (關於我們：企業沿革 + 全球據點 + OEM 製程連結)
  // =========================================================================
  if (page === 'about') {
    return (
      <div className="bg-[#09111E] text-slate-100 py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 space-y-5 flex flex-col justify-center">
              <div className="text-xs font-mono-tabular tracking-widest text-sky-400 font-bold">
                ABOUT US · 關於建迪企業
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight text-balance">
                深耕台灣半世紀，以<HighlightText variant="cyan">精密機械工藝</HighlightText>守護全球移動自由
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                建迪企業股份有限公司創立於 1975 年，從日系機車精密零組件代工起家，逐步創立 C.T.M. 自有品牌，並於 1995 年成功轉型為國際級醫療電動代步車與電動輪椅製造商。
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('partners')}
                  className="px-5 py-3 rounded-xl bg-sky-500 text-[#09111E] font-bold text-sm hover:bg-sky-400 transition-colors min-h-[44px]"
                >
                  查看合作廠商實績
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('oem')}
                  className="px-5 py-3 rounded-xl border border-amber-400/45 text-amber-300 font-bold text-sm hover:bg-amber-400/10 transition-colors min-h-[44px]"
                >
                  了解 OEM / ODM 智慧製造
                </button>
                <button
                  type="button"
                  onClick={() => goToProductsWithNode()}
                  className="px-5 py-3 rounded-xl border border-sky-400/35 text-sky-300 font-bold text-sm hover:bg-sky-500/10 transition-colors min-h-[44px]"
                >
                  進入產品介紹
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-sky-400/20 min-h-[280px]">
              <SafeImage
                src={IMAGES.heroToB}
                alt="建迪企業桃園新屋廠辦與研發中心"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <section className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              企業發展<HighlightText variant="amber">關鍵里程碑</HighlightText>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COMPANY_MILESTONES.map((m, idx) => (
                <RevealBlock
                  key={m.year}
                  delay={idx * 0.08}
                  className="p-6 rounded-2xl bg-[#111C30] border border-sky-400/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl font-display font-black text-amber-400 tabular-nums">
                      {m.year}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{m.zhTitle}</h3>
                    <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">{m.summary}</p>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              跨國生產與<HighlightText variant="cyan">全球營運據點</HighlightText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GLOBAL_BASES.map((base, idx) => (
                <RevealBlock
                  key={base.name}
                  delay={idx * 0.07}
                  className="p-6 rounded-2xl bg-[#111C30] border border-sky-400/15 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400">{base.region}</div>
                    <h3 className="text-lg font-bold text-white mt-0.5">{base.name}</h3>
                    <p className="text-sm text-slate-300 mt-1">{base.role}</p>
                    <p className="text-xs text-slate-400 mt-2 font-mono-tabular">{base.address}</p>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 3: B2B PARTNERS (合作廠商專頁)
  // =========================================================================
  if (page === 'partners') {
    const sectors = [
      '全部',
      '日系機車大廠 OEM',
      '歐美醫療通路品牌',
      '國際授權兒童車廠',
      '台灣連鎖醫療通路',
    ];
    const visiblePartners =
      partnerSector === '全部'
        ? B2B_PARTNERS
        : B2B_PARTNERS.filter((p) => p.sector === partnerSector);

    return (
      <div className="bg-[#09111E] text-slate-100 py-12 sm:py-16 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono-tabular tracking-widest text-amber-400 font-bold">
              STRATEGIC PARTNERS · 合作廠商與實績
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white text-balance">
              跨足車廠與醫療領域的<HighlightText variant="amber">全球合作夥伴</HighlightText>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              從 1975 年起陪伴日系機車大廠成長，到今日成為歐美大型醫療復健集團與玩具連鎖通路的指定製造夥伴，建迪以穩定交期與零妥協品管贏得長期信賴。
            </p>
          </div>

          {/* Interactive Sector Tabs */}
          <div className="flex flex-wrap gap-2">
            {sectors.map((sec) => {
              const active = partnerSector === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setPartnerSector(sec)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors min-h-[40px] ${
                    active
                      ? 'bg-sky-500 text-[#09111E]'
                      : 'bg-[#111C30] text-slate-300 border border-sky-400/20 hover:border-sky-400/50'
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>

          {/* Partner Cards */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePartners.map((partner, idx) => (
              <RevealBlock
                key={partner.id}
                delay={idx * 0.06}
                className="p-6 sm:p-7 rounded-2xl bg-[#111C30] border border-sky-400/20 flex flex-col justify-between space-y-4 hover:border-amber-400/45 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-400">
                    <span>{partner.sector}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-300">{partner.region}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono-tabular">
                      {partner.cooperationYears}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
                    <Handshake className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{partner.name}</span>
                  </h2>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    <span className="text-sky-300 font-semibold">合作範疇：</span>
                    {partner.scope}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10 text-xs sm:text-sm text-emerald-300 font-medium">
                  實績成果：{partner.outcome}
                </div>
              </RevealBlock>
            ))}
          </motion.div>

          {/* 4-Step B2B Onboarding Flow */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#111C30] border border-sky-400/20 space-y-6">
            <h2 className="text-2xl font-display font-black text-white">
              成為建迪合作夥伴：<HighlightText variant="cyan">四階段協作流程</HighlightText>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { step: '01. 規格與市場評估', desc: '確認目標國家法規、採購型號或客製工程圖面需求。' },
                { step: '02. 聯合打樣測試', desc: '桃園研發中心執行樣車組裝、強度測試與機構調校。' },
                { step: '03. 認證與包裝定案', desc: '協助提供 CE/FDA/EN71 文件並完成客製品牌包裝。' },
                { step: '04. 量產與貨櫃交付', desc: '桃園 / 上海廠雙基地彈性排程，準時出口至全球港口。' },
              ].map((s) => (
                <div key={s.step} className="p-4 rounded-xl bg-[#09111E] border border-white/10 space-y-2">
                  <div className="text-sm font-bold text-amber-400">{s.step}</div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#09111E] font-extrabold text-sm hover:brightness-110 transition-all min-h-[44px]"
              >
                洽詢成為經銷商 / OEM 合作夥伴
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 4: B2B PRODUCTS + MULTI-LEVEL FILTER EVERYTHING PRO
  // =========================================================================
  if (page === 'products') {
    return (
      <div className="bg-[#09111E] text-slate-100 py-10 sm:py-14 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sky-400/20 pb-6">
            <div className="space-y-2">
              <div className="text-xs font-mono-tabular tracking-widest text-sky-400 font-bold">
                B2B CATALOG · MULTI-LEVEL FILTER EVERYTHING PRO
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
                產品介紹與 <HighlightText variant="cyan">多層級篩選目錄</HighlightText>
              </h1>
            </div>
            {rfqList.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-[#09111E] font-bold text-sm min-h-[44px] shrink-0"
              >
                <FileText className="w-4 h-4" />
                已選 {rfqList.length} 項詢價機種 · 前往聯繫表單
              </button>
            )}
          </div>

          <FilterEverythingPro
            theme="b2b"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="搜尋型號 (如 HS589)、產品名稱..."
            hierarchyTree={{
              title: '多層級產品分類樹',
              tree: B2B_TAXONOMY_TREE,
              selectedNodeIds: selectedTreeNodes,
              onToggleNode: handleToggleTreeNode,
              getNodeCount: getTreeNodeCount,
            }}
            facets={facets}
            selectedFacets={selectedFacets}
            onToggleFacet={handleToggleFacet}
            rangeConfig={{
              label: '最大乘載重量',
              unit: 'kg',
              min: 40,
              max: 220,
              step: 10,
              value: loadRange,
              onChange: setLoadRange,
            }}
            sortOptions={[
              { value: 'featured', label: '預設原廠推薦排序' },
              { value: 'load-desc', label: '最大乘載：由高到低' },
              { value: 'range-desc', label: '續航里程：由長到短' },
            ]}
            sortValue={sortBy}
            onSortChange={setSortBy}
            onResetAll={handleResetFilters}
            totalResults={filteredProducts.length}
            totalCatalog={B2B_PRODUCTS.length}
          >
            {filteredProducts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#111C30] border border-sky-400/20 text-center space-y-4">
                <p className="text-lg font-bold text-white">沒有符合目前篩選條件的機種</p>
                <p className="text-sm text-slate-400">
                  請放寬承重範圍或重設 Filter Everything Pro 多層級條件，即可瀏覽全線產品。
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-[#09111E] font-bold text-sm"
                >
                  重設所有篩選條件
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => {
                  const inRfq = rfqList.some((r) => r.id === product.id);
                  return (
                    <motion.article
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl bg-[#111C30] border border-sky-400/20 overflow-hidden flex flex-col justify-between hover:border-sky-400/50 transition-colors group"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-[#0B1424] overflow-hidden relative">
                          <SafeImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5 sm:p-6 space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 font-mono-tabular">
                            <span>{product.modelCode}</span>
                            <span aria-hidden="true">·</span>
                            <span>{product.category}</span>
                            <span aria-hidden="true">›</span>
                            <span className="text-amber-300">{product.subCategory}</span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                            {product.name}
                          </h2>
                          <p className="text-xs text-slate-400">{product.englishName}</p>

                          <div className="pt-2 grid grid-cols-2 gap-3 text-xs border-t border-white/10">
                            <div>
                              <span className="text-slate-400 block">最大承重</span>
                              <span className="font-mono-tabular font-bold text-amber-300 text-sm">
                                {product.maxLoadKg} kg
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">認證合規</span>
                              <span className="font-mono-tabular font-semibold text-emerald-300 text-sm">
                                {product.certifications.join(' / ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 sm:px-6 pb-5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveProduct(product)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 text-[#09111E] font-bold text-sm hover:bg-sky-400 transition-colors min-h-[44px]"
                        >
                          技術規格書
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRfqItem(product)}
                          className={`py-2.5 px-4 rounded-xl font-bold text-sm border transition-colors min-h-[44px] ${
                            inRfq
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                              : 'border-sky-400/30 text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {inRfq ? '已加入詢價' : '加入詢價'}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </FilterEverythingPro>
        </div>

        {/* B2B Spec Modal */}
        <AnimatePresence>
          {activeProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveProduct(null)}
                className="fixed inset-0 bg-black/75 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#111C30] border border-sky-400/30 overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono-tabular text-sky-400">
                      {activeProduct.modelCode} · {activeProduct.category} › {activeProduct.subCategory}
                    </span>
                    <h3 className="text-xl font-bold text-white">{activeProduct.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveProduct(null)}
                    aria-label="關閉規格書"
                    className="p-2 rounded-lg hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#09111E]">
                    <SafeImage
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-2">核心工程亮點</h4>
                    <ul className="space-y-1.5 text-sm text-slate-200">
                      {activeProduct.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-sky-400 mb-2">工程參數表</h4>
                    <div className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
                      {activeProduct.specs.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between px-4 py-2.5 text-sm bg-[#0D1729]/60"
                        >
                          <span className="text-slate-400">{s.label}</span>
                          <span className="font-mono-tabular font-semibold text-white">
                            {s.value}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-2.5 text-sm bg-[#0D1729]/60">
                        <span className="text-slate-400">MOQ / 交期</span>
                        <span className="font-mono-tabular font-semibold text-amber-300">
                          {activeProduct.moq} · {activeProduct.leadTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!rfqList.some((i) => i.id === activeProduct.id)) {
                          toggleRfqItem(activeProduct);
                        }
                        setActiveProduct(null);
                        onNavigate('contact');
                      }}
                      className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-[#09111E] font-extrabold text-sm min-h-[44px]"
                    >
                      立即針對此機種填寫聯繫表單
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // PAGE 5: B2B OEM / ODM 智慧製造
  // =========================================================================
  if (page === 'oem') {
    const faqs = [
      {
        q: '建迪企業能提供哪些 OEM / ODM 客製化開發服務？',
        a: '涵蓋外觀工業設計、車架機構應力分析、控制器調校、專屬模具開發、多國安規認證送測（CE MDR / FDA / EN71），以及客戶專屬品牌包材與說明書設計。',
      },
      {
        q: '醫療輔具的品質管理與出廠檢驗流程為何？',
        a: '桃園新屋廠全面導入 ISO 13485 醫療器材品管系統，承襲 1975 年起為山葉、台鈴供應車體零組件的嚴格標準，每一台車出廠前皆經過斜坡制動、絕緣耐壓與載重疲勞實測。',
      },
      {
        q: '貨櫃出貨模式與最低訂購量 (MOQ) 如何彈性搭配？',
        a: '支援 20 呎或 40 呎高櫃多型號混裝出貨，醫療代步車單型號一般為 15–30 台起訂，並可配合台灣桃園廠或上海廠彈性調度交期。',
      },
    ];

    return (
      <div className="bg-[#09111E] text-slate-100 py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-14">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono-tabular tracking-widest text-amber-400 font-bold">
              OEM / ODM CAPABILITIES · 智慧製造
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white text-balance">
              從 <HighlightText variant="amber">0.01mm</HighlightText> 精密零件到整車外銷的一站式製造力
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: '01. 機構與電控研發',
                desc: '自主掌握無刷馬達驅動調校、斜坡自動減速演算法與高強度折疊機構專利。',
              },
              {
                icon: Factory,
                title: '02. 工業 4.0 自動化產線',
                desc: '桃園新屋智慧廠整合機器人焊接、CNC 精密加工與數位化品檢追溯系統。',
              },
              {
                icon: Award,
                title: '03. 跨國法規認證支援',
                desc: '協助全球經銷品牌加速通過歐盟 CE MDR、美國 FDA 510(k) 與 EN71 測試。',
              },
            ].map((item, idx) => (
              <RevealBlock
                key={item.title}
                delay={idx * 0.1}
                className="p-6 rounded-2xl bg-[#111C30] border border-sky-400/20 space-y-3"
              >
                <item.icon className="w-7 h-7 text-sky-400" />
                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </RevealBlock>
            ))}
          </div>

          <div className="rounded-2xl bg-[#111C30] border border-sky-400/20 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-4">
              OEM / 經銷合作常見問答
            </h2>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="border-b border-white/10 last:border-b-0 pb-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between py-3 text-left font-bold text-base text-white hover:text-sky-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-3 text-sm text-slate-300 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 6: B2B CONTACT FORM (聯繫我們)
  // =========================================================================
  return (
    <div className="bg-[#09111E] text-slate-100 py-12 sm:py-16">
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="space-y-3">
          <div className="text-xs font-mono-tabular tracking-widest text-sky-400 font-bold">
            CONTACT US · B2B 企業聯繫表單
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
            聯絡<HighlightText variant="cyan">建迪企業</HighlightText>國際業務與 OEM 團隊
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#111C30] border border-sky-400/20">
            {formSubmitted ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">B2B 聯繫表單已成功送出</h2>
                <p className="text-sm text-slate-300">
                  感謝 {contactForm.company}（{contactForm.contactName}），專案經理將於 24 小時內聯繫 {contactForm.phone} 或寄送報價資料至 {contactForm.email}。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setRfqList([]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-[#09111E] font-bold text-sm"
                >
                  填寫新的聯繫單
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                {rfqList.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2">
                    <div className="text-xs font-bold text-amber-300">
                      已附帶詢價機種 ({rfqList.length})：
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rfqList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleRfqItem(item)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#09111E] text-slate-200 border border-amber-400/30"
                        >
                          {item.modelCode} <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      公司名稱 *
                    </label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="例：台灣樂齡健康器材有限公司"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      聯絡人姓名 *
                    </label>
                    <input
                      type="text"
                      value={contactForm.contactName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, contactName: e.target.value })
                      }
                      placeholder="王大明 經理"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      聯絡電話 *
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+886-2-2201-8899"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      企業電子郵件 *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="buyer@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      合作類型
                    </label>
                    <select
                      value={contactForm.coopType}
                      onChange={(e) => setContactForm({ ...contactForm, coopType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    >
                      <option>ODM / OEM 客製代工</option>
                      <option>區域經銷商 / 品牌代理</option>
                      <option>C.T.M. 兒童車大宗採購</option>
                      <option>機車 / CNC 精密零件委製</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      目標銷售市場
                    </label>
                    <select
                      value={contactForm.region}
                      onChange={(e) => setContactForm({ ...contactForm, region: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                    >
                      <option>歐洲市場</option>
                      <option>北美市場</option>
                      <option>台灣內銷經銷</option>
                      <option>亞太與中東市場</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    採購需求與客製規格說明
                  </label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="請簡述預計年採購量、目標型號或 OEM 需求..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111E] border border-sky-400/25 text-sm text-white outline-none focus:border-sky-400"
                  />
                </div>

                {formError && <p className="text-xs text-rose-400 font-semibold">{formError}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-[#09111E] font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  送出 B2B 聯繫與報價申請
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-[#111C30] border border-sky-400/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                台灣總部與研發中心
              </div>
              <div className="text-sm text-slate-300 space-y-2.5">
                <p>新莊總部：新北市新莊區民安路 420 號</p>
                <p>桃園廠區：桃園市新屋區中華南路一段</p>
                <p className="flex items-center gap-1.5 font-mono-tabular">
                  <Phone className="w-4 h-4 text-sky-400" />
                  +886-2-2201-8899
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-400" />
                  global-sales@chienti.com.tw
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/15 to-amber-500/10 border border-sky-400/25 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                品質與法規承諾
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                提供完整 MDR Technical File、ISO 13485 證書影本與第三方檢驗報告，協助經銷夥伴快速完成當地醫療器材查驗登記。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
