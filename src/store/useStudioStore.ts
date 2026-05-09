import { create } from 'zustand'

export type PaperSize = 'A4' | 'A5' | 'A6' | 'A7' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type LayoutType = 'grid' | 'freeform' | 'auto'

interface StudioState {
  inventory: string[]
  paperSize: PaperSize
  orientation: Orientation
  layoutType: LayoutType
  gridCount: number
  margin: number
  spacing: number
  
  // Actions
  addImage: (url: string) => void
  removeImage: (index: number) => void
  setPaperSize: (size: PaperSize) => void
  setOrientation: (orientation: Orientation) => void
  setLayoutType: (type: LayoutType) => void
  setGridCount: (count: number) => void
  setMargin: (margin: number) => void
  setSpacing: (spacing: number) => void
  clearInventory: () => void
}

export const useStudioStore = create<StudioState>((set) => ({
  inventory: [],
  paperSize: 'A4',
  orientation: 'portrait',
  layoutType: 'grid',
  gridCount: 4,
  margin: 20,
  spacing: 10,

  addImage: (url) => set((state) => ({ inventory: [...state.inventory, url] })),
  removeImage: (index) => set((state) => ({ 
    inventory: state.inventory.filter((_, i) => i !== index) 
  })),
  setPaperSize: (paperSize) => set({ paperSize }),
  setOrientation: (orientation) => set({ orientation }),
  setLayoutType: (layoutType) => set({ layoutType }),
  setGridCount: (gridCount) => set({ gridCount }),
  setMargin: (margin) => set({ margin }),
  setSpacing: (spacing) => set({ spacing }),
  clearInventory: () => set({ inventory: [] }),
}))
