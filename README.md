# Smart Notes

A modern, AI-powered note-taking web application built with Next.js and Supabase.
Visit here: https://smart-notes-vercel.vercel.app/

## Features

- **Note Management**
  - Create, read, update, and delete notes
  - Rich text content support
  - Real-time updates
  - Responsive grid layout with consistent card sizes

- **Category System**
  - Create custom categories with color picker
  - Preset color options available
  - Filter notes by categories
  - Default categories for new users
  - Visual category tags with automatic text contrast

- **AI Integration**
  - Automatic note summarization
  - Smart category suggestions
  - Powered by Hugging Face's AI models
  - Analysis history tracking

- **User System**
  - Secure authentication
  - User profile management
  - Email verification
  - Password reset functionality

- **Modern UI/UX**
  - Clean and responsive design
  - Tailwind CSS styling
  - Modal-based interactions
  - Loading states and error handling
  - Mobile-friendly interface

## Prerequisites

- Node.js 16.14.0 or higher
- npm 8.6.0 or higher
- A Supabase account and project
- A Hugging Face account with API access

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-notes
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_HUGGING_FACE_TOKEN=your-hugging-face-token
```

4. Set up your Supabase database tables:

   **Notes Table:**
   - `id` (uuid, primary key)
   - `title` (text, not null)
   - `content` (text, not null)
   - `created_at` (timestamp with time zone, default: now())
   - `updated_at` (timestamp with time zone, default: now())
   - `user_id` (uuid, foreign key to auth.users)
   - `categories` (text[], default: '{}')
   - `ai_summary` (text)
   - `last_analyzed` (timestamp with time zone)

   **Categories Table:**
   - `id` (uuid, primary key)
   - `name` (text, not null)
   - `color` (text, not null)
   - `user_id` (uuid, foreign key to auth.users)
   - `created_at` (timestamp with time zone, default: now())

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.io/) - Backend and authentication
- [Hugging Face](https://huggingface.co/) - AI models
- [React Colorful](https://github.com/omgovich/react-colorful) - Color picker

## Contributing

Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
