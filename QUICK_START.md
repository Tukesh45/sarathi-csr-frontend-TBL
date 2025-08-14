# Quick Start Guide

## Get the App Running in 5 Minutes

### Step 1: Create Environment File
Create a `.env` file in your project root:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 2: Get Your Supabase Credentials
1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings → API
3. Copy the "Project URL" and "anon public" key
4. Paste them in your `.env` file

### Step 3: Set Up Database
1. Go to your Supabase project SQL editor
2. Run the `setup_database.sql` script
3. Run the `fix_ngo_record.sql` script (if you have existing users)

### Step 4: Start the App
```bash
npm start
```

The app should now load without errors!

## What You'll See

- **If environment variables are missing**: A helpful error screen with setup instructions
- **If everything is configured**: The app will load normally

## Next Steps

1. **Create an admin user**:
   - Sign up through the app
   - Update the user's role in Supabase SQL editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. **Add your data**:
   - Use the admin interface to add clients, NGOs, and projects
   - Or use the SQL scripts in the setup guide

3. **Test the flow**:
   - Create clients and NGOs
   - Assign NGOs to clients
   - Create projects and assign to NGOs
   - Test real-time updates

## Troubleshooting

### App Won't Start
- Check that your `.env` file exists and has the correct values
- Restart your development server after adding environment variables

### Database Errors
- Make sure you've run the database setup scripts
- Check that your Supabase project is active

### Real-time Not Working
- Enable real-time in your Supabase dashboard (Database → Replication)

## Need Help?

Check the full setup guide in `SETUP_GUIDE.md` for detailed instructions. 