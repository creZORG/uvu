
"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface MarkingRubricProps {
  score: number;
  onScoreChange: (score: number) => void;
  maxScore?: number;
}

const rubricCriteria = {
    0: "No Answer / Irrelevant",
    1: "Incorrect",
    2: "Partially Correct, Major Flaws",
    3: "Mostly Correct, Minor Flaws",
    4: "Correct Answer",
    5: "Correct & Well Explained/Coded"
};

export function MarkingRubric({ score, onScoreChange, maxScore = 5 }: MarkingRubricProps) {
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const currentScore = hoverScore ?? score;

    return (
        <div>
            <div className="flex items-center gap-2">
                {Array.from({ length: maxScore }, (_, i) => i + 1).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onScoreChange(value)}
                        onMouseEnter={() => setHoverScore(value)}
                        onMouseLeave={() => setHoverScore(null)}
                        className={cn(
                            "p-1 rounded-md transition-colors",
                            value <= currentScore ? "text-amber-500" : "text-gray-300"
                        )}
                    >
                        <Star className="h-6 w-6 fill-current" />
                    </button>
                ))}
                <span className="ml-4 font-bold text-lg w-8 text-center">{score}</span>
                <button
                    type="button"
                    onClick={() => onScoreChange(0)}
                    className="ml-4 text-xs text-muted-foreground hover:text-destructive underline"
                >
                    Clear
                </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 h-5">
              {rubricCriteria[currentScore as keyof typeof rubricCriteria] || ""}
            </p>
        </div>
    );
}

