# IdeaOrbit - Mind Map Creator

A modern, interactive web application for creating, editing, and visualizing mind maps. Built with Next.js, React Flow, and PostgreSQL.

## Features

- **Interactive Mind Map Creation**: Create, drag, and delete nodes with smooth animations
- **Rich Text Editing**: Inline text editing with formatting options (bold, italic, underline, font size, colors)
- **Node & Edge Styling**: Customize colors for backgrounds, borders, text, and connections
- **User Authentication**: Sign up, login, and save maps to your account
- **Save & Load**: Persist mind maps to the database
- **Export Functionality**: Export mind maps as JSON
- **Undo/Redo**: Full history support with keyboard shortcuts
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **State Management**: Zustand
- **Graph Rendering**: React Flow
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idea-orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/idea_orbit?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Mind Map

1. **Sign up or log in** to your account
2. **Add nodes** by clicking the "Add Node" button or double-clicking on the canvas
3. **Edit text** by double-clicking on any node
4. **Connect nodes** by dragging from one node's handle to another
5. **Style nodes** using the formatting tools that appear on hover
6. **Save your work** using the save button in the toolbar

### Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + S`: Save (opens save dialog)

### Node Styling

- **Text Formatting**: Bold, italic, underline, font size
- **Colors**: Background, border, and text color customization
- **Positioning**: Drag nodes to reposition them

### Saving and Loading

- **Save**: Click the save button and provide a title and optional description
- **Load**: Click the load button to see all your saved mind maps
- **Export**: Export your mind map as JSON for backup or sharing

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── mindmaps/      # Mind map CRUD operations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── mindmap/           # Mind map components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication helpers
│   ├── prisma.ts          # Database client
│   └── utils.ts           # General utilities
├── store/                 # State management
│   └── mindmap-store.ts   # Zustand store
└── types/                 # TypeScript type definitions
    └── mindmap.ts         # Mind map types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Mind Maps
- `GET /api/mindmaps` - Get user's mind maps
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/[id]` - Get specific mind map
- `PUT /api/mindmaps/[id]` - Update mind map
- `DELETE /api/mindmaps/[id]` - Delete mind map

## Database Schema

### Users
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User display name
- `password`: Hashed password
- `createdAt`, `updatedAt`: Timestamps

### Mind Maps
- `id`: Unique identifier
- `title`: Mind map title
- `description`: Optional description
- `data`: JSON structure containing nodes, edges, and viewport
- `userId`: Foreign key to user
- `createdAt`, `updatedAt`: Timestamps

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

### Adding New Features

1. **Components**: Add new components in the `src/components` directory
2. **API Routes**: Add new API endpoints in `src/app/api`
3. **State Management**: Update the Zustand store in `src/store`
4. **Types**: Add TypeScript types in `src/types`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
