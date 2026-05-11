import { createClient } from '@/lib/supabase/client'

const APP_FOLDER_NAME = 'PageKaJugaad Inventory'
const LOCAL_STORAGE_KEY = 'pagekajugaad_drive_folder_id'

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
  console.log('[Google Drive] Fetching dynamic session...')
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[Google Drive] Supabase session error:', error)
    return null
  }

  const token = session?.provider_token
  
  if (!token) {
    console.warn('[Google Drive] No Google provider token found in session.')
    return null
  }
  
  return token
}

/**
 * Generic wrapper for Google Drive API requests with automatic retry on 401.
 */
async function driveRequest(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
  const signal = options.signal || AbortSignal.timeout(15000);

  try {
    const token = await getGoogleToken()
    if (!token) {
      throw new Error('AUTH_EXPIRED')
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }

    console.log(`[Google Drive] Request started: ${url} (Retry: ${retryCount})`)
    const response = await fetch(url, { 
      ...options, 
      headers,
      signal
    })

    if (response.status === 401 && retryCount === 0) {
      console.warn('[Google Drive] 401 Unauthorized. Refreshing session...')
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error || !session?.provider_token) {
        throw new Error('AUTH_EXPIRED')
      }

      console.log('[Google Drive] Session refreshed. Retrying...')
      return driveRequest(url, options, retryCount + 1)
    }

    return response
  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.error(`[Google Drive] Request aborted (timeout): ${url}`)
      throw new Error('DRIVE_TIMEOUT')
    }
    throw error
  }
}

/**
 * Finds or creates the dedicated "PageKaJugaad" folder in the user's Google Drive.
 * Caches the folderId in localStorage and Supabase user_metadata for fast retrieval.
 */
export async function getOrCreateInventoryFolder(): Promise<string | null> {
  try {
    // 1. Check local storage
    if (typeof window !== 'undefined') {
      const localFolderId = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (localFolderId) {
        return localFolderId
      }
    }

    // 2. Check Supabase user_metadata
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.user_metadata?.driveFolderId) {
      const metadataFolderId = user.user_metadata.driveFolderId
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, metadataFolderId)
      }
      return metadataFolderId
    }

    // 3. Search for existing folder in Google Drive
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    const searchRes = await driveRequest(searchUrl, {
      signal: AbortSignal.timeout(10000)
    })
    
    if (!searchRes.ok) {
      const errData = await searchRes.json()
      console.error('[Google Drive] Folder Search Error:', errData)
      return null
    }

    const searchData = await searchRes.json()
    let folderId = null;

    if (searchData.files && searchData.files.length > 0) {
      folderId = searchData.files[0].id
    } else {
      // 4. Create folder if not found
      console.log('[Google Drive] App folder not found, creating new one...')
      const createRes = await driveRequest('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
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
        console.error('[Google Drive] Folder Creation Error:', errData)
        return null
      }

      const createData = await createRes.json()
      console.log('[Google Drive] App folder created:', createData.id)
      folderId = createData.id
    }

    if (folderId) {
      // Save the discovered/created folderId permanently
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, folderId)
      }
      await supabase.auth.updateUser({
        data: { driveFolderId: folderId }
      })
      return folderId
    }

    return null
  } catch (error) {
    console.error('[Google Drive] Error getting/creating folder:', error)
    return null
  }
}

/**
 * Lists image files from the "PageKaJugaad" folder.
 */
export async function fetchDriveInventory(): Promise<DriveFile[]> {
  console.log('[Google Drive] Starting inventory sync...')
  
  try {
    const folderId = await getOrCreateInventoryFolder()
    if (!folderId) {
      console.error('[Google Drive] App folder not found or could not be created')
      throw new Error('FOLDER_NOT_FOUND')
    }

    console.log('[Google Drive] Fetching file list...')
    const listUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,thumbnailLink,webContentLink,mimeType)`
    const res = await driveRequest(listUrl, {
      signal: AbortSignal.timeout(15000)
    })
    
    if (!res.ok) {
      const errData = await res.json()
      console.error('[Google Drive] List API Error:', errData)
      return []
    }

    const data = await res.json()
    console.log(`[Google Drive] Sync success: found ${data.files?.length || 0} files`)
    return data.files || []
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Google Drive] Request timed out')
    }
    if (error.message === 'AUTH_EXPIRED') {
      console.warn('[Google Drive] Auth expired during sync')
      throw error
    }
    console.error('[Google Drive] Unexpected sync error:', error)
    return []
  }
}

/**
 * Uploads a file (dataURL or File object) to the "PageKaJugaad" folder.
 */
export async function uploadToDrive(file: File | Blob, fileName: string): Promise<string | null> {
  const folderId = await getOrCreateInventoryFolder()
  if (!folderId) return null

  // Secure validation
  if (file instanceof File || file instanceof Blob) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.error('[Google Drive] Rejected: Unsupported file type', file.type)
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      console.error('[Google Drive] Rejected: File too large', file.size)
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

    console.log(`[Google Drive] Uploading file: ${fileName}...`)
    const res = await driveRequest('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      signal: AbortSignal.timeout(60000), // Longer timeout for uploads
      body: formData
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error('[Google Drive] Upload API Error:', errData)
      return null
    }

    const data = await res.json()
    console.log('[Google Drive] Upload successful:', data.id)
    return data.id
  } catch (error) {
    console.error('[Google Drive] Error uploading file:', error)
    return null
  }
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFromDrive(fileId: string): Promise<boolean> {
  try {
    console.log(`[Google Drive] Deleting file: ${fileId}...`)
    const res = await driveRequest(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) {
      const errData = await res.json()
      console.error('[Google Drive] Delete Error:', errData)
      return false
    }

    console.log('[Google Drive] Delete successful')
    return res.status === 204
  } catch (error) {
    console.error('[Google Drive] Error deleting file:', error)
    return false
  }
}

