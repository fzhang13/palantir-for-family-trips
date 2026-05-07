export function SupabaseRequired() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
      <div className="max-w-md p-8 border border-[#30363D] bg-[#0D1117] rounded">
        <h1 className="text-xl font-semibold text-[#E6EDF3] mb-4">
          Supabase Configuration Required
        </h1>
        <p className="text-[#8B949E] mb-4">
          This application requires Supabase to be configured.
        </p>
        <div className="space-y-2 text-sm text-[#8B949E]">
          <p>Add these environment variables to your <code>.env</code> file:</p>
          <pre className="bg-[#0A0C10] p-3 rounded font-mono text-xs">
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
          </pre>
        </div>
      </div>
    </div>
  )
}
