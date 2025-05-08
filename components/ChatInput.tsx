'use client'

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import { useRef, useState } from 'react';
import FileDisplay from './Widgets/FileDisplay';
import { ChatRequestOptions } from 'ai';
import { toast } from 'react-toastify';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: {
    preventDefault?: () => void;
  }, chatRequestOptions?: ChatRequestOptions) => void;
  isGenerating?: boolean;
}


const ChatInput: React.FC<ChatInputProps> = ({ input, handleInputChange, handleSubmit, isGenerating }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      className="border-t border-border bg-background p-4 sticky bottom-0"
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
          className="absolute cursor-pointer bottom-2 right-2"
          disabled={isGenerating}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="icon"
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
      </div>
    </form>
  );
};

export default ChatInput;