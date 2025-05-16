import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { defaultFiles } from '@/app/api/code2/schema';
import { SandpackProvider, SandpackFile, SandpackLayout, SandpackFileExplorer, SandpackCodeEditor, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { Dialog, DialogTitle, DialogTrigger, DialogContent } from '../ui/dialog';
import { Expand, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { dracula } from '@codesandbox/sandpack-themes';

interface NavbarProps {
  setActiveTab: (tab: string) => void;
}
const Navbar: React.FC<NavbarProps> = ({ setActiveTab }) => {
  const { sandpack } = useSandpack();

  const handleRunCode = () => {
    sandpack.runSandpack()
    setActiveTab('code');
    setTimeout(() => { setActiveTab('preview') }, 500);
  }

  
  return (
    <nav className='w-full p-1 flex justify-between items-center'>
      <div className='flex justify-center'>
        <TabsList className="text-xs">
          <TabsTrigger className='text-xs' value="code">Code</TabsTrigger>
          <TabsTrigger onClick={() => handleRunCode()} className='text-xs' value="preview">Preview</TabsTrigger>
        </TabsList>
      </div>
      <div className='flex justify-center items-center gap-2'>
        <Dialog>
          <DialogTitle className='hidden'></DialogTitle>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className='flex bg-accent/50 dark:text-accent-foreground items-center gap-2 p-2 text-xs justify-center'
            >
              <Expand />
            </Button>
          </DialogTrigger>
          <DialogContent className='!p-0 !m-0 !h-[100dvh] !w-[100dvw] !max-w-none !max-h-none !overflow-hidden'>
            <SandpackPreview
              className='!h-dvh !w-dvw !rounded-none'
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showOpenNewtab={false}
              showRefreshButton={false}
              showRestartButton={false}
              showSandpackErrorOverlay={false}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRunCode()}
          className="flex bg-accent/50 dark:text-accent-foreground gap-1 items-center p-2 text-xs justify-center"
        >
          <Play size={16} />
          <span className='sm:block hidden'>
            Run
          </span>
        </Button>
      </div>
    </nav>
  )
}

interface CodeComponentProps {
  isLoading: boolean,
  activeFile: string | null,
  files: Record<string, { code: string }>;
}

const CodeComponent = ({ isLoading, activeFile, files }: CodeComponentProps) => {
  const [activeTab, setActiveTab] = useState("code");

  return (
    <Tabs
      defaultValue='code'
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <SandpackProvider
        template="react"
        theme={dracula}
        customSetup={{
          dependencies: {
            react: 'latest',
            'react-dom': 'latest',
            'react-scripts': 'latest',
            tailwindcss: 'latest',
            'lucide-react': 'latest',
          },
        }}
        files={{
          ...Object.entries(defaultFiles).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? value : value.file.contents;
            return acc;
          }, {} as Record<string, string | SandpackFile>),
          ...(isLoading
            ? {}
            : Object.entries(files).reduce((acc, [key, value]) => {
              acc[key] = typeof value === 'string' ? value : value.code;
              return acc;
            }, {} as Record<string, string | SandpackFile>))
        }}
        options={{
          visibleFiles: Object.keys(files),
          activeFile: activeFile ? activeFile : '/src/index.js',
          recompileMode: 'immediate',
          recompileDelay: 300,
          externalResources: ['https://cdn.tailwindcss.com'],
        }}
      >
        <Navbar setActiveTab={setActiveTab} />
        <SandpackLayout className="h-full">
          <TabsContent value='code' className="h-full">
            <div className='grid grid-cols-4 h-full'>
              <SandpackFileExplorer className="col-span-1 overflow-hidden h-[87.5dvh]" />
              <SandpackCodeEditor className="col-span-3 overflow-hidden h-[87.5dvh]" />
            </div>
          </TabsContent>
          <TabsContent value='preview' className="h-full">
            <SandpackPreview
              className="overflow-hidden h-[87.5dvh]"
              showNavigator
              showOpenInCodeSandbox={false}
              showOpenNewtab
              showSandpackErrorOverlay
            />
          </TabsContent>
        </SandpackLayout>
      </SandpackProvider>
    </Tabs>
  )
}

export default CodeComponent