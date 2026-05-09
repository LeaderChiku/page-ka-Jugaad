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
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.provider_token) {
    console.error('No Google provider token found in session. Ensure drive.file scope was requested.')
    return null
  }
  
  return session.provider_token
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
      headers: { Authorization: `Bearer ${token}` }
    })
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
      body: JSON.stringify({
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Auto-generated folder for PageKaJugaad application assets'
      })
    })
    const createData = await createRes.json()
    if (createData.error) {
      console.error('Drive Folder Creation Error:', createData.error)
      return null
    }
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
  const token = await getGoogleToken()
  if (!token) return []

  const folderId = await getOrCreateAppFolder()
  if (!folderId) return []

  try {
    const listUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,thumbnailLink,webContentLink,mimeType)`
    const res = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    return data.files || []
  } catch (error) {
    console.error('Error fetching Drive inventory:', error)
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
      body: formData
    })

    const data = await res.json()
    return data.id
  } catch (error) {
    console.error('Error uploading to Drive:', error)
    return null
  }
}
