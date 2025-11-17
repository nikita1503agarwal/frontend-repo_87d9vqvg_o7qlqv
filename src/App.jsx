import PaperChat from './components/PaperChat'

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(255,255,255,1),rgba(240,245,250,1)),linear-gradient(180deg,rgba(245,248,255,1),rgba(235,240,250,1))] text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Expressive 3D Paper Chat</h1>
          <p className="text-gray-500 mt-2">Smooth, playful, and alive — try sending a message.</p>
        </div>
        <PaperChat />
      </div>
    </div>
  )
}
