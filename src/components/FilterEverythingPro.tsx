import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Check,
  ArrowUpDown,
  FolderTree,
} from 'lucide-react';
import { CategoryTreeNode } from '../types';

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  id: string;
  title: string;
  options: FacetOption[];
}

export interface HierarchicalTreeConfig {
  title: string;
  tree: CategoryTreeNode[];
  selectedNodeIds: string[];
  onToggleNode: (nodeId: string) => void;
  getNodeCount: (nodeId: string) => number;
}

export interface RangeConfig {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}

export interface SortOption {
  value: string;
  label: string;
}

interface FilterEverythingProProps {
  theme: 'b2b' | 'toc';
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder: string;
  hierarchyTree?: HierarchicalTreeConfig;
  facets: FacetGroup[];
  selectedFacets: Record<string, string[]>;
  onToggleFacet: (groupId: string, value: string) => void;
  rangeConfig?: RangeConfig;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (val: string) => void;
  onResetAll: () => void;
  totalResults: number;
  totalCatalog: number;
  children: React.ReactNode;
}

function findNodeLabel(tree: CategoryTreeNode[], id: string): string {
  for (const node of tree) {
    if (node.id === id) return node.label;
    if (node.children) {
      const found = findNodeLabel(node.children, id);
      if (found) return found;
    }
  }
  return id;
}

