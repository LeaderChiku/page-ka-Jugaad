
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LayoutCanvas() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canvas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Canvas Placeholder</p>
        </div>
      </CardContent>
    </Card>
  );
}
