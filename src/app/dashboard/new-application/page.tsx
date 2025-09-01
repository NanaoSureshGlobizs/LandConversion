import { NewApplicationForm } from "@/components/applications/new-application-form";

export default function NewApplicationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Application for Change of Land Use</h1>
      </div>
      <NewApplicationForm />
    </div>
  );
}
