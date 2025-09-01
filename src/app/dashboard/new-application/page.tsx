import { NewApplicationForm } from "@/components/applications/new-application-form";

export default function NewApplicationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">New Land Use Application</h1>
      </div>
      <p className="text-muted-foreground">
        Fill out the form below to submit a new application for a land use change.
      </p>
      <NewApplicationForm />
    </div>
  );
}
