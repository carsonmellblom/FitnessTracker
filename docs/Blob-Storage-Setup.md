# Azure Blob Storage Integration - Setup Guide

## ✅ **What's Implemented**

### Secure Photo Architecture

**Photos are served via API proxy - browser NEVER accesses blob storage directly.**

### Backend (.NET API)
1. ✅ **Storage Abstraction Layer**
   - `IFileStorageService` interface
   - `LocalFileStorageService` for development (saves to `./uploads`)
   - `BlobStorageService` for production (Azure Blob Storage)

2. ✅ **Secure Photo Streaming Endpoint**
   - `GET /api/v1/photos/{id}/image?type={thumbnail|original|cropped}`
   - Verifies JWT authentication
   - Checks photo ownership before serving
   - Streams image from blob storage with `image/jpeg` content type
   - 24-hour browser caching headers
   - Fallback to original if thumbnail/cropped not yet processed

3. ✅ **API Integration**
   - `PhotosController`: Returns `null` for image URLs (frontend constructs secure URLs)
   - `Program.cs`: Conditional service registration based on connection string
   - Frontend helper: `getPhotoUrl(photoId, type)` constructs API proxy URLs

### Photo Processor (Python)
1. ✅ **Storage Module** (`storage.py`)
   - `FileStorage` abstract base class
   - `LocalStorage` for development
   - `BlobStorage` for Azure production
   - Automatic detection via connection string

2. ✅ **Processor Logic**
   - Downloads photos from storage
   - Generates thumbnail and cropped versions
   - Returns **full file paths** (not filenames with `/uploads/` prefix)
   - Uploads processed images back to storage
   - Database stores just filenames

---

## 🚀 **Azure Deployment**

### 1. Configure Blob Storage Networking

**CRITICAL:** Blob storage must be VNet-only (no public access):

```powershell
# Set to "Selected networks" mode
az storage account update `
  --name fitnesstrackerstg `
  --resource-group FitnessTrackerRG `
  --default-action Deny

# Allow VNet access
az storage account network-rule add `
  --account-name fitnesstrackerstg `
  --resource-group FitnessTrackerRG `
  --vnet-name fitness-vnet `
  --subnet snet-apps
```

**Verify:**
- Azure Portal → Storage Account → Networking
- **"Enabled from selected networks"** should be selected
- Browser cannot access blobs directly (403 Forbidden) ✅

### 2. Update API Container

```powershell
az containerapp update `
  --name fitness-api `
  --resource-group FitnessTrackerRG `
  --set-env-vars `
    "AzureStorage__ConnectionString=<YOUR_CONNECTION_STRING>" `
    "AzureStorage__ContainerName=progress-photos"
```

**Get connection string:**
```powershell
az storage account show-connection-string `
  --name fitnesstrackerstg `
  --resource-group FitnessTrackerRG `
  --output tsv
```

### 3. Update Photo Processor Container

```powershell
az containerapp update `
  --name fitness-photo-processor `
  --resource-group FitnessTrackerRG `
  --set-env-vars `
    "AZURE_STORAGE_CONNECTION_STRING=<YOUR_CONNECTION_STRING>" `
    "AZURE_STORAGE_CONTAINER_NAME=progress-photos"
```

**⚠️ Variable naming conventions:**
- **API**: `AzureStorage__ConnectionString` (double underscore - .NET)
- **Processor**: `AZURE_STORAGE_CONNECTION_STRING` (single underscore - Python)

### 4. Deploy via GitHub Actions

```bash
git add .
git commit -m "Deploy secure photo access"
git push
```

GitHub Actions automatically builds and deploys both containers.

---

## 🧪 **Testing**

### 1. Verify Services Started

```powershell
# Check API logs
az containerapp logs show --name fitness-api --resource-group FitnessTrackerRG --tail 20

# Check Processor logs  
az containerapp logs show --name fitness-photo-processor --resource-group FitnessTrackerRG --tail 20
```

**Expected logs:**
- **API**: `"Using Azure Blob Storage: Container 'progress-photos'"`
- **Processor**: `"Using Azure Blob Storage: Container 'progress-photos'"`

### 2. Test Photo Upload

1. Open frontend app
2. Upload progress photo
3. **Immediately**: Photo shows with original image (fallback)
4. **After ~30 seconds**: Refresh - thumbnail appears

### 3. Verify Security

**Browser DevTools → Network tab:**
- Image URLs: `/api/v1/photos/{id}/image?type=thumbnail` ✅
- **No blob storage URLs** ✅
- All requests show 200 OK with `image/jpeg` content type

**Try direct blob access (should fail):**
```
https://fitnesstrackerstg.blob.core.windows.net/progress-photos/filename.jpg
→ 403 Forbidden ✅
```

### 4. Check Blob Storage

```powershell
az storage blob list `
  --account-name fitnesstrackerstg `
  --container-name progress-photos `
  --output table
```

**Expected files per photo:**
- `{guid}.jpg` (original)
- `{guid}_thumb.jpg` (thumbnail)
- `{guid}_cropped.jpg` (cropped)

---

## 🔍 **How It Works**

### Local Development (No Azure)
```
Frontend → API → ./uploads/ ← Processor
```
- Uses local `./uploads` directory
- Both API and Processor access same local files

### Azure Production (Secure)
```
Frontend → API (proxy) → Blob Storage ← Processor
         (auth check)    (VNet-only)
```

**Photo Upload Flow:**
1. Frontend uploads to API
2. API saves to blob storage
3. API queues message to RabbitMQ
4. Processor downloads from blob
5. Processor generates thumbnail/cropped
6. Processor uploads back to blob
7. Database updated with paths

**Photo Display Flow:**
1. Frontend requests: `GET /api/v1/photos/123/image?type=thumbnail`
2. API checks JWT authentication
3. API verifies user owns photo 123
4. API streams image from blob storage
5. Browser caches for 24 hours

**Security:**
- ✅ No SAS URLs generated
- ✅ No direct blob access from browser
- ✅ Every image request authenticated
- ✅ Ownership verified on every request
- ✅ VNet-only blob storage access

---


## 📋 **Deployment Checklist**


### Azure Configuration
- [ ] Set blob storage to "Selected networks" (VNet-only)
- [ ] Set `AzureStorage__ConnectionString` on API container
- [ ] Set `AZURE_STORAGE_CONNECTION_STRING` on processor container
- [ ] Deploy via GitHub Actions
- [ ] Verify logs show "Using Azure Blob Storage"
- [ ] Test photo upload and processing
- [ ] Verify browser gets images via `/api/v1/photos/{id}/image`
- [ ] Confirm direct blob access returns 403

---

## 🔧 **Troubleshooting**

**Photos not displaying:**
- Check API logs for "file not found" errors
- Verify blob storage connection string is set
- Check VNet access is configured
- Ensure container name is `progress-photos`

**Processor not creating thumbnails:**
- Check processor logs for errors
- Verify `AZURE_STORAGE_CONNECTION_STRING` is set
- Check RabbitMQ connectivity
- Look for `Uploaded {filename}_thumb.jpg to blob storage` in logs

**403 errors in browser:**
- **Expected!** Direct blob access should fail
- Verify images load via `/api/v1/photos/{id}/image`
- If API endpoint also gives 403, check JWT authentication
