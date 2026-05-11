import { create } from 'zustand'
import { DriveFile } from '@/lib/google-drive'

export type PaperSize = 'A4' | 'A5' | 'A6' | 'A7' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type ArrangementMode = 'sequential' | 'repeat' | 'smart-balanced'

interface StudioState {
  inventory: DriveFile[]
  selectedIds: string[] // IDs of inventory items in selection order
  paperSize: PaperSize
  orientation: Orientation
  arrangementMode: ArrangementMode
  gridCount: number
  margin: number
  spacing: number
  showOutlines: boolean
  isPositioningUnlocked: boolean
  imageTransforms: Record<string, { zoom: number, x: number, y: number }>
  randomLayoutData: { id: string, url: string, x: number, y: number, rotation: number, scale: number }[] | null
  isLoadingInventory: boolean
  
  // Actions
  setInventory: (files: DriveFile[]) => void
  syncInventory: () => Promise<void>
  addImage: (file: DriveFile) => void
  removeImage: (id: string) => void
  toggleSelection: (id: string) => void
  updateImageTransform: (id: string, transform: Partial<{ zoom: number, x: number, y: number }>) => void
  setPaperSize: (size: PaperSize) => void

  setOrientation: (orientation: Orientation) => void
  setArrangementMode: (mode: ArrangementMode) => void
  setGridCount: (count: number) => void
  setMargin: (margin: number) => void
  setSpacing: (spacing: number) => void
  setShowOutlines: (show: boolean) => void
  setIsPositioningUnlocked: (unlocked: boolean) => void
  clearInventory: () => void
  clearSelection: () => void
  generateRandomLayout: (count: number) => void
  clearRandomLayout: () => void
}

export const useStudioStore = create<StudioState>((set) => ({
  inventory: [],
  selectedIds: [],
  paperSize: 'A4',
  orientation: 'portrait',
  arrangementMode: 'sequential',
  gridCount: 4,
  margin: 20,
  spacing: 10,
  showOutlines: true,
  isPositioningUnlocked: false,
  imageTransforms: {},
  randomLayoutData: null,
  isLoadingInventory: false,

  setInventory: (files) => set({ inventory: files }),
  addImage: (file) => set((state) => ({ inventory: [...state.inventory, file] })),
  
  removeImage: (id) => set((state) => {
    const newInventory = state.inventory.filter((item) => item.id !== id);
    // When an item is removed from inventory, we must also remove it from selection 
    const newSelectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
    
    // Also cleanup transforms
    const newTransforms = { ...state.imageTransforms };
    delete newTransforms[id];
      
    return { 
      inventory: newInventory,
      selectedIds: newSelectedIds,
      imageTransforms: newTransforms
    };
  }),

  toggleSelection: (id) => set((state) => {
    const isSelected = state.selectedIds.includes(id);
    if (isSelected) {
      return { 
        selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id) 
      };
    } else {
      return { 
        selectedIds: [...state.selectedIds, id] 
      };
    }
  }),

  updateImageTransform: (id, transform) => set((state) => {
    const current = state.imageTransforms[id] || { zoom: 1, x: 0, y: 0 };
    return {
      imageTransforms: {
        ...state.imageTransforms,
        [id]: { ...current, ...transform }
      }
    };
  }),

  setPaperSize: (paperSize) => set({ paperSize }),
  setOrientation: (orientation) => set({ orientation }),
  setArrangementMode: (arrangementMode) => set({ arrangementMode }),
  setGridCount: (gridCount) => set({ gridCount }),
  setMargin: (margin) => set({ margin }),
  setSpacing: (spacing) => set({ spacing }),
  setShowOutlines: (showOutlines) => set({ showOutlines }),
  setIsPositioningUnlocked: (isPositioningUnlocked) => set({ isPositioningUnlocked }),
  clearInventory: () => set({ inventory: [], selectedIds: [], imageTransforms: {}, randomLayoutData: null }),
  clearSelection: () => set({ selectedIds: [] }),

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
  
  syncInventory: async () => {
    const { fetchDriveInventory } = await import('@/lib/google-drive')
    set({ isLoadingInventory: true })
    try {
      const files = await fetchDriveInventory()
      set({ inventory: files })
    } catch (error) {
      console.error('Failed to sync inventory:', error)
      throw error
    } finally {
      set({ isLoadingInventory: false })
    }
  }
}))


