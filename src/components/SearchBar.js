import { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategoryFilter, 
  setSelectedCategoryFilter,
  categories = []
}) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="px-4 sm:px-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-sm sm:text-base transition-all duration-300 bg-white shadow-sm hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Filter Icon with Dropdown */}
        <div className="relative" ref={filterDropdownRef}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`p-3 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md shrink-0 ${
              selectedCategoryFilter 
                ? "border-orange-400 bg-orange-50" 
                : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
            }`}
          >
            <FunnelIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedCategoryFilter ? "text-orange-600" : "text-gray-600"}`} />
          </button>
          
          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <>
              {/* Backdrop overlay */}
              <div 
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowFilterDropdown(false)}
              ></div>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-slide-in-right" style={{ zIndex: 9999 }}>
              <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <h3 className="text-sm font-bold text-gray-900">กรองตามหมวดหมู่</h3>
              </div>
              <div className="max-h-64 overflow-y-auto bg-white">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategoryFilter(category === "ทั้งหมด" ? "" : category);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      (category === "ทั้งหมด" && !selectedCategoryFilter) || selectedCategoryFilter === category
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {category === "ทั้งหมด" ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>ทั้งหมด</span>
                      </>
                    ) : (
                      <>
                        <span className={`w-2 h-2 rounded-full ${selectedCategoryFilter === category ? "bg-orange-500" : "bg-gray-300"}`}></span>
                        <span>{category}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
              {selectedCategoryFilter && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter("");
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    ล้างตัวกรอง
                  </button>
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(selectedCategoryFilter || searchQuery.trim() !== "") && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {selectedCategoryFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
              หมวดหมู่: {selectedCategoryFilter}
              <button
                onClick={() => setSelectedCategoryFilter("")}
                className="hover:text-orange-900"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          {searchQuery.trim() !== "" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
              ค้นหา: {searchQuery}
              <button
                onClick={() => setSearchQuery("")}
                className="hover:text-blue-900"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          {(selectedCategoryFilter || searchQuery.trim() !== "") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium underline"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  );
}

