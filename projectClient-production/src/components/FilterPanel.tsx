import { useState } from 'react';
import { ChevronDown, ChevronRight, Filter, X } from 'lucide-react';

type FilterPanelProps = {
  filters: {
    courseType: string;
    courseMode: string;
    hrdcClaimable: string;
    category: string;
    city: string;
    state: string;
  };
  onChange: (filters: any) => void;
  categories: string[];
  cities: string[];
  states: string[];
};

/* ========================================
   === OLD FILTER CODE - BACKUP ===
   ========================================

export function FilterPanel({ filters, onChange, categories, cities, states }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
        <select
          value={filters.courseType}
          onChange={(e) => onChange({ ...filters, courseType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="IN_HOUSE">In-House</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Mode</label>
        <select
          value={filters.courseMode}
          onChange={(e) => onChange({ ...filters, courseMode: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Modes</option>
          <option value="PHYSICAL">Physical</option>
          <option value="ONLINE">Online</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">HRDC Claimable</label>
        <select
          value={filters.hrdcClaimable}
          onChange={(e) => onChange({ ...filters, hrdcClaimable: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred State</label>
        <select
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() =>
          onChange({
            courseType: '',
            courseMode: '',
            hrdcClaimable: '',
            category: '',
            city: '',
            state: '',
          })
        }
        className="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md hover:bg-gray-50 border border-gray-300 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block bg-yellow-400 rounded-lg shadow-lg border border-yellow-300 p-6" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(250, 204, 21, 0.3)' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-700" /> : <ChevronDown className="w-5 h-5 text-gray-700" />}
        </button>

        {isExpanded && filterContent}
      </div>

      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 border border-yellow-300 rounded-lg shadow-sm hover:bg-yellow-500 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

   === END OLD FILTER CODE ===
   ======================================== */

/* ========================================
   === NEW MULTI-SELECT CHECKBOX UI ===
   ======================================== */

export function FilterPanel({ filters, onChange, categories, cities, states }: FilterPanelProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    category: true,  // Start collapsed
    state: true,     // Start collapsed
    city: true,      // Start collapsed
  });

  // UI-only state for visual multi-select (not connected to backend)
  const [uiSelections, setUiSelections] = useState({
    courseTypes: [] as string[],
    courseModes: [] as string[],
    hrdcOptions: [] as string[],
    categories: [] as string[],
    states: [] as string[],
    cities: [] as string[],
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const toggleSection = (section: 'category' | 'state' | 'city') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle checkbox toggle for UI display
  const handleCheckboxToggle = (category: keyof typeof uiSelections, value: string, filterKey: keyof typeof filters) => {
    setUiSelections(prev => {
      const currentArray = prev[category];
      const isSelected = currentArray.includes(value);

      let newArray;
      if (isSelected) {
        // Remove from selection
        newArray = currentArray.filter(item => item !== value);
      } else {
        // Add to selection
        newArray = [...currentArray, value];
      }

      return {
        ...prev,
        [category]: newArray,
      };
    });

    // Backend: Only send the clicked value (single selection)
    // If unchecking, send empty string to show all
    const isCurrentlySelected = uiSelections[category].includes(value);
    onChange({
      ...filters,
      [filterKey]: isCurrentlySelected ? '' : value
    });
  };

  const filterContent = (
    <div className="space-y-3">
      {/* Simple Checkboxes - Course Type */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Course Type</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.courseTypes.includes('IN_HOUSE')}
              onChange={() => handleCheckboxToggle('courseTypes', 'IN_HOUSE', 'courseType')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">In-House</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.courseTypes.includes('PUBLIC')}
              onChange={() => handleCheckboxToggle('courseTypes', 'PUBLIC', 'courseType')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Public</span>
          </label>
        </div>
      </div>

      {/* Simple Checkboxes - Course Mode */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Course Mode</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.courseModes.includes('PHYSICAL')}
              onChange={() => handleCheckboxToggle('courseModes', 'PHYSICAL', 'courseMode')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Physical</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.courseModes.includes('ONLINE')}
              onChange={() => handleCheckboxToggle('courseModes', 'ONLINE', 'courseMode')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Online</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.courseModes.includes('HYBRID')}
              onChange={() => handleCheckboxToggle('courseModes', 'HYBRID', 'courseMode')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Hybrid</span>
          </label>
        </div>
      </div>

      {/* Simple Checkboxes - HRDC Claimable */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">HRDC Claimable</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.hrdcOptions.includes('true')}
              onChange={() => handleCheckboxToggle('hrdcOptions', 'true', 'hrdcClaimable')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={uiSelections.hrdcOptions.includes('false')}
              onChange={() => handleCheckboxToggle('hrdcOptions', 'false', 'hrdcClaimable')}
              className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">No</span>
          </label>
        </div>
      </div>

      {/* Collapsible - Category */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full group"
        >
          <h4 className="text-sm font-semibold text-gray-900">Category</h4>
          {collapsedSections.category ? (
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </button>
        {!collapsedSections.category && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={uiSelections.categories.includes(cat)}
                  onChange={() => handleCheckboxToggle('categories', cat, 'category')}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible - State */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={() => toggleSection('state')}
          className="flex items-center justify-between w-full group"
        >
          <h4 className="text-sm font-semibold text-gray-900">State</h4>
          {collapsedSections.state ? (
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </button>
        {!collapsedSections.state && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {states.map((state) => (
              <label key={state} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={uiSelections.states.includes(state)}
                  onChange={() => handleCheckboxToggle('states', state, 'state')}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{state}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible - City */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={() => toggleSection('city')}
          className="flex items-center justify-between w-full group"
        >
          <h4 className="text-sm font-semibold text-gray-900">City</h4>
          {collapsedSections.city ? (
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </button>
        {!collapsedSections.city && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {cities.map((city) => (
              <label key={city} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={uiSelections.cities.includes(city)}
                  onChange={() => handleCheckboxToggle('cities', city, 'city')}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{city}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      <button
        onClick={() => {
          // Clear UI selections
          setUiSelections({
            courseTypes: [],
            courseModes: [],
            hrdcOptions: [],
            categories: [],
            states: [],
            cities: [],
          });
          // Clear backend filters
          onChange({
            courseType: '',
            courseMode: '',
            hrdcClaimable: '',
            category: '',
            city: '',
            state: '',
          });
        }}
        className="w-full px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-50 border-2 border-gray-300 transition-all duration-200 hover:shadow-md"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Light Yellow Background, Positioned in Container */}
      <div className="hidden lg:block bg-yellow-400 rounded-xl shadow-lg border-2 border-yellow-500 p-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-yellow-600" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {filterContent}
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 border-2 border-yellow-500 rounded-lg shadow-md hover:bg-yellow-500 transition-all duration-200 hover:shadow-lg"
        >
          <Filter className="w-5 h-5 text-gray-900" />
          <span className="font-semibold text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-gray-900 text-yellow-400 text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-yellow-400 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b-2 border-yellow-400 bg-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-yellow-600" />
                Filters
              </h3>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* === END NEW MULTI-SELECT CHECKBOX UI === */
