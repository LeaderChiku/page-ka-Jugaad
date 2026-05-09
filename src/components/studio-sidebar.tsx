
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StudioSidebar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Paper Size</p>
            <p className="text-sm text-muted-foreground">A4</p>
          </div>
          <div>
            <p className="font-medium">Orientation</p>
            <p className="text-sm text-muted-foreground">Portrait</p>
          </div>
          <div>
            <p className="font-medium">Layout</p>
            <p className="text-sm text-muted-foreground">Grid</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
