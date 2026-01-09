import ClientRequirementsForm from "@/components/ClientRequirementsForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        <ClientRequirementsForm />
      </div>
    </main>
  );
}

