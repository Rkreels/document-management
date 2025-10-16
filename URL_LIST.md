# Complete Application URL List

## Main Application Routes

### 1. Home/Landing
- **URL:** `/`
- **Component:** `Index`
- **Description:** Landing page with welcome message and navigation to dashboard

### 2. Dashboard
- **URL:** `/dashboard`
- **Component:** `Dashboard`
- **Description:** Main dashboard showing document overview, statistics, and recent activities

### 3. Document Management

#### Document Editor
- **URL:** `/editor`
- **Component:** `DocumentEditor`
- **Description:** Create new document from scratch

- **URL:** `/editor/:documentId`
- **Component:** `DocumentEditor`
- **Description:** Edit existing document by ID
- **Example:** `/editor/123456`

#### Document Preview
- **URL:** `/preview/:documentId`
- **Component:** `DocumentPreview`
- **Description:** Preview document before sending
- **Example:** `/preview/123456`

#### Document Router
- **URL:** `/document/:documentId`
- **Component:** `DocumentRouter`
- **Description:** Generic document route handler
- **Example:** `/document/123456`

- **URL:** `/document/:documentId/:signerId`
- **Component:** `DocumentRouter`
- **Description:** Document route for specific signer
- **Example:** `/document/123456/signer789`

### 4. Signing

#### Signing Page
- **URL:** `/signing/:documentId/:signerId`
- **Component:** `SigningPage`
- **Description:** Document signing interface for signers
- **Example:** `/signing/123456/signer789`

### 5. Templates

#### Templates List
- **URL:** `/templates`
- **Component:** `Templates`
- **Description:** Browse and manage document templates

#### Template Editor
- **URL:** `/template-editor`
- **Component:** `TemplateEditor`
- **Description:** Create new template from scratch

- **URL:** `/template-editor/:templateId`
- **Component:** `TemplateEditor`
- **Description:** Edit existing template by ID
- **Example:** `/template-editor/template123`

#### Template Preview
- **URL:** `/template-preview/:templateId`
- **Component:** `TemplatePreview`
- **Description:** Preview template before using
- **Example:** `/template-preview/template123`

### 6. Settings & Configuration
- **URL:** `/settings`
- **Component:** `Settings`
- **Description:** Application settings including voice assistant, training, data management, and system preferences

### 7. Voice Training
- **URL:** `/voice-training`
- **Component:** `VoiceTrainingPage`
- **Description:** Voice guidance training center with interactive modules

### 8. Error Pages
- **URL:** `/404`
- **Component:** `NotFound`
- **Description:** 404 error page for undefined routes

- **URL:** `*` (any undefined route)
- **Description:** Redirects to `/404`

---

## Route Parameters

### Dynamic Parameters Used:
- `:documentId` - Unique identifier for documents
- `:templateId` - Unique identifier for templates
- `:signerId` - Unique identifier for signers

---

## Total Routes: 14 main routes + parameter variations

### Quick Reference:
1. `/` - Home
2. `/dashboard` - Dashboard
3. `/editor` - New Document
4. `/editor/:documentId` - Edit Document
5. `/preview/:documentId` - Preview Document
6. `/document/:documentId` - View Document
7. `/document/:documentId/:signerId` - Signer View
8. `/signing/:documentId/:signerId` - Signing Interface
9. `/templates` - Templates List
10. `/template-editor` - New Template
11. `/template-editor/:templateId` - Edit Template
12. `/template-preview/:templateId` - Preview Template
13. `/settings` - Settings
14. `/voice-training` - Voice Training
15. `/404` - Not Found

---

## Application Features by Route

### Document Management Features:
- Create, edit, preview documents
- Add fields (text, signature, date, checkbox, etc.)
- Manage signers
- Send for signature
- Track document status

### Template Features:
- Create reusable templates
- Edit and manage templates
- Preview templates
- Create documents from templates

### Voice Features:
- Voice assistant (available on all pages)
- Voice training modules
- Contextual voice guidance
- Voice settings customization

### Settings Features:
- Voice assistant configuration
- Training mode preferences
- Data management
- System information
