'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import SignUpModal from '@/app/components/auth/SignUpModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Start() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInView, setIsSignInView] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [debouncedUsername] = useDebounce(formData.username, 500);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername) {
        setIsUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const userDoc = await getDoc(doc(db, 'usernames', debouncedUsername.toLowerCase()));
        setIsUsernameAvailable(!userDoc.exists());
      } catch (error) {
        console.error('Error checking username:', error);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.username || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!isUsernameAvailable) {
        toast.error('Username is already taken');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const batch = writeBatch(db);

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username.toLowerCase(),
        mobile: formData.mobile,
        email: formData.email.toLowerCase(),
        createdAt: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', userCredential.user.uid);
      batch.set(userRef, userData);

      const usernameRef = doc(db, 'usernames', formData.username.toLowerCase());
      batch.set(usernameRef, {
        uid: userCredential.user.uid
      });

      await batch.commit();

      toast.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email format');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let email = signInData.identifier;

      // If the identifier is not an email, try to find the user by username
      if (!email.includes('@')) {
        try {
          const usernameRef = doc(db, 'usernames', signInData.identifier.toLowerCase());
          const usernameDoc = await getDoc(usernameRef);
          
          if (!usernameDoc.exists()) {
            toast.error('Username not found');
            setIsLoading(false);
            return;
          }

          const uid = usernameDoc.data().uid;
          const userRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            toast.error('User account not found');
            setIsLoading(false);
            return;
          }

          email = userDoc.data().email;
        } catch (error) {
          console.error('Error looking up username:', error);
          toast.error('Error processing request');
          setIsLoading(false);
          return;
        }
      }

      await signInWithEmailAndPassword(auth, email, signInData.password);
      toast.success('Successfully signed in!');
      router.push('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          toast.error('Invalid username/email or password');
          break;
        case 'auth/user-disabled':
          toast.error('This account has been disabled');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your connection');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email format');
          break;
        default:
          toast.error('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <Image
        src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/6807211a437290ad5ac27b10.png"
        alt="Background"
        fill
        priority
        quality={100}
        className="object-cover fixed inset-0"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <main className="relative min-h-screen flex items-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-24 sm:py-32">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
                {isSignInView ? 'Welcome Back' : 'Personalize Your Session'}
              </h1>
              <p className="text-xl sm:text-2xl text-white/90">
                {isSignInView ? 'Sign in to continue your journey' : 'Your journey to being truly heard begins here'}
              </p>
            </div>

            {/* Main Content Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-2xl">
              {isSignInView ? (
                // Sign In Form
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username or Email</label>
                    <input
                      type="text"
                      value={signInData.identifier}
                      onChange={(e) => setSignInData({...signInData, identifier: e.target.value.trim()})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#004AAA] text-white py-3 px-4 rounded-md hover:bg-[#004AAA]/90 transition-colors disabled:opacity-50 font-medium text-lg"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <p className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignInView(false)}
                      className="text-[#004AAA] hover:text-[#004AAA]/80 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              ) : (
                // Sign Up Form
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value.trim()})}
                        className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                          isUsernameAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                          isUsernameAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                          'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formData.username && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingUsername ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                          ) : isUsernameAvailable ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isUsernameAvailable === false ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {formData.username && !isCheckingUsername && (
                      <p className={`mt-1 text-sm ${
                        isUsernameAvailable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isUsernameAvailable ? 'Username is available' : 'Username is taken'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value.trim()})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value.trim()})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isCheckingUsername || isUsernameAvailable === false}
                    className="w-full bg-[#004AAA] text-white py-3 px-4 rounded-md hover:bg-[#004AAA]/90 transition-colors disabled:opacity-50 font-medium text-lg"
                  >
                    {isLoading ? 'Creating account...' : 'Start My 7 Minute Gift'}
                  </button>

                  <p className="text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignInView(true)}
                      className="text-[#004AAA] hover:text-[#004AAA]/80 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
      />
    </div>
  );
}