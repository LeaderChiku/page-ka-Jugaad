import { create } from 'zustand'

export type PaperSize = 'A4' | 'A5' | 'A6' | 'A7' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type ArrangementMode = 'sequential' | 'random' | 'repeat' | 'smart-balanced'

interface StudioState {
  inventory: string[]
  selectedIndices: number[] // Indices of inventory items in selection order
  paperSize: PaperSize
  orientation: Orientation
  arrangementMode: ArrangementMode
  gridCount: number
  margin: number
  spacing: number
  
  // Actions
  addImage: (url: string) => void
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

  addImage: (url) => set((state) => ({ inventory: [...state.inventory, url] })),
  
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
  clearInventory: () => set({ inventory: [], selectedIndices: [] }),
  clearSelection: () => set({ selectedIndices: [] }),
}))
