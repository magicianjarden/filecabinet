# Environment Variables Setup for FileCabinet Drive

## Required Environment Variables

To fix the "supabaseKey is required" error, you need to set up the following environment variables in your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get These Values

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up

### 2. Find Your Project URL and Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Create .env.local File
Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Restart Your Development Server
After adding the environment variables:

```bash
npm run dev
```

## Database Setup

After setting up the environment variables, run the database migration:

```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the SQL migration in your Supabase dashboard
# Copy the contents of supabase/migrations/20241201000000_create_drive_tables.sql
```

## Testing the Setup

1. Visit `/auth/signup` to create an account
2. Check your email for verification
3. Sign in at `/auth/signin`
4. Access your drive at `/drive`

## Troubleshooting

### "supabaseKey is required" Error
- Make sure all environment variables are set correctly
- Restart your development server after adding environment variables
- Check that the `.env.local` file is in the project root

### Database Connection Issues
- Verify your Supabase project is active
- Check that the migration has been applied
- Ensure RLS policies are in place

### Authentication Issues
- Make sure Supabase Auth is enabled in your project
- Check that email confirmations are configured properly
- Verify redirect URLs in Supabase Auth settings 