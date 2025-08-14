# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example:
# REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
# REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Additional configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_APP_NAME=Sarathi CSR
```

## How to Get Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy the following values:**
   - **Project URL**: Use the "Project URL" field
   - **Anon Key**: Use the "anon public" key

## Important Notes

- **Never commit your `.env` file** to version control
- **Never hardcode credentials** in your source code
- **Use environment variables** for all sensitive configuration
- **The app will throw an error** if environment variables are missing

## Testing Environment Variables

After setting up your `.env` file, restart your development server:

```bash
npm start
```

The app should now connect to your Supabase instance without any hardcoded values. 