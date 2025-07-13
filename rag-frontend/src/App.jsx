import IngestForm from './components/IngestForm';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Document Intelligence Assistant</h1>
          <p className="mt-2 text-gray-600">Ask questions about your uploaded documents</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IngestForm />
          <ChatInterface />
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          Powered by GenKit, Astra DB, and Google Gemini
        </footer>
      </div>
    </div>
  );
}

export default App;