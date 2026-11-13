import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { B2BPage, CartItem, SiteMode, ToCPage, ToCProduct } from './types';
import { HeaderNav } from './components/HeaderNav';
import { Footer } from './components/Footer';
import { B2BPages } from './pages/b2b/B2BPages';
import { ToCPages } from './pages/toc/ToCPages';
import { TOC_PRODUCTS } from './data/chientiData';

function parseHash(): { site: SiteMode; b2b: B2BPage; toc: ToCPage } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [sitePart, pagePart] = raw.split('/');
  const b2bValid: B2BPage[] = ['home', 'about', 'products', 'partners', 'oem', 'contact'];
  const tocValid: ToCPage[] = [
    'home',
    'categories',
    'products',
    'product-detail',
    'story',
    'support',
    'contact',
    'cart',
  ];

  if (sitePart === 'toc') {
    const toc = tocValid.includes(pagePart as ToCPage) ? (pagePart as ToCPage) : 'home';
    return { site: 'toc', b2b: 'home', toc };
  }
  const b2b = b2bValid.includes(pagePart as B2BPage) ? (pagePart as B2BPage) : 'home';
  return { site: 'b2b', b2b, toc: 'home' };
}

export default function App() {
  const initial = parseHash();
  const [siteMode, setSiteMode] = useState<SiteMode>(initial.site);
  const [b2bPage, setB2BPage] = useState<B2BPage>(initial.b2b);
  const [tocPage, setToCPage] = useState<ToCPage>(initial.toc);

  const [cart, setCart] = useState<CartItem[]>([
    {
      product: TOC_PRODUCTS[0],
      selectedColor: TOC_PRODUCTS[0].colors[0].name,
      quantity: 1,
    },
  ]);

  useEffect(() => {
    const pageId = siteMode === 'b2b' ? b2bPage : tocPage;
    const nextHash = `#/${siteMode}/${pageId}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [siteMode, b2bPage, tocPage]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      setSiteMode(parsed.site);
      if (parsed.site === 'b2b') setB2BPage(parsed.b2b);
      else setToCPage(parsed.toc);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSwitchSite = (mode: SiteMode) => {
    setSiteMode(mode);
    if (mode === 'b2b') setB2BPage('home');
    else setToCPage('home');
  };

  const handleAddToCart = (product: ToCProduct, color: string) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.sku === product.sku && item.selectedColor === color
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, selectedColor: color, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (sku: string, color: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.sku === sku && item.selectedColor === color
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (sku: string, color: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.sku === sku && item.selectedColor === color))
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const routeKey = `${siteMode}-${siteMode === 'b2b' ? b2bPage : tocPage}`;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          siteMode === 'b2b' ? 'bg-[#09111E]' : 'bg-[#E6DEC8]'
        }`}
      >
        <HeaderNav
          siteMode={siteMode}
          b2bPage={b2bPage}
          tocPage={tocPage}
          cartCount={totalCartCount}
          onSwitchSite={handleSwitchSite}
          onNavigateB2B={setB2BPage}
          onNavigateToC={setToCPage}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={routeKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {siteMode === 'b2b' ? (
                <B2BPages page={b2bPage} onNavigate={setB2BPage} />
              ) : (
                <ToCPages
                  page={tocPage}
                  onNavigate={setToCPage}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onUpdateCartQty={handleUpdateCartQty}
                  onRemoveCartItem={handleRemoveCartItem}
                  onClearCart={() => setCart([])}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer
          siteMode={siteMode}
          onSwitchSite={handleSwitchSite}
          onNavigateB2B={setB2BPage}
          onNavigateToC={setToCPage}
        />
      </div>
    </MotionConfig>
  );
}
