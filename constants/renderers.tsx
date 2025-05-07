import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Copied to clipboard!');
  }).catch(err => {
    toast.error('Failed to copy: ', err);
  });
};

export const renderers = {
  table({ node, className, children, ...props }: any) {
    return (
      <div className="my-4 w-full overflow-x-auto">
        <Table
          className='rounded overflow-hidden'
          {...props}
        >
          {children}
        </Table>
      </div>
    );
  },
  thead({ node, ...props }: any) {
    return <TableHeader {...props} />;
  },
  tbody({ node, ...props }: any) {
    return <TableBody {...props} />;
  },
  tr({ node, ...props }: any) {
    return (
      <TableRow
        {...props}
      />
    );
  },
  th({ node, ...props }: any) {
    return (
      <TableHead
        className=''
        {...props}
      />
    );
  },
  td({ node, ...props }: any) {
    return (
      <TableCell
        className=''
        {...props}
      />
    );
  },
  blockquote({ node, ...props }: any) {
    return <blockquote className="border-l-4 pl-4 italic text-muted-foreground" {...props} />;
  },

  hr({ node, ...props }: any) {
    return <Separator className="my-6" {...props} />;
  },

  strong({ node, ...props }: any) {
    return <strong className="font-semibold" {...props} />;
  },

  em({ node, ...props }: any) {
    return <em className="italic" {...props} />;
  },

  del({ node, ...props }: any) {
    return <del className="line-through text-muted-foreground" {...props} />;
  },

  h1({ node, ...props }: any) {
    return <h1 level={1} className="text-4xl font-bold my-4" {...props} />;
  },

  h2({ node, ...props }: any) {
    return <h2 level={2} className="text-3xl font-semibold my-3" {...props} />;
  },

  h3({ node, ...props }: any) {
    return <h3 level={3} className="text-2xl font-medium my-2" {...props} />;
  },

  p({ node, ...props }: any) {
    return <p className="leading-7 my-2" {...props} />;
  },

  ul({ node, ...props }: any) {
    return <ul className="list-disc ml-6 mb-4" {...props} />;
  },

  ol({ node, ...props }: any) {
    return <ol className="list-decimal ml-6 mb-4" {...props} />;
  },

  li({ node, ...props }: any) {
    return <li className="mb-1" {...props} />;
  },

  a({ node, href, ...props }: any) {
    return (
      <a target='_blank' href={href} className="text-blue-600 underline hover:opacity-80" {...props} />
    );
  },
  img({ node, src, alt, ...props }: any) {
    return <img src={src} alt={alt} className="rounded-md my-4 max-w-full" {...props} />;
  },

  span({ node, ...props }: any) {
    return <span className="text-base" {...props} />;
  },

  div({ node, ...props }: any) {
    return <div className="my-2" {...props} />;
  },

  br({ node, ...props }: any) {
    return <br {...props} />;
  },

  input({ node, ...props }: any) {
    return <input className="border px-2 py-1 rounded" disabled {...props} />;
  },

  label({ node, ...props }: any) {
    return <label className="text-sm font-medium" {...props} />;
  },

  small({ node, ...props }: any) {
    return <small className="text-xs text-muted-foreground" {...props} />;
  },

  abbr({ node, title, ...props }: any) {
    return <abbr title={title} className="underline dotted cursor-help" {...props} />;
  },

  kbd({ node, ...props }: any) {
    return <kbd className="px-1 py-0.5 border rounded bg-muted font-mono text-sm" {...props} />;
  },

  sup({ node, ...props }: any) {
    return <sup className="text-xs align-super" {...props} />;
  },

  sub({ node, ...props }: any) {
    return <sub className="text-xs align-sub" {...props} />;
  },
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const codeContent = String(children).replace(/\n$/, "");
    return !inline && match ? (
      <div className='group relative'>
        <div className='bg-[#282a36] rounded-md h-[3rem] -mb-7.5' />
        <SyntaxHighlighter
          style={dracula}
          language={match[1]}
          PreTag="div"
          className="rounded-md"
          {...props}
        >
          {codeContent}
        </SyntaxHighlighter>
        <div className="absolute top-2 right-2 transition-opacity duration-200">
          <Button
            size="sm"
            onClick={() => handleCopy(codeContent)}
            variant="secondary"
            className="flex cursor-pointer items-center gap-1 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 shadow-md"
          >
            <Copy size={16} />
            <span>Copy</span>
          </Button>
        </div>
      </div>
    ) : (
      <Badge variant={"secondary"} {...props}>
        {children}
      </Badge>
    );
  } 
};