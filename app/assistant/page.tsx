export default function AssistantPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-slate-600">Get context-aware recommendations for your events</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <h3 className="text-sm font-medium text-slate-900">AI is temporarily unavailable</h3>
        <p className="mt-1 text-sm text-slate-500">Add your GEMINI_API_KEY to enable the assistant. All event management features remain fully functional.</p>
      </div>
    </div>
  )
}
