import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WaitlistThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-green-800"></div>
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1590283603385-a6e2a5b9db6f?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-md w-full p-8 bg-slate-900 text-white rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">You're on the List!</h2>
        <p className="text-gray-300 mb-6">
          Thanks for joining the EDGR waitlist. We'll keep you posted as we get closer to launch!
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-teal-500 to-teal-700 w-full"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default WaitlistThankYou;
