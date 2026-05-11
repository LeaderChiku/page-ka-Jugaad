import { createClient } from '@/lib/supabase/client'

const APP_FOLDER_NAME = 'PageKaJugaad Inventory'

export interface DriveFile {
  id: string
  name: string
  thumbnailLink: string
  webContentLink: string
  mimeType: string
}

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml'
]

export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

/**
 * Fetches the provider token from the Supabase session.
 * This token is used to call Google APIs.
 */
async function getGoogleToken() {
  const supabase = createClient()
  
  // getSession() will automatically refresh the Supabase session if autoRefreshToken is true
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Supabase session error:', error)
    return null
  }

  const token = session?.provider_token
  
  if (!token) {
    console.warn('No Google provider token found in session. User may need to re-authenticate.')
    return null
  }
  
  return token
}

/**
 * Finds or creates the dedicated "PageKaJugaad" folder in the user's Google Drive.
 */
export async function getOrCreateAppFolder(): Promise<string | null> {
  const token = await getGoogleToken()
  if (!token) return null

  try {
    // 1. Search for existing folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!searchRes.ok) {
      const errData = await searchRes.json()
      console.error('Drive Search Error:', errData)
      return null
    }

    const searchData = await searchRes.json()
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id
    }

    // 2. Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Auto-generated folder for PageKaJugaad application assets'
      })
    })

    if (!createRes.ok) {
      const errData = await createRes.json()
      console.error('Drive Folder Creation Error:', errData)
      return null
    }

    const createData = await createRes.json()
    return createData.id
  } catch (error) {
    console.error('Error getting/creating Drive folder:', error)
    return null
  }
}

/**
 * Lists image files from the "PageKaJugaad" folder.
 */
export async function fetchDriveInventory(): Promise<DriveFile[]> {
  console.log('fetchDriveInventory: Starting sync...')
  const token = await getGoogleToken()
  if (!token) {
    console.warn('fetchDriveInventory: No token available')
    throw new Error('AUTH_EXPIRED')
  }

  console.log('fetchDriveInventory: Getting app folder...')
  const folderId = await getOrCreateAppFolder()
  if (!folderId) {
    console.error('fetchDriveInventory: App folder not found or could not be created')
    throw new Error('FOLDER_NOT_FOUND')
  }

  try {
    console.log('fetchDriveInventory: Requesting file list from Drive...')
    const listUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,thumbnailLink,webContentLink,mimeType)`
    const res = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        console.warn('fetchDriveInventory: 401 Unauthorized')
        throw new Error('AUTH_EXPIRED')
      }
      const errData = await res.json()
      console.error('fetchDriveInventory: Drive List API Error:', errData)
      return []
    }

    const data = await res.json()
    console.log(`fetchDriveInventory: Found ${data.files?.length || 0} files`)
    return data.files || []
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('fetchDriveInventory: Request timed out')
    }
    if (error.message === 'AUTH_EXPIRED') throw error
    console.error('fetchDriveInventory: Unexpected error:', error)
    return []
  }
}

/**
 * Uploads a file (dataURL or File object) to the "PageKaJugaad" folder.
 */
export async function uploadToDrive(file: File | Blob, fileName: string): Promise<string | null> {
  const token = await getGoogleToken()
  if (!token) return null

  const folderId = await getOrCreateAppFolder()
  if (!folderId) return null

  // Secure validation
  if (file instanceof File || file instanceof Blob) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.error('Rejected: Unsupported file type', file.type)
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      console.error('Rejected: File too large', file.size)
      return null
    }
  }

  try {
    const metadata = {
      name: fileName,
      parents: [folderId]
    }

    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    formData.append('file', file)

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(30000), // Longer timeout for uploads
      body: formData
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error('Drive Upload API Error:', errData)
      return null
    }

    const data = await res.json()
    return data.id
  } catch (error) {
    console.error('Error uploading to Drive:', error)
    return null
  }
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFromDrive(fileId: string): Promise<boolean> {
  const token = await getGoogleToken()
  if (!token) return false

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) {
      const errData = await res.json()
      console.error('Drive Delete Error:', errData)
      return false
    }

    return res.status === 204
  } catch (error) {
    console.error('Error deleting from Drive:', error)
    return false
  }
}

