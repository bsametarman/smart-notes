# Smart Notes

A modern note-taking web application built with Next.js and Supabase.

## Features

- Create, read, and delete notes
- Real-time updates
- Modern and responsive UI
- Secure data storage with Supabase

## Prerequisites

- Node.js 16.14.0 or higher
- npm 8.6.0 or higher
- A Supabase account and project

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

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up your Supabase database:
   - Create a new table called `notes` with the following schema:
     - `id` (uuid, primary key)
     - `title` (text, not null)
     - `content` (text, not null)
     - `created_at` (timestamp with time zone, default: now())
     - `updated_at` (timestamp with time zone, default: now())
     - `user_id` (uuid, foreign key to auth.users)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)

## Contributing

Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
