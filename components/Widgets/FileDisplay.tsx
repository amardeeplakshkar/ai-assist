import { FileUp, X } from "lucide-react";

interface FileDisplayProps {
    fileName: string;
    onClear: () => void;
}
function FileDisplay({ fileName, onClear }: FileDisplayProps) {
    return (
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 w-fit px-3 py-1 rounded-lg group border dark:border-white/10">
            <FileUp className="w-4 h-4 dark:text-white" />
            <span className="text-sm dark:text-white">{fileName}</span>
            <button
                type="button"
                onClick={onClear}
                className="ml-1 cursor-pointer p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-3 h-3 dark:text-white" />
            </button>
        </div>
    );
}

export default FileDisplay