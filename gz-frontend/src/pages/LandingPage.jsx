import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">GZ MOVIE</h1>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
            Sign In
          </Link>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">Unlimited movies, TV shows, and more</h2>
        <p className="text-xl mb-8">Watch anywhere. Cancel anytime.</p>
        <p className="text-lg mb-4">Ready to watch? Create your account now.</p>
        <Link 
          to="/signup" 
          className="inline-block px-8 py-4 bg-red-600 text-xl rounded hover:bg-red-700"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
};

export default LandingPage;
