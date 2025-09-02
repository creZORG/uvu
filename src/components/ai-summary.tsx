"use client";

import { useEffect, useState } from "react";
import { generateSummary } from "@/app/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function AISummary({ contentToSummarize }: { contentToSummarize: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const result = await generateSummary(contentToSummarize);
        if (result.error) {
          setError(result.error);
        } else {
          setSummary(result.summary);
        }
      } catch (e) {
        setError("Failed to generate summary.");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [contentToSummarize]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Collapsible>
      <div className="space-y-4 text-lg">
        <p className="text-foreground">{summary}</p>
        <CollapsibleTrigger asChild>
          <Button variant="link" className="p-0 text-primary">
            Read More
            <ChevronsUpDown className="h-4 w-4 ml-2" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-muted-foreground mt-4">{contentToSummarize}</p>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
