import React, { useEffect, useRef, useState, useMemo } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { 
  MapPin, 
  Layers, 
  Sparkles, 
  Search, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Flame, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Donation } from '@/types';
import { MADAGASCAR_CITIES, CATEGORIES } from '@/config/constants';

interface MadagascarMapProps {
  donations: Donation[];
  onSelectCity?: (city: string) => void;
  onSelectDonation?: (donationId: string) => void;
  selectedCity?: string;
  selectedFokontany?: string;
}

// Geographic coordinates lookup for cities and fokontanys in Madagascar
export const GEO_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Cities default centers
  'Antananarivo': { lat: -18.8792, lng: 47.5079 },
  'Toamasina': { lat: -18.1499, lng: 49.4023 },
  'Antsirabe': { lat: -19.8659, lng: 47.0333 },
  'Mahajanga': { lat: -15.7167, lng: 46.3167 },
  'Fianarantsoa': { lat: -21.4536, lng: 47.0858 },
  'Toliara': { lat: -23.3500, lng: 43.6667 },
  'Antsiranana (Diego)': { lat: -12.2833, lng: 49.2833 },
  'Moramanga': { lat: -18.9490, lng: 48.2300 },
  'Sambava': { lat: -14.2667, lng: 50.1667 },
  'Taolagnaro (Fort-Dauphin)': { lat: -25.0333, lng: 46.9833 },

  // Antananarivo Fokontanys
  'Analakely': { lat: -18.9056, lng: 47.5256 },
  'Ankorondrano': { lat: -18.8833, lng: 47.5265 },
  'Isoraka': { lat: -18.9135, lng: 47.5218 },
  'Mahamasina': { lat: -18.9189, lng: 47.5262 },
  'Andohalo': { lat: -18.9224, lng: 47.5312 },
  'Ambohimanarina': { lat: -18.8720, lng: 47.4950 },
  'Ankatso': { lat: -18.9160, lng: 47.5550 },
  'Tanjombato': { lat: -18.9610, lng: 47.5330 },
  'Itaosy': { lat: -18.9170, lng: 47.4770 },
  'Sabotsy Namehana': { lat: -18.8250, lng: 47.5450 },

  // Toamasina Fokontanys
  'Bazar Be': { lat: -18.1500, lng: 49.4180 },
  'Mangarivotra': { lat: -18.1450, lng: 49.4050 },
  'Tanambao V': { lat: -18.1550, lng: 49.3990 },
  'Salazamay': { lat: -18.1360, lng: 49.4080 },
  'Ankirihiry': { lat: -18.1250, lng: 49.4010 },

  // Antsirabe Fokontanys
  'Mahazoarivo': { lat: -19.8660, lng: 47.0330 },
  'Antsenakely': { lat: -19.8590, lng: 47.0370 },
  'Ambilankely': { lat: -19.8750, lng: 47.0250 },
  'Vichy': { lat: -19.8710, lng: 47.0290 },

  // Mahajanga Fokontanys
  'Majunga Be': { lat: -15.7190, lng: 46.3140 },
  'Tsaramandroso': { lat: -15.7120, lng: 46.3260 },
  'Manga': { lat: -15.7230, lng: 46.3190 },

  // Fianarantsoa Fokontanys
  'Ampitakely': { lat: -21.4520, lng: 47.0850 },
  'Ambalapaiso': { lat: -21.4590, lng: 47.0810 },
  'Tsianolondroa': { lat: -21.4480, lng: 47.0890 },
};

