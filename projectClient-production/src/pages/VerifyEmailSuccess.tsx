import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function VerifyEmailSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
        <p className="text-gray-600 mb-6">
          Your email address has been successfully verified. Your account is now active.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Continue to Login
        </Link>
      </div>
    </div>
  );
}

