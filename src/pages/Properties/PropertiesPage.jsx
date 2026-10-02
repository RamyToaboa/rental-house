import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, MapPin, Bed, Bath, Square, ArrowUpRight, 
  ChevronDown, SlidersHorizontal, Check 
} from 'lucide-react';
import AddPropertyModal from './AddPropertyModal'; 

const initialMockData = [
  { id: 1, title: 'Modern Downtown Loft', location: 'Financial District, NYC', price: '$1,250,000', beds: 3, baths: 2, sqft: '1,850', type: 'For Sale', tag: 'Commercial', description: 'Experience luxury living in the heart of the financial district. This loft features floor-to-ceiling windows and premium finishes.', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop' },
  { id: 2, title: 'Lakeside Villa', location: 'Lake Tahoe, CA', price: '$2,850,000', beds: 4, baths: 3, sqft: '3,200', type: 'For Sale', tag: 'Residential', description: 'A stunning villa with panoramic lake views. Includes a private dock, spacious patio, and a gourmet kitchen.', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop' },
  { id: 3, title: 'Urban Penthouse', location: 'SoHo, London', price: '$3,500,000', beds: 2, baths: 2, sqft: '1,400', type: 'For Rent', tag: 'Commercial', description: 'Sleek and modern penthouse in the vibrant SoHo district. Walking distance to the best restaurants and shops.', image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=600&h=400&fit=crop' },
  { id: 4, title: 'Smart City Studio', location: 'SoHo, New York City', price: '$1,450,000', beds: 3, baths: 2, sqft: '2,250', type: 'For Sale', tag: 'Commercial', description: 'Fully automated smart home features, energy-efficient appliances, and a prime location in the city.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop' },
  { id: 5, title: 'Luxury Waterfront Apartment', location: 'Miami Beach, FL', price: '$2,200,000', beds: 3, baths: 3, sqft: '2,100', type: 'For Rent', tag: 'Commercial', description: 'Wake up to ocean views every day. This apartment offers resort-style amenities and direct beach access.', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop' },
  { id: 6, title: 'Contemporary Family Townhouse', location: 'Park Slope, Brooklyn', price: '$1,980,000', beds: 4, baths: 3, sqft: '2,800', type: 'Sold', tag: 'Residential', description: 'Perfect for families. A beautiful brownstone with a private backyard and a renovated interior.', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop' },
  { id: 7, title: 'Executive Business Condo', location: 'Downtown Chicago, IL', price: '$1,150,000', beds: 2, baths: 2, sqft: '1,600', type: 'For Sale', tag: 'Commercial', description: 'Ideal for professionals. Located in a high-rise with a gym, business center, and 24/7 security.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop' },
  { id: 8, title: 'Suburban Smart Home', location: 'Palo Alto, CA', price: '$4,250,000', beds: 5, baths: 4, sqft: '3,750', type: 'For Sale', tag: 'Luxury', description: 'A masterpiece of modern architecture. Features a home theater, pool, and extensive smart home integration.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop' },
];

const PropertiesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sortBy, setSortBy] = useState('name');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortPos, setSortPos] = useState({ top: 0, left: 0, width: 0 });
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const [properties, setProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('realEstateProperties');
      return saved ? JSON.parse(saved) : initialMockData;
    } catch (error) {
      console.error("Failed to load properties from localStorage:", error);
      return initialMockData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('realEstateProperties', JSON.stringify(properties));
    } catch (error) {
      console.error("Failed to save properties to localStorage:", error);
    }
  }, [properties]);

  // 👇 Position the sort dropdown (viewport-aware)
  useLayoutEffect(() => {
    if (!isSortOpen || !sortButtonRef.current) return;
    const rect = sortButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const width = 160;

    let left = rect.right - width;
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 180;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;

    setSortPos({ top, left, width });
  }, [isSortOpen]);

  // 👇 Reposition on resize
  useEffect(() => {
    if (!isSortOpen) return;
    const handleResize = () => {
      if (!sortButtonRef.current) return;
      const rect = sortButtonRef.current.getBoundingClientRect();
      const padding = 12;
      const width = 160;
      let left = rect.right - width;
      left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
      setSortPos(prev => ({ ...prev, left }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSortOpen]);

  // 👇 Click outside + scroll close
  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (e) => {
      if (
        sortButtonRef.current && !sortButtonRef.current.contains(e.target) &&
        sortMenuRef.current && !sortMenuRef.current.contains(e.target)
      ) {
        setIsSortOpen(false);
      }
    };
    const handleScroll = (e) => {
      if (sortMenuRef.current && sortMenuRef.current.contains(e.target)) return;
      setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isSortOpen]);

  const handleAddProperty = (newProperty) => {
    setProperties([newProperty, ...properties]);
  };

  const filteredProperties = properties.filter((property) => {
    const matchesFilter = activeFilter === 'All' || property.type === activeFilter;
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'location') return a.location.localeCompare(b.location);
    if (sortBy === 'price') {
      const priceA = Number(a.price.replace(/[^0-9.-]+/g, ""));
      const priceB = Number(b.price.replace(/[^0-9.-]+/g, ""));
      return priceA - priceB;
    }
    return 0;
  });

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'location', label: 'Location' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Name';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Properties</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage and view all your property listings</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name..."
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:w-80"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 dark:shadow-none"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'For Sale', 'For Rent', 'Sold'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </button>
        </div>
        
        {/* 👇 Sort Dropdown Button */}
        <button
          ref={sortButtonRef}
          onClick={() => setIsSortOpen(!isSortOpen)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            isSortOpen
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          Sort by {currentSortLabel}
          <ChevronDown className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProperties.map((property) => (
          <Link 
            to={`/properties/${property.id}`} 
            state={{ property }} 
            key={property.id} 
            className="group block cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <span className={`absolute top-3 left-3 rounded-md px-2 py-1 text-xs font-semibold text-white ${
                property.type === 'For Sale' ? 'bg-emerald-500' : 
                property.type === 'For Rent' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {property.type}
              </span>
              <div className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 text-gray-700 backdrop-blur-sm transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:bg-slate-800/80 dark:text-slate-200">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{property.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <MapPin className="h-3 w-3" /> {property.location}
              </p>
              
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.beds} Beds</span>
                <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.baths} Baths</span>
                <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {property.sqft} sq.ft.</span>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-800">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{property.price}</p>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                  {property.tag}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {sortedProperties.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-lg font-medium text-gray-900 dark:text-white">No properties found</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Try adjusting your filter or search query.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddPropertyModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddProperty} 
        />
      )}

      {/* 👇 Sort Dropdown — rendered via portal, no clipping */}
      {isSortOpen && createPortal(
        <div
          ref={sortMenuRef}
          style={{
            position: 'fixed',
            top: `${sortPos.top}px`,
            left: `${sortPos.left}px`,
            width: `${sortPos.width}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Sort by
            </p>
          </div>
          <div className="py-1">
            {sortOptions.map((option) => {
              const isSelected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PropertiesPage;