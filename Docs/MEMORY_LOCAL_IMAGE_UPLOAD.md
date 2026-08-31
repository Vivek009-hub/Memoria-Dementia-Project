# Local Memory Photo Upload Architecture & Specification

**Module:** Memory Library (Phase F5 / B5)  
**Storage Architecture:** Local Host Storage (`server/uploads/memories`)  

---

## 1. Overview

Users can upload actual photo files (JPEG, PNG, WEBP, GIF) from their local computer or device when adding or updating memories. Uploaded photos are stored on the server filesystem and served statically via Express.

---

## 2. Technical Implementation

```text
CLIENT (CreateEditMemoryModal)
   │
   ├─► Select local image file (<input type="file" />)
   ├─► Generates local preview URL (URL.createObjectURL)
   ├─► Submits FormData (field: 'photo')
   ↓
EXPRESS BACKEND (POST /api/v1/memories)
   │
   ├─► photoUploadMiddleware (Multer disk storage)
   ├─► Validates MIME type (JPEG, PNG, WEBP, GIF) and 10MB limit
   ├─► Generates safe filename (timestamp-randomHex.ext)
   ├─► Saves to server/uploads/memories/
   ├─► Database stores mediaUrl = "/uploads/memories/<filename>"
   ↓
STATIC SERVING
   │
   └─► Express serves /uploads statically (express.static)
   └─► Vite proxy forwards /uploads requests from client (port 5173 -> 5000)
```

---

## 3. Security & Validation

- **Safe Naming**: User filenames are replaced with cryptographic hex strings to prevent path traversal attacks.
- **MIME Validation**: File types are validated on the backend via Multer `fileFilter`. Executable or non-image files return `422 UNPROCESSABLE_ENTITY`.
- **File Size Limit**: Enforced at 10 MB per file.
- **Orphan File Cleanup**:
  - If a memory database save fails after file upload, the temp file is unlinked.
  - When a memory referencing a local upload is deleted, disk storage is cleaned up if no other active memory references the file.

---

## 4. Backward Compatibility

- Existing URL-based memories continue to function without modification.
- The creation modal retains an optional URL fallback.
