
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SubscriptionSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          You are currently on the <strong>Free</strong> plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Manage your subscription and billing details.</p>
      </CardContent>
      <CardFooter>
        <Button>Manage Subscription</Button>
      </CardFooter>
    </Card>
  );
}
