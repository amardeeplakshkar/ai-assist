'use client'

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Command, Paperclip, Send, TextQuote, Type } from 'lucide-react';
import { useRef, useState } from 'react';
import FileDisplay from './Widgets/FileDisplay';
import { ChatRequestOptions } from 'ai';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CommandData } from '@/constants';
import { usePathname } from 'next/navigation';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: {
    preventDefault?: () => void;
  }, chatRequestOptions?: ChatRequestOptions) => void;
  isGenerating?: boolean;
  setInput?: React.Dispatch<React.SetStateAction<string>>
}


const ChatInput: React.FC<ChatInputProps> = ({ input, handleInputChange, handleSubmit, isGenerating, setInput }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname()
  return (
    <form
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        if (!input || input === null) {
          toast.error("Please Enter Prompt First");
          return;
        }
        handleSubmit(event, {
          experimental_attachments: files,
        });
        setFiles(undefined)
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }}
      className={`mx-auto border-border bg-background p-4 sticky bottom-0 ${pathname === '/' ? "max-w-xl w-full" : 'w-full border-t'}`}
    >
      {fileName && <FileDisplay fileName={fileName} onClear={() => setFileName(null)} />}
      <div className="relative flex items-end">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={isGenerating ? "Generating response..." : "Type your message here..."}
          className={`pr-16 resize-none ${fileName ? "min-h-[80px]" : "min-h-[100px]"}`}
          disabled={isGenerating}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              handleSubmit(event, {
                experimental_attachments: files,
              });

              setFiles(undefined)
              setFileName(null);

              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          variant={"outline"}
          className="absolute cursor-pointer bottom-2 right-2"
          disabled={isGenerating}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="icon"
          variant={"outline"}
          className="absolute cursor-pointer bottom-2 left-2"
          disabled={isGenerating}
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach</span>
        </Button>
        <input
          type="file"
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              setFiles(event.target.files);
              setFileName(event.target.files[0].name);
            }
          }}
          hidden
          multiple
          ref={fileInputRef}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant={"outline"}
              data-command-button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={cn(
                "absolute transition-colors group cursor-pointer bottom-2 left-12.5",
              )}
            >
              <Command className="w-4 h-4" />
              <span
                className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {CommandData.map((data, i) =>
              <DropdownMenuItem className='cursor-pointer' key={i} onClick={() => setInput?.(data.command)}>
                <div
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background"
                  aria-hidden="true"
                >
                  <data.Icon size={16} strokeWidth={2} className={`${data.iconColor}`} />
                </div>
                <div>
                  <div className="text-sm font-medium">{data.label}</div>
                  <div className="text-xs text-muted-foreground">{data.description}</div>
                </div>
              </DropdownMenuItem>
            )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </form>
  );
};

export default ChatInput;