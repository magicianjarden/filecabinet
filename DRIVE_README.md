# FileCabinet Drive MVP

A secure cloud storage solution with end-to-end encryption, built on top of the existing FileCabinet platform.

## Features

### 🔐 Authentication
- User registration and login with Supabase Auth
- Email verification
- Password reset functionality
- Secure session management

### 🛡️ Security
- End-to-end encryption for all files
- AES-GCM encryption with unique keys per file
- Row Level Security (RLS) policies
- Encrypted storage in Supabase

### 📁 File Management
- Upload files up to 10GB
- File organization with folders
- File metadata tracking
- Storage usage monitoring
- File sharing capabilities

### 🎨 User Interface
- Modern, responsive design
- Drag-and-drop file upload
- File type icons and previews
- Storage usage display
- Breadcrumb navigation

## Database Schema

### Tables
- `drive_users` - User profiles and storage limits
- `drive_folders` - Folder organization
- `drive_files` - File metadata and encryption keys
- `drive_shares` - File sharing functionality

### Storage Buckets
- `drive-files` - Encrypted file storage

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration
Run the migration to create the drive tables:

```bash
supabase db push
```

### 3. Storage Bucket
The migration will automatically create the `drive-files` bucket with proper RLS policies.

### 4. Authentication Setup
Ensure Supabase Auth is enabled in your project settings.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### File Management
- `GET /api/drive/files` - List user files
- `POST /api/drive/upload` - Upload encrypted file
- `GET /api/drive/files/[id]` - Download file
- `DELETE /api/drive/files/[id]` - Delete file

### Sharing
- `POST /api/drive/share` - Create share link
- `GET /api/drive/share/[token]` - Access shared file

## Security Features

### Encryption
- Each file is encrypted with a unique AES-GCM key
- Encryption keys are stored encrypted in the database
- Files are encrypted before upload to storage

### Access Control
- Row Level Security ensures users can only access their own files
- Storage policies prevent unauthorized access
- Session-based authentication

### Storage Limits
- Default 10GB storage limit per user
- Automatic storage usage tracking
- Upload size validation

## Usage

### For Users
1. Sign up at `/auth/signup`
2. Verify your email
3. Sign in at `/auth/signin`
4. Access your drive at `/drive`
5. Upload and manage your files

### For Developers
The drive functionality is built with:
- Next.js 14 with App Router
- Supabase for backend and authentication
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons

## Future Enhancements

- [ ] Folder creation and management
- [ ] File preview and editing
- [ ] Collaborative sharing
- [ ] Version control
- [ ] Mobile app
- [ ] Desktop sync client
- [ ] Advanced search and filtering
- [ ] File conversion integration

## Contributing

This is an MVP implementation. Future improvements should focus on:
1. Enhanced security features
2. Better user experience
3. Performance optimization
4. Additional file management features

## License

MIT License - see main project license 