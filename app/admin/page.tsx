import { AdminApprovals } from "@/components/admin-approvals";

export default function AdminPage() {
  return (
    <main className="section-shell py-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 inline-flex border-4 border-black bg-[#b7e4c7] px-4 py-2 font-black text-black shadow-[5px_5px_0_#000]">
          Admin review
        </p>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Charity approvals</h1>
        <p className="mt-3 text-lg font-semibold text-slate-900">
          Review NGO IDs and approve or reject charity access. This page auto-refreshes every few
          seconds.
        </p>
      </div>
      <AdminApprovals />
    </main>
  );
}
