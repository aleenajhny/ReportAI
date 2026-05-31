import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{project.domain}</p>
          </div>
          <Badge>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Updated recently
          </span>
          <Button asChild size="sm">
            <Link href={`/projects/${project.id}`} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Open
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
