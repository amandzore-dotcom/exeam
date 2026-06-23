import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  LogOut, 
  CloudCheck, 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from "lucide-react";

interface AuthInterfaceProps {
  onUserChanged: (user: User | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthInterface({ onUserChanged, isOpen, onClose }: AuthInterfaceProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      onUserChanged(currentUser);
    });
    return () => unsubscribe();
  }, [onUserChanged]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("请填写完整的邮箱和密码！");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("为了账号安全，密码长度必须大于 6 位！");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Sign Up
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg("🎉 注册成功！已为您自动登录并启动多端数据云同步。");
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg("🎨 登录成功！正在拉取云端知识卡片和随堂习题...");
      }
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      let transError = "认证失败，请检查账号和密码拼写！";
      if (err.code === "auth/email-already-in-use") {
        transError = "该邮箱已被注册，请直接选择登录！";
      } else if (err.code === "auth/wrong-password") {
        transError = "密码不正确，请重新输入！";
      } else if (err.code === "auth/user-not-found") {
        transError = "未找到该用户，请确认邮箱或切换至注册！";
      } else if (err.code === "auth/invalid-email") {
        transError = "请输入正确的邮箱格式！";
      }
      setErrorMsg(transError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signOut(auth);
      setSuccessMsg("已安全登出。数据现在暂时保存在您这台设备的本地浏览器中。");
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err) {
      setErrorMsg("退出失败，请刷新后再试。");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 pt-8 text-center relative">
          <div className="absolute top-3 left-3 bg-white/20 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase">
            STUDY SYNC ENGINE v2026
          </div>
          <UserIcon className="w-12 h-12 text-white bg-white/20 p-2.5 rounded-2xl mx-auto mb-3" />
          <h2 className="text-xl font-bold tracking-tight">
            {user ? "我的研路同步账号" : isSignUp ? "注册护理考研账号" : "登录同步云端数据"}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            {user ? "已开启设备云端互充，学习记录不丢失" : "开启多设备同步，随时随地在博傲课后巩固"}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {user ? (
            /* Logged In Status details */
            <div className="space-y-4 py-2 text-center">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                <span className="text-xs text-gray-400 font-bold uppercase block mb-1">当前同步邮箱</span>
                <strong className="text-gray-800 font-mono">{user.email}</strong>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>多端物理同步已就绪 (ACTIVE)</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed px-2">
                您现在添加的名词解释卡片、挖空填空自测和随课录入的仿真题，都会自动上传备份。在电脑、手机、iPad上登录同一账号均可秒级互通。
              </p>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-rose-500" /> : <LogOut className="w-4 h-4" />}
                <span>注销退出该设备</span>
              </button>
            </div>
          ) : (
            /* Login & SignUp Input Form */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">备考学子邮箱 Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱，如 active_care@boao.com"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-medium">
                <label className="block text-xs font-bold text-gray-500 uppercase">安全密码 Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="设置一个6位以上的专属口令"
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{isSignUp ? "立即极速注册并登录" : "立即安全登录"}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 underline transition"
                >
                  {isSignUp ? "已有博傲备考账号？立即登录" : "还没有账号？点我极速注册"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
