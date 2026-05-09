import { create } from 'zustand'
import { DriveFile } from '@/lib/google-drive'

export type PaperSize = 'A4' | 'A5' | 'A6' | 'A7' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type ArrangementMode = 'sequential' | 'repeat' | 'smart-balanced'

interface StudioState {
  inventory: DriveFile[]
  selectedIndices: number[] // Indices of inventory items in selection order
  paperSize: PaperSize
  orientation: Orientation
  arrangementMode: ArrangementMode
  gridCount: number
  margin: number
  spacing: number
  randomLayoutData: { id: string, url: string, x: number, y: number, rotation: number, scale: number }[] | null
  
  // Actions
  addImage: (file: DriveFile) => void
  removeImage: (index: number) => void
  toggleSelection: (index: number) => void
  setPaperSize: (size: PaperSize) => void
  setOrientation: (orientation: Orientation) => void
  setArrangementMode: (mode: ArrangementMode) => void
  setGridCount: (count: number) => void
  setMargin: (margin: number) => void
  setSpacing: (spacing: number) => void
  clearInventory: () => void
  clearSelection: () => void
  generateRandomLayout: (count: number) => void
  clearRandomLayout: () => void
}

export const useStudioStore = create<StudioState>((set) => ({
  inventory: [],
  selectedIndices: [],
  paperSize: 'A4',
  orientation: 'portrait',
  arrangementMode: 'sequential',
  gridCount: 4,
  margin: 20,
  spacing: 10,
  randomLayoutData: null,

  addImage: (file) => set((state) => ({ inventory: [...state.inventory, file] })),
  
  removeImage: (index) => set((state) => {
    const newInventory = state.inventory.filter((_, i) => i !== index);
    // When an item is removed from inventory, we must also remove it from selection 
    // and adjust other selected indices because the inventory shifted.
    const newSelectedIndices = state.selectedIndices
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));
      
    return { 
      inventory: newInventory,
      selectedIndices: newSelectedIndices
    };
  }),

  toggleSelection: (index) => set((state) => {
    const isSelected = state.selectedIndices.includes(index);
    if (isSelected) {
      return { 
        selectedIndices: state.selectedIndices.filter((i) => i !== index) 
      };
    } else {
      return { 
        selectedIndices: [...state.selectedIndices, index] 
      };
    }
  }),

  setPaperSize: (paperSize) => set({ paperSize }),
  setOrientation: (orientation) => set({ orientation }),
  setArrangementMode: (arrangementMode) => set({ arrangementMode }),
  setGridCount: (gridCount) => set({ gridCount }),
  setMargin: (margin) => set({ margin }),
  setSpacing: (spacing) => set({ spacing }),
  clearInventory: () => set({ inventory: [], selectedIndices: [], randomLayoutData: null }),
  clearSelection: () => set({ selectedIndices: [] }),
  generateRandomLayout: (count) => set((state) => {
    if (state.inventory.length === 0) return state;
    
    const randomItems = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * state.inventory.length);
      const item = state.inventory[randomIndex];
      randomItems.push({
        id: item.id,
        url: item.thumbnailLink,
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 1.0
      });
    }
    return { randomLayoutData: randomItems, arrangementMode: 'sequential' }; // Switch to sequential but show random data
  }),
  clearRandomLayout: () => set({ randomLayoutData: null }),
}))
