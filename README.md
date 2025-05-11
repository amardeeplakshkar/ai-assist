# IRIS - Intelligent Response and Interactive System

IRIS is a sophisticated AI chat application built with Next.js, featuring real-time conversation capabilities, file attachments, text-to-speech, and various interactive widgets.

## Features

- 💬 Real-time chat interface with AI responses
- 🎯 Markdown support with syntax highlighting
- 🔊 Text-to-speech capabilities
- 📎 File attachment support
- 🌤️ Weather widget integration
- 🖼️ Image generation and display
- 🔍 PDF viewer support
- 📱 Responsive design
- 🎨 Dark/Light mode support
- 🔐 Authentication with Clerk
- 🔄 Real-time data sync with Supabase
- 🎵 Text-to-Speech with Edge TTS
- 🔍 Web search capabilities
- 📹 YouTube video transcription
- 🖼️ Dynamic image preview with hover effects
- 📊 Chat history management
- 🌐 Multi-language support
- 🎨 Custom UI components with shadcn/ui
- 🎭 Theme customization

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **Markdown**: React Markdown with KaTeX support
- **Icons**: Lucide React
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Code Highlighting**: React Syntax Highlighter
- **AI Integration**: OpenAI API
- **Speech Synthesis**: Edge TTS
- **Real-time Data**: Supabase Realtime

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```env
# OpenAI Configuration
OPENAPI_API_KEY=your_api_key
OPENAI_API_BASE_URL=your_base_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── app/
│   ├── (auth)/       # Authentication routes
│   ├── (routes)/     # Application routes
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   └── layout.tsx    # Root layout
├── components/
│   ├── auth/         # Authentication components
│   ├── providers/    # Context providers
│   ├── ui/           # Reusable UI components
│   └── Widgets/      # Feature-specific widgets
├── constants/        # Configuration and constants
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── public/          # Static assets
```

## Features in Detail

### Authentication
- Secure sign-in/sign-up with Clerk
- Social authentication providers
- Protected routes
- User profile management

### Chat Interface
- Real-time message streaming
- Markdown rendering with KaTeX support
- Code syntax highlighting
- Copy to clipboard functionality
- Auto-scrolling messages
- Message attachments support
- Voice output for messages

### AI Features
- OpenAI integration
- Image generation
- Weather information
- Web search capabilities
- YouTube video transcription
- Context-aware responses

### Data Management
- Real-time sync with Supabase
- Chat history persistence
- User preferences storage
- File attachments handling

### UI/UX
- Responsive design
- Dark/Light theme
- Custom animations
- Loading states
- Error handling
- Toast notifications
- Hover previews
- Keyboard shortcuts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Clerk](https://clerk.dev/)
- [Supabase](https://supabase.io/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Framer Motion](https://www.framer.com/motion/)
- [Edge TTS](https://github.com/rany2/edge-tts)
- [OpenAI](https://openai.com/)