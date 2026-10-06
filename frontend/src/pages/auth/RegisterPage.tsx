import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", role: "student",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create account</h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={form.firstName} onChange={set("firstName")} required />
          <Input label="Last name"  value={form.lastName}  onChange={set("lastName")}  required />
        </div>
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
        <Input label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} required minLength={8} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">I am a...</label>
          <select
            value={form.role}
            onChange={set("role")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
