import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 px-4 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Button asChild>
          <Link href="/dashboard/my-applications">
            View Pending Enquiries
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}