export const FilterEverythingPro: React.FC<FilterEverythingProProps> = ({
  theme,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  hierarchyTree,
  facets,
  selectedFacets,
  onToggleFacet,
  rangeConfig,
  sortOptions,
  sortValue,
  onSortChange,
  onResetAll,
  totalResults,
  totalCatalog,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'medical-mobility': true,
    'kids-mobility': true,
    'precision-oem': true,
    'senior-scooters': true,
    'homecare-chairs': true,
    'family-rideon': true,
    '醫療電動代步車': true,
    '電動輪椅': true,
    '折疊代步車': true,
  });

  const isB2B = theme === 'b2b';

  const activeChips: { groupId: string; value: string }[] = [];
  facets.forEach((group) => {
    const selected = selectedFacets[group.id] || [];
    selected.forEach((val) => {
      activeChips.push({ groupId: group.id, value: val });
    });
  });

  const selectedTreeIds = hierarchyTree?.selectedNodeIds || [];

  const isRangeModified =
    rangeConfig &&
    (rangeConfig.value[0] > rangeConfig.min || rangeConfig.value[1] < rangeConfig.max);

  const totalActiveCount =
    activeChips.length +
    selectedTreeIds.length +
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (isRangeModified ? 1 : 0);

  const hasActiveFilters = totalActiveCount > 0;

  const toggleCollapse = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTreeExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTreeNodes = (nodes: CategoryTreeNode[], depth = 0): React.ReactNode => {
    if (!hierarchyTree) return null;

    return (
      <div
        className={`space-y-1 ${
          depth > 0
            ? `ml-3 pl-3 border-l ${
                isB2B ? 'border-sky-400/20' : 'border-[#123738]/20'
              }`
            : ''
        }`}
      >
        {nodes.map((node) => {
          const hasChildren = !!node.children && node.children.length > 0;
          const isExpanded = !!expandedNodes[node.id];
          const checked = hierarchyTree.selectedNodeIds.includes(node.id);
          const count = hierarchyTree.getNodeCount(node.id);

          return (
            <div key={node.id}>
              <div className="flex items-center gap-1">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleTreeExpand(node.id)}
                    aria-label={isExpanded ? `收合 ${node.label}` : `展開 ${node.label}`}
                    className="p-1.5 rounded hover:bg-white/10 shrink-0 opacity-75 hover:opacity-100"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  <span className="w-6 shrink-0" />
                )}

                <button
                  type="button"
                  onClick={() => hierarchyTree.onToggleNode(node.id)}
                  className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-lg text-xs sm:text-sm transition-colors min-h-[36px] ${
                    checked
                      ? isB2B
                        ? 'bg-sky-500/20 text-sky-300 font-bold'
                        : 'bg-[#123738] text-[#EFE8D8] font-bold'
                      : isB2B
                      ? 'hover:bg-white/5 text-slate-200'
                      : 'hover:bg-[#123738]/8 text-[#123738]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        checked
                          ? isB2B
                            ? 'bg-sky-400 border-sky-400 text-[#09111E]'
                            : 'bg-[#D94E34] border-[#D94E34] text-white'
                          : isB2B
                          ? 'border-slate-500'
                          : 'border-[#123738]/40'
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="truncate text-left">{node.label}</span>
                  </span>
                  <span className="font-mono-tabular text-[11px] opacity-60 ml-1 shrink-0">
                    ({count})
                  </span>
                </button>
              </div>

              {hasChildren && isExpanded && (
                <div className="mt-1">{renderTreeNodes(node.children!, depth + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilterSidebarContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-current/15">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className={`w-4 h-4 ${isB2B ? 'text-sky-400' : 'text-[#D94E34]'}`}
          />
          <span className="text-sm font-bold tracking-wide">Filter Everything Pro</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${
              isB2B
                ? 'text-amber-400 hover:bg-amber-400/10'
                : 'text-[#D94E34] hover:bg-[#D94E34]/10'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            重置篩選
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold mb-2 opacity-75">關鍵字即時檢索</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
              isB2B
                ? 'bg-[#09111E] border-sky-400/25 text-slate-100 placeholder-slate-500 focus:border-sky-400'
                : 'bg-[#E6DEC8]/60 border-[#123738]/20 text-[#123738] placeholder-[#123738]/50 focus:border-[#D94E34]'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="清除搜尋"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Level Hierarchical Category Tree */}
      {hierarchyTree && (
        <div className="pt-3 border-t border-current/10 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <FolderTree className={`w-4 h-4 ${isB2B ? 'text-amber-400' : 'text-[#D94E34]'}`} />
            <span>{hierarchyTree.title}</span>
          </div>
          {renderTreeNodes(hierarchyTree.tree)}
        </div>
      )}

      {/* Numeric Range Slider */}
      {rangeConfig && (
        <div className="pt-3 border-t border-current/10">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span>{rangeConfig.label}</span>
            <span className={`font-mono-tabular ${isB2B ? 'text-sky-400' : 'text-[#D94E34]'}`}>
              {rangeConfig.value[0].toLocaleString()} – {rangeConfig.value[1].toLocaleString()}{' '}
              {rangeConfig.unit}
            </span>
          </div>
          <div className="space-y-3 pt-1">
            <div>
              <span className="text-[11px] opacity-65 block mb-1">
                下限 ({rangeConfig.value[0].toLocaleString()} {rangeConfig.unit})
              </span>
              <input
                type="range"
                min={rangeConfig.min}
                max={rangeConfig.max}
                step={rangeConfig.step}
                value={rangeConfig.value[0]}
                onChange={(e) => {
                  const nextMin = Math.min(
                    Number(e.target.value),
                    rangeConfig.value[1] - rangeConfig.step
                  );
                  rangeConfig.onChange([nextMin, rangeConfig.value[1]]);
                }}
                className={`w-full cursor-pointer ${
                  isB2B ? 'accent-sky-400' : 'accent-[#D94E34]'
                }`}
              />
            </div>
            <div>
              <span className="text-[11px] opacity-65 block mb-1">
                上限 ({rangeConfig.value[1].toLocaleString()} {rangeConfig.unit})
              </span>
              <input
                type="range"
                min={rangeConfig.min}
                max={rangeConfig.max}
                step={rangeConfig.step}
                value={rangeConfig.value[1]}
                onChange={(e) => {
                  const nextMax = Math.max(
                    Number(e.target.value),
                    rangeConfig.value[0] + rangeConfig.step
                  );
                  rangeConfig.onChange([rangeConfig.value[0], nextMax]);
                }}
                className={`w-full cursor-pointer ${
                  isB2B ? 'accent-amber-400' : 'accent-[#0F766E]'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-Facet Attribute Groups */}
      {facets.map((group) => {
        const isCollapsed = !!collapsedGroups[group.id];
        const selectedList = selectedFacets[group.id] || [];

        return (
          <div key={group.id} className="pt-3 border-t border-current/10">
            <button
              type="button"
              onClick={() => toggleCollapse(group.id)}
              className="w-full flex items-center justify-between text-left py-1 text-sm font-bold"
            >
              <span>{group.title}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCollapsed ? '-rotate-90' : 'rotate-0'
                }`}
              />
            </button>

            {!isCollapsed && (
              <div className="mt-2.5 space-y-1.5">
                {group.options.map((opt) => {
                  const checked = selectedList.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onToggleFacet(group.id, opt.value)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors min-h-[40px] ${
                        checked
                          ? isB2B
                            ? 'bg-sky-500/15 text-sky-300 font-semibold'
                            : 'bg-[#123738] text-[#EFE8D8] font-semibold'
                          : isB2B
                          ? 'hover:bg-white/5 text-slate-300'
                          : 'hover:bg-[#123738]/8 text-[#123738]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            checked
                              ? isB2B
                                ? 'bg-sky-400 border-sky-400 text-[#09111E]'
                                : 'bg-[#D94E34] border-[#D94E34] text-white'
                              : isB2B
                              ? 'border-slate-500'
                              : 'border-[#123738]/40'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className="truncate">{opt.label}</span>
                      </span>
                      <span
                        className={`text-xs font-mono-tabular ml-2 shrink-0 ${
                          checked ? 'opacity-90' : 'opacity-55'
                        }`}
                      >
                        ({opt.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full">
      {/* Top AJAX Result Bar + Mobile Filter Trigger */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl mb-6 border ${
          isB2B
            ? 'bg-[#111C30] border-sky-400/20 text-slate-100'
            : 'bg-[#EFE8D8] border-[#123738]/15 text-[#123738]'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold min-h-[44px] transition-colors ${
              isB2B
                ? 'bg-sky-500 text-[#09111E] hover:bg-sky-400'
                : 'bg-[#123738] text-[#EFE8D8] hover:bg-[#1a4a4b]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            展開多層篩選
            {totalActiveCount > 0 && (
              <span className="font-mono-tabular">({totalActiveCount})</span>
            )}
          </button>

          <p className="text-sm font-medium">
            即時篩選結果：顯示{' '}
            <span
              className={`font-mono-tabular font-bold text-base ${
                isB2B ? 'text-sky-400' : 'text-[#D94E34]'
              }`}
            >
              {totalResults}
            </span>{' '}
            / <span className="font-mono-tabular opacity-70">{totalCatalog}</span> 項產品
          </p>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <ArrowUpDown className="w-4 h-4 opacity-60 shrink-0" />
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="排序方式"
            className={`px-3 py-2 rounded-lg text-sm font-medium border outline-none cursor-pointer min-h-[40px] ${
              isB2B
                ? 'bg-[#09111E] border-sky-400/25 text-slate-100'
                : 'bg-[#E6DEC8] border-[#123738]/20 text-[#123738]'
            }`}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-xs font-semibold opacity-70 mr-1">已套用條件：</span>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isB2B
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30'
                    : 'bg-[#123738] text-[#EFE8D8] hover:bg-[#194c4d]'
                }`}
              >
                關鍵字: {searchQuery}
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {hierarchyTree &&
              selectedTreeIds.map((nodeId) => (
                <button
                  key={`tree-${nodeId}`}
                  type="button"
                  onClick={() => hierarchyTree.onToggleNode(nodeId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isB2B
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30'
                      : 'bg-[#D94E34] text-white hover:bg-[#b83b24]'
                  }`}
                >
                  層級: {findNodeLabel(hierarchyTree.tree, nodeId)}
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
            {isRangeModified && rangeConfig && (
              <button
                type="button"
                onClick={() => rangeConfig.onChange([rangeConfig.min, rangeConfig.max])}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isB2B
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30'
                    : 'bg-[#D94E34] text-white hover:bg-[#b83b24]'
                }`}
              >
                {rangeConfig.label}: {rangeConfig.value[0].toLocaleString()}–
                {rangeConfig.value[1].toLocaleString()} {rangeConfig.unit}
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {activeChips.map((chip) => (
              <button
                key={`${chip.groupId}-${chip.value}`}
                type="button"
                onClick={() => onToggleFacet(chip.groupId, chip.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isB2B
                    ? 'bg-[#17253E] text-sky-200 border border-sky-400/30 hover:bg-sky-500/25'
                    : 'bg-[#123738]/12 text-[#123738] border border-[#123738]/25 hover:bg-[#123738]/20'
                }`}
              >
                <span>{chip.value}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={onResetAll}
              className="text-xs font-bold underline underline-offset-4 ml-2 opacity-80 hover:opacity-100"
            >
              全部清除
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split: Desktop Sticky Filter Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside
          className={`hidden lg:block lg:col-span-3 p-5 rounded-2xl border sticky top-24 ${
            isB2B
              ? 'bg-[#111C30] border-sky-400/20 text-slate-100'
              : 'bg-[#EFE8D8] border-[#123738]/15 text-[#123738]'
          }`}
        >
          {renderFilterSidebarContent()}
        </aside>

        <div className="lg:col-span-9">{children}</div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`relative z-10 w-[85vw] max-w-sm h-full overflow-y-auto p-6 ${
                isB2B ? 'bg-[#0E182B] text-slate-100' : 'bg-[#EFE8D8] text-[#123738]'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-bold">多層條件篩選</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-black/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="關閉篩選"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFilterSidebarContent()}
              <div className="mt-6 pt-4 border-t border-current/15 sticky bottom-0 pb-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className={`w-full py-3 rounded-xl font-bold text-sm min-h-[44px] ${
                    isB2B ? 'bg-sky-500 text-[#09111E]' : 'bg-[#D94E34] text-white'
                  }`}
                >
                  查看 {totalResults} 項篩選結果
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
