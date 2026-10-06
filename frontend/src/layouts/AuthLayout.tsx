import { ReactNode } from "react";

interface Props { children: ReactNode }

const AuthLayout = ({ children }: Props) => (
  <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-600 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">VertexLearn AI</h1>
        <p className="text-gray-500 mt-1 text-sm">AI-powered Learning Platform</p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
