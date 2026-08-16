import { useNavigate } from 'react-router-dom';
import { useAuthModalStore } from '../../store/useAuthModalStore';
import { GraduationCap, X, UserPlus, LogIn } from 'lucide-react';

export function AuthPromptModal() {
  const { isOpen, title, description, closeModal } = useAuthModalStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateAccount = () => {
    closeModal();
    navigate('/signup');
  };

  const handleSignIn = () => {
    closeModal();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Icon Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[2px] flex items-center justify-center shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        {/* Modal Header & Text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 font-heading tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCreateAccount}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Free Account</span>
          </button>

          <button
            onClick={handleSignIn}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200"
          >
            <LogIn className="h-4 w-4 text-slate-600" />
            <span>Sign In</span>
          </button>

          <button
            onClick={closeModal}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2 block mx-auto cursor-pointer"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPromptModal;
