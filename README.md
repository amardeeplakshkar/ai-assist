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

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Markdown**: React Markdown with KaTeX support
- **Icons**: Lucide React
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Code Highlighting**: React Syntax Highlighter

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
OPENAPI_API_KEY=your_api_key
OPENAI_API_BASE_URL=your_base_url
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
│   ├── api/         # API routes
│   ├── globals.css  # Global styles
│   └── page.tsx     # Main chat interface
├── components/
│   ├── ui/          # Reusable UI components
│   └── Widgets/     # Feature-specific widgets
├── constants/       # Configuration and constants
├── lib/            # Utility functions
└── public/         # Static assets
```

## Features in Detail

### Chat Interface
- Real-time message streaming
- Markdown rendering with KaTeX support
- Code syntax highlighting
- Copy to clipboard functionality
- Auto-scrolling messages
- Message attachments support

### Widgets
- Weather display
- Image generation and viewing
- PDF document viewer
- File upload interface

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA labels and roles
- Focus management

### Performance
- Optimized image loading
- Code splitting
- Efficient re-renders
- Responsive design

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
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Framer Motion](https://www.framer.com/motion/)