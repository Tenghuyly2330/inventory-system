import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, Boxes, Loader2, AlertCircle } from "lucide-react";

const Login = () => {
      const [email, setEmail] = useState("admin@example.com");
      const [password, setPassword] = useState("admin123");
      const [showPassword, setShowPassword] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [errorMsg, setErrorMsg] = useState("");

      const { login } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();

      const from = location.state?.from?.pathname || "/dashboard";

      const handleSubmit = async (e) => {
            e.preventDefault();
            if (!email || !password) {
                  setErrorMsg("Please enter both email and password");
                  return;
            }

            setErrorMsg("");
            setIsSubmitting(true);

            try {
                  await login(email, password);
                  navigate(from, { replace: true });
            } catch (err) {
                  setErrorMsg(err.message || "Failed to sign in");
            } finally {
                  setIsSubmitting(false);
            }
      };

      return (
            <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

                  <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                        <div className="flex justify-center">
                              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                                    <Boxes className="w-10 h-10" />
                              </div>
                        </div>
                        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-100 tracking-tight">
                              ប្រព័ន្ធគ្រប់គ្រងស្តុក
                        </h2>
                        {/* <p className="mt-2 text-center text-sm text-slate-400">
                              Sign in to your admin workspace
                        </p> */}
                  </div>

                  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl border border-slate-800/80 sm:rounded-2xl sm:px-10">
                              {errorMsg && (
                                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm">
                                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                          <span>{errorMsg}</span>
                                    </div>
                              )}

                              <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                អ៊ីមែល
                                          </label>
                                          <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                                      <Mail className="w-5 h-5" />
                                                </div>
                                                <input
                                                      type="email"
                                                      required
                                                      value={email}
                                                      onChange={(e) => setEmail(e.target.value)}
                                                      placeholder="admin@example.com"
                                                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                />
                                          </div>
                                    </div>

                                    <div>
                                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                ពាក្យសម្ងាត់ testing
                                          </label>
                                          <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                                      <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                      type={showPassword ? "text" : "password"}
                                                      required
                                                      value={password}
                                                      onChange={(e) => setPassword(e.target.value)}
                                                      placeholder="••••••••••"
                                                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                />
                                                <button
                                                      type="button"
                                                      onClick={() => setShowPassword(!showPassword)}
                                                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                          </div>
                                    </div>

                                    <div>
                                          <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                {isSubmitting ? (
                                                      <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            <span>កំពុងចូល...</span>
                                                      </>
                                                ) : (
                                                      <span>ចូល</span>
                                                )}
                                          </button>
                                    </div>
                              </form>

                              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                                    <p className="text-xs text-slate-500">
                                          សាកល្បង: <span className="text-indigo-400 font-mono">admin@example.com</span> / <span className="text-indigo-400 font-mono">admin123</span>
                                    </p>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Login;