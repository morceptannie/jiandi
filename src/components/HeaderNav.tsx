import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowLeftRight } from 'lucide-react';
import { B2BPage, SiteMode, ToCPage } from '../types';

interface HeaderNavProps {
  siteMode: SiteMode;
  b2bPage: B2BPage;
  tocPage: ToCPage;
  cartCount: number;
  onSwitchSite: (mode: SiteMode) => void;
  onNavigateB2B: (page: B2BPage) => void;
  onNavigateToC: (page: ToCPage) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  siteMode,
  b2bPage,
  tocPage,
  cartCount,
  onSwitchSite,
  onNavigateB2B,
  onNavigateToC,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isB2B = siteMode === 'b2b';

  const b2bLinks: { id: B2BPage; label: string }[] = [
    { id: 'home', label: '首頁' },
    { id: 'about', label: '關於我們' },
    { id: 'products', label: '產品介紹' },
    { id: 'partners', label: '合作廠商' },
    { id: 'contact', label: '聯繫我們' },
  ];

  const tocLinks: { id: ToCPage; label: string }[] = [
    { id: 'home', label: '首頁' },
    { id: 'categories', label: '產品分類' },
    { id: 'products', label: '嚴選商品' },
    { id: 'contact', label: '聯繫我們' },
    { id: 'cart', label: cartCount > 0 ? `購物車 (${cartCount})` : '購物車' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
        isB2B
          ? 'bg-[#09111E]/95 border-sky-400/20 text-slate-100'
          : 'bg-[#123738]/95 border-[#D94E34]/30 text-[#EFE8D8]'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Prominent Single-Line Company Wordmark */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            isB2B ? onNavigateB2B('home') : onNavigateToC('home');
          }}
          className="text-left whitespace-nowrap shrink-0 flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400 rounded"
        >
          <span
            className={`w-2.5 h-7 rounded-sm shrink-0 transition-transform duration-200 group-hover:scale-y-110 ${
              isB2B
                ? 'bg-gradient-to-b from-sky-400 to-amber-400'
                : 'bg-gradient-to-b from-[#D94E34] to-[#F59E0B]'
            }`}
          />
          <span className="font-display font-black tracking-tight text-lg sm:text-xl md:text-[22px] text-white">
            建迪企業股份有限公司
          </span>
        </button>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
          {isB2B
            ? b2bLinks.map((link) => {
                const active =
                  b2bPage === link.id || (link.id === 'about' && b2bPage === 'oem');
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onNavigateB2B(link.id)}
                    className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                      active ? 'text-sky-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="b2b-nav-underline"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-sky-400 to-amber-400 rounded-full"
                      />
                    )}
                  </button>
                );
              })
            : tocLinks.map((link) => {
                const active =
                  tocPage === link.id ||
                  (link.id === 'products' && tocPage === 'product-detail') ||
                  (link.id === 'contact' && tocPage === 'support');
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onNavigateToC(link.id)}
                    className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                      active ? 'text-[#F59E0B]' : 'text-[#EFE8D8]/85 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="toc-nav-underline"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-[#D94E34] to-[#F59E0B] rounded-full"
                      />
                    )}
                  </button>
                );
              })}
        </nav>

        {/* Zone 3: 1 Primary Action Button (Switch ToB / ToC Site) + Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSwitchSite(isB2B ? 'toc' : 'b2b')}
            className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 min-h-[40px] ${
              isB2B
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#09111E] hover:brightness-110 shadow-md shadow-amber-500/20'
                : 'bg-gradient-to-r from-[#D94E34] to-[#EA580C] text-white hover:brightness-110 shadow-md shadow-[#D94E34]/25'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {isB2B ? '切換 ToC 商城' : '切換 ToB 企業網'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden border-t px-4 py-4 space-y-2 ${
              isB2B
                ? 'bg-[#0D1729] border-sky-400/20 text-slate-100'
                : 'bg-[#0E2C2D] border-[#D94E34]/30 text-[#EFE8D8]'
            }`}
          >
            {isB2B
              ? b2bLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigateB2B(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-base min-h-[44px] transition-colors ${
                      b2bPage === link.id ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                ))
              : tocLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigateToC(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-base min-h-[44px] transition-colors ${
                      tocPage === link.id
                        ? 'bg-[#D94E34]/25 text-amber-300'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  onSwitchSite(isB2B ? 'toc' : 'b2b');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm min-h-[44px] ${
                  isB2B ? 'bg-amber-400 text-[#09111E]' : 'bg-[#D94E34] text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {isB2B ? '切換至 ToC 居家直購館' : '切換至 ToB 全球製造官網'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
