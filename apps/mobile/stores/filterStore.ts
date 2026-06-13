import { create } from 'zustand';

interface FilterState {
  sportType: string | null;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  selectedAmenities: string[];
  setSportType: (sport: string | null) => void;
  setPriceRange: (min: number, max: number) => void;
  setMinRating: (rating: number) => void;
  toggleAmenity: (amenityId: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  sportType: null,
  minPrice: 0,
  maxPrice: 2000,
  minRating: 0,
  selectedAmenities: [],
  setSportType: (sport) => set({ sportType: sport }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  setMinRating: (rating) => set({ minRating: rating }),
  toggleAmenity: (amenityId) => set((state) => ({
    selectedAmenities: state.selectedAmenities.includes(amenityId)
      ? state.selectedAmenities.filter((id) => id !== amenityId)
      : [...state.selectedAmenities, amenityId],
  })),
  resetFilters: () => set({
    sportType: null,
    minPrice: 0,
    maxPrice: 2000,
    minRating: 0,
    selectedAmenities: [],
  }),
}));