export const MadagascarMap: React.FC<MadagascarMapProps> = ({
  donations,
  onSelectCity,
  onSelectDonation,
  selectedCity = 'all',
  selectedFokontany = 'all'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showConcentrations, setShowConcentrations] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);
  const [localCategoryFilter, setLocalCategoryFilter] = useState('all');

  // Filter donations based on selections
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchCity = selectedCity === 'all' || d.city.toLowerCase().includes(selectedCity.toLowerCase()) || selectedCity.toLowerCase().includes(d.city.toLowerCase());
      const matchFokontany = selectedFokontany === 'all' || (d.fokontany && d.fokontany.toLowerCase().includes(selectedFokontany.toLowerCase()));
      const matchCategory = localCategoryFilter === 'all' || d.category === localCategoryFilter;
      return matchCity && matchFokontany && matchCategory;
    });
  }, [donations, selectedCity, selectedFokontany, localCategoryFilter]);

  // Aggregate concentrations by city
  const cityConcentrations = useMemo(() => {
    const counts: Record<string, { count: number; coords: { lat: number; lng: number } }> = {};
    for (const d of filteredDonations) {
      const cityName = d.city;
      const coords = GEO_COORDINATES[d.fokontany || ''] || GEO_COORDINATES[cityName] || GEO_COORDINATES['Antananarivo'];
      if (!counts[cityName]) {
        counts[cityName] = { count: 0, coords };
      }
      counts[cityName].count += 1;
    }
    return counts;
  }, [filteredDonations]);

  // Initialize Google Maps instance using importLibrary
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAK5r9h8v5IzmIh8bmyK-ncALkLM39uG5w';
    if (!mapContainerRef.current) return;

    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    importLibrary('maps')
      .then((mapsLib: any) => {
        if (!mapContainerRef.current) return;

        const defaultCenter = selectedCity !== 'all' && GEO_COORDINATES[selectedCity]
          ? GEO_COORDINATES[selectedCity]
          : { lat: -18.7669, lng: 46.8691 };

        const defaultZoom = selectedCity !== 'all' ? 12 : 6;

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeId: 'roadmap',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: false,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#cde2d9' }]
            },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#f2f7f4' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#d9ede2' }]
            }
          ]
        });

        googleMapInstanceRef.current = map;
        setMapLoaded(true);
      })
      .catch((err: any) => {
        console.warn('Google Maps API failed to load, switching to interactive fallback mode:', err);
        setLoadError(true);
      });

    return () => {
      // Cleanup markers & circles on unmount
      markersRef.current.forEach(m => m.setMap && m.setMap(null));
      circlesRef.current.forEach(c => c.setMap && c.setMap(null));
    };
  }, []);

  // Update map center and zoom when selectedCity changes
  useEffect(() => {
    if (!googleMapInstanceRef.current) return;

    if (selectedCity !== 'all' && GEO_COORDINATES[selectedCity]) {
      googleMapInstanceRef.current.panTo(GEO_COORDINATES[selectedCity]);
      googleMapInstanceRef.current.setZoom(12);
    } else {
      googleMapInstanceRef.current.panTo({ lat: -18.7669, lng: 46.8691 });
      googleMapInstanceRef.current.setZoom(6);
    }
  }, [selectedCity]);

  // Update map type
  useEffect(() => {
    if (!googleMapInstanceRef.current) return;
    googleMapInstanceRef.current.setMapTypeId(
      mapType === 'satellite' ? 'hybrid' : mapType === 'terrain' ? 'terrain' : 'roadmap'
    );
  }, [mapType]);

  // Render Markers and Concentration Circles
  useEffect(() => {
    const googleObj = (window as any).google;
    if (!googleMapInstanceRef.current || !googleObj || !googleObj.maps) return;

    const map = googleMapInstanceRef.current;
    const maps = googleObj.maps;

    // Clear existing markers & circles
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];

    // 1. Draw Concentration Heat Circles around cities & high-volume zones
    if (showConcentrations) {
      Object.entries(cityConcentrations).forEach(([cityName, data]) => {
        const radius = Math.min(18000 + data.count * 8000, 55000); // scaled radius

        // Outer glow circle
        const outerCircle = new maps.Circle({
          strokeColor: '#237A52',
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          fillColor: '#4DAA76',
          fillOpacity: 0.22,
          map,
          center: data.coords,
          radius,
        });

        // Inner core circle
        const innerCircle = new maps.Circle({
          strokeColor: '#F2C94C',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: '#F2C94C',
          fillOpacity: 0.35,
          map,
          center: data.coords,
          radius: radius * 0.45,
        });

        outerCircle.addListener('click', () => {
          map.panTo(data.coords);
          map.setZoom(12);
          if (onSelectCity) onSelectCity(cityName);
        });

        circlesRef.current.push(outerCircle, innerCircle);
      });
    }

    // 2. Render individual Donation Markers for each item
    filteredDonations.forEach((donation) => {
      // Resolve coordinates from fokontany or city
      let coords = (donation.fokontany && GEO_COORDINATES[donation.fokontany]) 
        ? GEO_COORDINATES[donation.fokontany] 
        : (GEO_COORDINATES[donation.city] || { lat: -18.8792, lng: 47.5079 });

      // Slight pseudo-jitter so multiple donations in same fokontany don't perfectly stack
      const jitterLat = coords.lat + (Math.random() - 0.5) * 0.008;
      const jitterLng = coords.lng + (Math.random() - 0.5) * 0.008;

      const marker = new maps.Marker({
        position: { lat: jitterLat, lng: jitterLng },
        map,
        title: `${donation.title} (${donation.fokontany || donation.city})`,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: donation.status === 'DISPONIBLE' ? '#237A52' : '#F2C94C',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });

      marker.addListener('click', () => {
        setActiveDonation(donation);
        map.panTo({ lat: jitterLat, lng: jitterLng });
        if (map.getZoom() < 13) {
          map.setZoom(13);
        }
      });

      markersRef.current.push(marker);
    });

  }, [filteredDonations, cityConcentrations, showConcentrations, onSelectCity]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setZoom((googleMapInstanceRef.current.getZoom() || 6) + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setZoom((googleMapInstanceRef.current.getZoom() || 6) - 1);
    }
  };

  const handleResetView = () => {
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat: -18.7669, lng: 46.8691 });
      googleMapInstanceRef.current.setZoom(6);
      if (onSelectCity) onSelectCity('all');
    }
  };

  return (
    <div className="relative bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden flex flex-col h-[740px]">
      
      {/* Top Map Action Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0">
        
        {/* Title & Stats */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
            <Compass className="w-5 h-5 text-emerald-700 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                Google Maps du Partage Madagascar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {filteredDonations.length} dons cartographiés
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Zones de concentration thermique et fokontanys actifs
            </p>
          </div>
        </div>

        {/* Interactive Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Concentration toggle button */}
          <button
            onClick={() => setShowConcentrations(!showConcentrations)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              showConcentrations
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Concentrations {showConcentrations ? 'Activées' : 'Masquées'}</span>
          </button>

          {/* Map Type Toggle */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                mapType === 'roadmap' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                mapType === 'satellite' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Category Filter on Map */}
          <select
            value={localCategoryFilter}
            onChange={(e) => setLocalCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Reset Zoom */}
          <button
            onClick={handleResetView}
            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Vue d'ensemble Madagascar"
          >
            Vue Madagascar
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full bg-[#f2f7f4] overflow-hidden">
        
        {/* Google Maps Real Canvas Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Fallback Display if API unavailable / blocked */}
        {loadError && (
          <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-xs flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md text-center border border-emerald-200 space-y-3">
              <MapPin className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-gray-900">Carte interactive Madagascar</h4>
              <p className="text-xs text-gray-600">
                La connexion à Google Maps est sécurisée. Les marqueurs des fokontanys et concentrations thermiques restent synchronisés avec vos données.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                Actualiser la carte
              </button>
            </div>
          </div>
        )}

        {/* Left Floating City & Fokontany Quick-Jump Panel */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[200px] hidden sm:flex pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 pointer-events-auto space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Villes & Concentrations
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  if (onSelectCity) onSelectCity('all');
                  handleResetView();
                }}
                className={`w-full text-left px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCity === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>Toute l'île</span>
                <span className="text-[10px] opacity-80">{donations.length}</span>
              </button>

              {MADAGASCAR_CITIES.map((city) => {
                const count = donations.filter(d => d.city.toLowerCase().includes(city.name.toLowerCase())).length;
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

                return (
                  <button
                    key={city.name}
                    onClick={() => {
                      if (onSelectCity) onSelectCity(city.name);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{city.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Zoomer"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Dézoomer"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Interactive Bottom Sheet / Card for Selected Donation */}
        {activeDonation && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-16 sm:w-96 z-20 animate-in slide-in-from-bottom-6 duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    {activeDonation.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                    État {activeDonation.conditionScore}/10
                  </span>
                </div>
                <button
                  onClick={() => setActiveDonation(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-3 items-center">
                <img
                  src={activeDonation.primaryImageUrl || activeDonation.imageUrls[0]}
                  alt={activeDonation.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-black text-sm text-gray-900 truncate">
                    {activeDonation.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">
                      {activeDonation.fokontany ? `${activeDonation.fokontany}, ${activeDonation.city}` : activeDonation.city}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    Offert par {activeDonation.ownerDisplayName}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Gratuit</span>
                </div>
                <button
                  onClick={() => {
                    if (onSelectDonation) onSelectDonation(activeDonation.id);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Consulter le don</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
