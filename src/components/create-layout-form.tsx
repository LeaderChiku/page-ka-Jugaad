
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateLayoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label htmlFor="layout-name">Layout Name</label>
            <Input id="layout-name" placeholder="My Awesome Layout" />
          </div>
          <div>
            <label htmlFor="paper-size">Paper Size</label>
            <Input id="paper-size" placeholder="A4" />
          </div>
          <div>
            <label htmlFor="orientation">Orientation</label>
            <Input id="orientation" placeholder="Portrait" />
          </div>
          <div>
            <label htmlFor="layout-type">Layout Type</label>
            <Input id="layout-type" placeholder="Grid" />
          </div>
          <Button>Create Layout</Button>
        </form>
      </CardContent>
    </Card>
  );
}
