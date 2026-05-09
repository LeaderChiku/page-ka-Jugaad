
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentProjects() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Project 1</p>
              <p className="text-sm text-muted-foreground">Created on 2023-10-27</p>
            </div>
            <p className="text-sm text-muted-foreground">12 layouts</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Project 2</p>
              <p className="text-sm text-muted-foreground">Created on 2023-10-26</p>
            </div>
            <p className="text-sm text-muted-foreground">8 layouts</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Project 3</p>
              <p className="text-sm text-muted-foreground">Created on 2023-10-25</p>
            </div>
            <p className="text-sm text-muted-foreground">15 layouts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
