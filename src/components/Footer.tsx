import React from 'react';
import { B2BPage, SiteMode, ToCPage } from '../types';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  siteMode: SiteMode;
  onSwitchSite: (mode: SiteMode) => void;
  onNavigateB2B: (page: B2BPage) => void;
  onNavigateToC: (page: ToCPage) => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteMode,
  onSwitchSite,
  onNavigateB2B,
  onNavigateToC,
}) => {
  const isB2B = siteMode === 'b2b';

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isB2B
          ? 'bg-[#060C16] border-sky-400/20 text-slate-300'
          : 'bg-[#123738] border-[#0C2627] text-[#EFE8D8]/85'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-3">
          <div className="text-xl sm:text-2xl font-display font-black text-white">
            建迪企業股份有限公司
          </div>
          <div className="text-xs font-mono-tabular tracking-wider opacity-75">
            CHIEN TI ENTERPRISE CO., LTD. · C.T.M.
          </div>
          <p className="text-sm leading-relaxed opacity-80 max-w-md pt-1">
            {isB2B
              ? '1975 年創立於台灣，專注醫療電動代步車、電動輪椅、C.T.M. 兒童騎乘車與精密機車零組件研發製造，外銷全球 60 餘國。'
              : '承襲 50 年台灣工業製造底蘊，為銀髮長輩與親子家庭打造安心、好操控的移動輔具與 C.T.M. 騎乘車。'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSwitchSite(isB2B ? 'toc' : 'b2b')}
              className={`inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 ${
                isB2B ? 'text-amber-400 hover:text-amber-300' : 'text-[#F59E0B] hover:text-white'
              }`}
            >
              {isB2B ? '前往建迪 ToC 消費者直購館' : '前往建迪 ToB 全球製造企業官網'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <h4 className="text-sm font-bold text-white mb-3">網站架構導覽</h4>
          <ul className="space-y-2 text-sm">
            {isB2B ? (
              <>
                <li>
                  <button onClick={() => onNavigateB2B('home')} className="hover:text-sky-400">
                    企業首頁
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateB2B('about')} className="hover:text-sky-400">
                    關於我們與企業沿革
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateB2B('products')} className="hover:text-sky-400">
                    產品介紹（多層篩選）
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateB2B('partners')} className="hover:text-sky-400">
                    全球合作廠商實績
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateB2B('oem')} className="hover:text-sky-400">
                    OEM / ODM 智慧製造
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateB2B('contact')} className="hover:text-sky-400">
                    聯繫我們（B2B 表單）
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button onClick={() => onNavigateToC('home')} className="hover:text-[#F59E0B]">
                    生活館首頁
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateToC('categories')}
                    className="hover:text-[#F59E0B]"
                  >
                    產品分類總覽
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateToC('products')}
                    className="hover:text-[#F59E0B]"
                  >
                    嚴選商品（多層篩選）
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateToC('story')} className="hover:text-[#F59E0B]">
                    50 年台灣品牌故事
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateToC('contact')}
                    className="hover:text-[#F59E0B]"
                  >
                    聯繫我們 / 預約試乘
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateToC('cart')} className="hover:text-[#F59E0B]">
                    購物車與結帳
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="md:col-span-4 space-y-2.5 text-sm">
          <h4 className="text-sm font-bold text-white mb-3">營運總部與聯絡窗口</h4>
          <div className="flex items-start gap-2 opacity-85">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>台灣總部：新北市新莊區民安路 420 號 / 桃園市新屋區研發廠</span>
          </div>
          <div className="flex items-center gap-2 opacity-85">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="font-mono-tabular">+886-2-2201-8899</span>
          </div>
          <div className="flex items-center gap-2 opacity-85">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{isB2B ? 'global-sales@chienti.com.tw' : 'care@chienti.com.tw'}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
          <span>© 2026 建迪企業股份有限公司 Chien Ti Enterprise Co., Ltd. All Rights Reserved.</span>
          <span>WordPress Enfold + Filter Everything Pro 響應式雙官網架構</span>
        </div>
      </div>
    </footer>
  );
};
