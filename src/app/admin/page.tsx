
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Submission = {
  id: string;
  userEmail: string;
  submittedAt: {
    toDate: () => Date;
  };
  status: "submitted" | "disqualified" | "passed" | "failed";
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "examSubmissions"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const subs: Submission[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "secondary";
      case "disqualified":
        return "destructive";
      case "passed":
        return "default";
      case "failed":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-4xl">Admin Dashboard</CardTitle>
              <CardDescription>Review and mark submitted final exams.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Email</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id} onClick={() => router.push(`/admin/submissions/${sub.id}`)} className="cursor-pointer">
                      <TableCell className="font-medium">{sub.userEmail}</TableCell>
                      <TableCell>{sub.submittedAt ? format(sub.submittedAt.toDate(), "PPP p") : "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {submissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
                )}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
