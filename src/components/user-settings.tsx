
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
          <div className="flex justify-between">
            <Button>Update</Button>
            <Button variant="outline">Change Password</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
