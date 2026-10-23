export default function VendorsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Vendors</h1>
        <p className="mt-1 text-sm text-slate-600">User-managed vendor directory</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <h3 className="text-sm font-medium text-slate-900">No records found</h3>
        <p className="mt-1 text-sm text-slate-500">Vendors are added per event. This is a user-managed directory, not a live marketplace.</p>
      </div>
    </div>
  )
}
