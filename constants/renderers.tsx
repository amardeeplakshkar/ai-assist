import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Copy } from "lucide-react";
import Link from "next/link";
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

  em({ node, ...props }: any) {
    return <em className="italic" {...props} />;
  },

  del({ node, ...props }: any) {
    return <del className="line-through text-muted-foreground" {...props} />;
  },

  h1: ({ node, children, ...props }: any) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }: any) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }: any) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }: any) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }: any) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }: any) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },

  pre: ({ children }: any) => <>{children}</>,
  ol: ({ node, children, ...props }: any) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }: any) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }: any) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }:any) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }:any) => {
    return (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
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
      <Badge className="whitespace-pre" variant={"secondary"} {...props}>
        {children}
      </Badge>
    );
  } 
};