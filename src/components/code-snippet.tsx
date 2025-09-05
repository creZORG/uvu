
"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippetProps {
  language: string;
  code: string;
}

export function CodeSnippet({ language, code }: CodeSnippetProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden bg-[#2d2d2d] font-code">
      <div className="flex justify-between items-center px-4 py-2 bg-neutral-800 text-neutral-300 text-xs">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
        >
          {hasCopied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Clipboard size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-white">{code}</code>
      </pre>
    </div>
  );
}

    