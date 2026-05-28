"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import {
  changePassword,
  clearAuthSession,
  fetchRealMe,
  getGithubLoginUrl,
  loginAuth,
  registerAuth,
  resetPassword,
  saveAuthUser,
  sendEmailCode,
} from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import { getLocaleFromPathname, localeDisplayName, locales, stripLocaleFromPath, withLocale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  mode: "login" | "register" | "forgot-password" | "change-password";
};

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      helpCenter: "Help Center",
      loginTab: "Log in",
      registerTab: "Register",
      email: "Email",
      password: "Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      emailCode: "Email Code",
      rememberMe: "Keep me signed in for 30 days",
      forgotPassword: "Forgot password?",
      termsPrefix: "I have read and agree to the",
      terms: "Terms",
      privacy: "Privacy Policy",
      loginTitle: "Welcome Back",
      loginDescription: "Continue managing your saved Skills, tutorials, and submission records.",
      registerTitle: "Create Account",
      registerDescription: "Join Skillnetic and start collecting, learning, and publishing your Skills.",
      forgotTitle: "Forgot Password",
      forgotDescription: "Reset your account password through email verification.",
      changeTitle: "Change Password",
      changeDescription: "Update your password and improve account security.",
      loginSubmit: "Email Log In",
      registerSubmit: "Register by Email",
      forgotSubmit: "Reset Password",
      changeSubmit: "Save New Password",
      githubLogin: "GitHub Log In",
      githubRegister: "GitHub Register",
      sendCode: "Send Code",
      resendIn: "Resend in {seconds}s",
      backToLogin: "Back to Log In",
      cancel: "Cancel",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createNow: "Register now",
      loginNow: "Log in now",
      emailPlaceholder: "Enter your email address",
      passwordPlaceholder: "Enter your password",
      emailCodePlaceholder: "Enter the 6-digit email code",
      currentPasswordPlaceholder: "Enter your current password",
      newPasswordPlaceholder: "Enter your new password",
      confirmPasswordPlaceholder: "Enter your password again",
      resetHint: "Email verification protects your account. Codes stay valid for 10 minutes.",
      debugCode: "Local debug code: {code}",
      breadcrumbSettings: "Account Settings",
      breadcrumbSecurity: "Security Center",
      strengthWeak: "Weak",
      strengthMedium: "Medium",
      strengthStrong: "Strong",
      forgotSuccess: "Password reset complete. Please log in with the new password.",
      changeSuccess: "Password changed. Please log in again.",
      requestFailed: "Request failed",
      githubPending: "GitHub OAuth is not connected yet.",
      authChecking: "Checking your account status...",
      mustLogin: "Please log in first.",
      validation: {
        email: "Please enter a valid email.",
        password: "Password must be 8-80 characters and include letters and numbers.",
        emailCode: "Email code must be 6 digits.",
        confirmPassword: "The two passwords do not match.",
        terms: "Please agree to the terms first.",
        currentPassword: "Please enter your current password.",
      },
      previewTitle: {
        login: "Continue Your Skillnetic Journey",
        register: "What Can You Do After Registering?",
        forgot: "Account Security and Recovery",
        change: "Security Center",
      },
      previewSubtitle: {
        login: "Learning, creation, and submissions all stay on track after you sign in.",
        register: "Collect great Skills, learn tutorials, publish work, and join the community.",
        forgot: "Recover access quickly and continue learning and creating on Skillnetic.",
        change: "Protect your Skillnetic account and submitted work.",
      },
      footerLinks: ["Privacy", "Terms", "User Agreement"],
      progressEmail: "Verify Email",
      progressReset: "Reset Password",
      loginCards: ["My Favorites", "Submission Records", "Review Notifications"],
      continueCards: ["Favorites", "Learning Progress", "Submission Records"],
      securityTips: [
        "Use a strong password with letters, numbers, and symbols.",
        "Do not share the email code with anyone, including AI assistants.",
      ],
      securityRecommendations: [
        "Change your password regularly, ideally every 3 months.",
        "Avoid reusing the same password across different websites.",
        "Enable stronger verification methods when available.",
      ],
      passwordRules: [
        "At least 8 characters",
        "Include letters and numbers",
        "A mix of uppercase, lowercase, and symbols is recommended",
      ],
      recentSecurityOps: ["Changed password 2 hours ago", "Managed login devices 3 days ago", "GitHub linked 12 days ago"],
      loginMethods: ["Email login", "GitHub later"],
      show: "Show",
      hide: "Hide",
      processing: "Processing...",
      codeSent: "Verification code sent.",
      accountStatus: "Account Status",
      emailVerified: "Email Verified",
      githubLinked: "GitHub Linked",
      loginMethodsTitle: "Login Methods",
      recentSecurityTitle: "Recent Security Actions",
      securityTipsTitle: "Security Tips",
      continueTitle: "Continue After Recovery",
      recommendationsTitle: "Security Suggestions",
      active: "Active",
      later: "Later",
      waiting: "Pending",
      ok: "OK",
    };
  }

  return {
    helpCenter: "帮助中心",
    loginTab: "登录",
    registerTab: "注册",
    email: "邮箱",
    password: "密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认密码",
    emailCode: "邮箱验证码",
    rememberMe: "30天免登录",
    forgotPassword: "忘记密码？",
    termsPrefix: "我已阅读并同意",
    terms: "用户协议",
    privacy: "隐私政策",
    loginTitle: "欢迎回来",
    loginDescription: "登录后继续管理你的收藏、教程与提交记录",
    registerTitle: "创建账号",
    registerDescription: "加入 Skillnetic，开始收藏、学习和提交你的 Skill",
    forgotTitle: "忘记密码",
    forgotDescription: "通过邮箱验证重置你的账号密码",
    changeTitle: "修改密码",
    changeDescription: "更新你的账号密码，提升账号安全性",
    loginSubmit: "邮箱登录",
    registerSubmit: "邮箱注册",
    forgotSubmit: "重置密码",
    changeSubmit: "保存新密码",
    githubLogin: "GitHub 登录",
    githubRegister: "GitHub 注册",
    sendCode: "发送验证码",
    resendIn: "{seconds}s 后重发",
    backToLogin: "返回登录",
    cancel: "取消",
    noAccount: "还没有账号？",
    hasAccount: "已有账号？",
    createNow: "立即注册",
    loginNow: "立即登录",
    emailPlaceholder: "请输入邮箱地址",
    passwordPlaceholder: "请输入密码",
    emailCodePlaceholder: "请输入 6 位邮箱验证码",
    currentPasswordPlaceholder: "请输入当前密码",
    newPasswordPlaceholder: "请输入新密码",
    confirmPasswordPlaceholder: "请再次输入密码",
    resetHint: "邮箱验证保护账号安全，验证码 10 分钟内有效",
    debugCode: "本地调试验证码：{code}",
    breadcrumbSettings: "账号设置",
    breadcrumbSecurity: "安全中心",
    strengthWeak: "弱",
    strengthMedium: "中",
    strengthStrong: "强",
    forgotSuccess: "密码重置完成，请使用新密码登录。",
    changeSuccess: "密码修改成功，请重新登录。",
    requestFailed: "请求失败",
    githubPending: "GitHub OAuth 暂未接入。",
    authChecking: "正在检查登录状态...",
    mustLogin: "请先登录。",
    validation: {
      email: "请输入正确的邮箱地址。",
      password: "密码需为 8-80 位，并包含字母和数字。",
      emailCode: "验证码需为 6 位数字。",
      confirmPassword: "两次输入的密码不一致。",
      terms: "请先同意用户协议和隐私政策。",
      currentPassword: "请输入当前密码。",
    },
    previewTitle: {
      login: "登录后继续你的 Skillnetic 之旅",
      register: "注册后你可以做什么？",
      forgot: "账号安全与恢复",
      change: "安全中心",
    },
    previewSubtitle: {
      login: "学习、创作、提交，一切进度都为你记录。",
      register: "收藏优质 Skill、学习教程、提交作品并参与社区。",
      forgot: "快速找回账号，继续在 Skillnetic 学习与创作。",
      change: "保护你的 Skillnetic 账号与提交内容。",
    },
    footerLinks: ["隐私政策", "服务条款", "用户协议"],
    progressEmail: "验证邮箱",
    progressReset: "重置密码",
    loginCards: ["我的收藏", "提交记录", "审核通知"],
    continueCards: ["我的收藏", "学习进度", "提交记录"],
    securityTips: [
      "请使用强密码，包含字母、数字和符号",
      "不要泄露验证码给任何人，包括 AI 助手",
    ],
    securityRecommendations: [
      "定期修改密码，建议每 3 个月一次",
      "避免在多个网站使用相同密码",
      "后续可开启更强的身份验证方式",
    ],
    passwordRules: ["至少 8 位", "包含字母与数字", "建议混合大小写与符号"],
    recentSecurityOps: ["2 小时前修改密码", "3 天前管理登录设备", "12 天前绑定 GitHub"],
    loginMethods: ["邮箱登录", "GitHub 后续接入"],
    show: "显示",
    hide: "隐藏",
    processing: "处理中...",
    codeSent: "验证码已发送。",
    accountStatus: "账号状态",
    emailVerified: "邮箱已验证",
    githubLinked: "GitHub 已绑定",
    loginMethodsTitle: "登录方式",
    recentSecurityTitle: "最近安全操作",
    securityTipsTitle: "安全提醒",
    continueTitle: "恢复后可继续",
    recommendationsTitle: "安全建议",
    active: "已启用",
    later: "待接入",
    waiting: "待处理",
    ok: "正常",
  };
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value: string) {
  return value.length >= 8 && value.length <= 80 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function getPasswordStrength(value: string) {
  const lengthOk = value.length >= 8;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (!lengthOk || !(hasLetter && hasNumber)) {
    return 1;
  }
  if ((hasLower && hasUpper) || hasSymbol || value.length >= 12) {
    return 3;
  }
  return 2;
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M2.75 12C4.7 8.67 8.02 6.75 12 6.75C15.98 6.75 19.3 8.67 21.25 12C19.3 15.33 15.98 17.25 12 17.25C8.02 17.25 4.7 15.33 2.75 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 5.08C10.58 4.86 11.28 4.75 12 4.75C15.98 4.75 19.3 6.67 21.25 10C20.65 11.03 19.92 11.94 19.07 12.72"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 18.67C13.43 18.84 12.72 18.92 12 18.92C8.02 18.92 4.7 17 2.75 13.67C3.71 12.04 5.06 10.68 6.67 9.71"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthFormPage({ locale, mode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot-password";
  const isChangePassword = mode === "change-password";

  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [debugCode, setDebugCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(isChangePassword);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const useStandaloneShell = isChangePassword;

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!isChangePassword) {
      return undefined;
    }
    let active = true;
    fetchRealMe()
      .catch(() => {
        clearAuthSession();
        if (active) {
          router.replace(withLocale(locale, "/login"));
        }
      })
      .finally(() => {
        if (active) {
          setCheckingAuth(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isChangePassword, locale, router]);

  function validateForm() {
    if ((isLogin || isRegister || isForgotPassword) && !validateEmail(email)) {
      return copy.validation.email;
    }
    if ((isRegister || isForgotPassword) && !/^\d{6}$/.test(emailCode.trim())) {
      return copy.validation.emailCode;
    }
    if ((isLogin || isRegister || isForgotPassword || isChangePassword) && !validatePassword(password)) {
      return copy.validation.password;
    }
    if ((isRegister || isForgotPassword || isChangePassword) && password !== confirmPassword) {
      return copy.validation.confirmPassword;
    }
    if (isRegister && !agreeTerms) {
      return copy.validation.terms;
    }
    if (isChangePassword && !currentPassword.trim()) {
      return copy.validation.currentPassword;
    }
    return null;
  }

  async function handleSendCode() {
    if (!validateEmail(email) || countdown > 0) {
      setError(copy.validation.email);
      return;
    }
    setSendingCode(true);
    setError("");
    setSuccess("");
    try {
      const result = await sendEmailCode({
        email,
        scene: isRegister ? "register" : "forgot_password",
      });
      setCountdown(result.cooldownSeconds || 60);
      setDebugCode(result.debugCode || "");
      setSuccess(copy.codeSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.requestFailed);
    } finally {
      setSendingCode(false);
    }
  }

  async function handleGithubAuth() {
    setError("");
    setSuccess("");
    try {
      const url = await getGithubLoginUrl(isRegister ? "register" : "login");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.requestFailed);
    }
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (isLogin) {
        clearAuthSession();
        const result = await loginAuth({ email, password, rememberMe });
        saveAuthUser(result.user);
        router.push(withLocale(locale, "/me/submit"));
      } else if (isRegister) {
        clearAuthSession();
        const result = await registerAuth({
          email,
          emailCode,
          password,
          confirmPassword,
          agreeTerms,
          locale,
        });
        saveAuthUser(result.user);
        router.push(withLocale(locale, "/me/submit"));
      } else if (isForgotPassword) {
        await resetPassword({
          email,
          emailCode,
          newPassword: password,
          confirmPassword,
        });
        clearAuthSession();
        setSuccess(copy.forgotSuccess);
        window.setTimeout(() => router.push(withLocale(locale, "/login")), 1000);
      } else if (isChangePassword) {
        await changePassword({
          currentPassword,
          newPassword: password,
          confirmPassword,
        });
        clearAuthSession();
        setSuccess(copy.changeSuccess);
        window.setTimeout(() => router.push(withLocale(locale, "/login")), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.requestFailed);
    } finally {
      setSubmitting(false);
    }
  }

  function renderField({
    label,
    required = false,
    value,
    onChange,
    type = "text",
    placeholder,
    trailing,
  }: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder: string;
    trailing?: React.ReactNode;
  }) {
    return (
      <label className="block">
        <div className="mb-2 text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="ml-1 text-brand-500">*</span> : null}
        </div>
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-300"
          />
          {trailing}
        </div>
      </label>
    );
  }

  function renderTopBar() {
    return (
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href={withLocale(locale, "/")} className="flex items-center">
          <Image
            src="/icons/skillnetic_logo_horizontal.png"
            alt="skillnetic.ai"
            width={1085}
            height={360}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <LocalizedLink href="/help" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          {copy.helpCenter}
        </LocalizedLink>
      </div>
    );
  }

  function renderFooter() {
    const currentLocale = getLocaleFromPathname(pathname);
    const currentHref = stripLocaleFromPath(pathname) || "/";

    return (
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-4 px-6 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div>© 2024 skillnetic.ai. All rights reserved.</div>
        <div className="flex flex-wrap justify-center gap-6">
          {copy.footerLinks.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-2 py-2 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
          {locales.map((targetLocale) => (
            <Link
              key={targetLocale}
              href={withLocale(targetLocale, currentHref)}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                targetLocale === currentLocale
                  ? "bg-slate-900 !text-white shadow-[0_4px_12px_rgba(15,23,42,0.16)]"
                  : "!text-slate-800 hover:bg-slate-100 hover:!text-slate-950"
              }`}
              style={{
                color: targetLocale === currentLocale ? "#ffffff" : "#1f2937",
              }}
            >
              {localeDisplayName[targetLocale]}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  function renderRightPanel() {
    const title = isLogin
      ? copy.previewTitle.login
      : isRegister
        ? copy.previewTitle.register
        : isForgotPassword
          ? copy.previewTitle.forgot
          : copy.previewTitle.change;
    const subtitle = isLogin
      ? copy.previewSubtitle.login
      : isRegister
        ? copy.previewSubtitle.register
        : isForgotPassword
          ? copy.previewSubtitle.forgot
          : copy.previewSubtitle.change;

    return (
      <div className="rounded-[32px] border border-[#dfe7fb] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),rgba(242,247,255,0.92))] p-8 shadow-[0_32px_80px_rgba(85,126,217,0.08)]">
        <h2 className="text-[42px] font-semibold tracking-[-0.03em] text-slate-900">{title}</h2>
        <p className="mt-3 text-lg leading-8 text-slate-500">{subtitle}</p>

        {isLogin ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {copy.loginCards.map((item) => (
              <div key={item} className="rounded-[24px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <div className="text-xl font-semibold text-slate-900">{item}</div>
                <div className="mt-3 text-sm leading-7 text-slate-500">
                  {locale === "en" ? "Continue your learning and submission progress after signing in." : "登录后继续你的学习与提交进度。"}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {isRegister ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              locale === "en" ? "Discover Great Skills" : "发现精选 Skill",
              locale === "en" ? "Learn Hot Tutorials" : "学习热门教程",
              locale === "en" ? "Submit Your Skill" : "提交你的 Skill",
              locale === "en" ? "Growth Record" : "成长记录",
            ].map((item, index) => (
              <div key={item} className="rounded-[24px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <div className="text-sm font-semibold text-brand-500">{index + 1}</div>
                <div className="mt-3 text-xl font-semibold text-slate-900">{item}</div>
              </div>
            ))}
          </div>
        ) : null}

        {isForgotPassword ? (
          <div className="mt-10 grid gap-5">
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.securityTipsTitle}</div>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-500">
                {copy.securityTips.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.continueTitle}</div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {copy.continueCards.map((item) => (
                  <div key={item} className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-5 text-center text-sm font-semibold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {isChangePassword ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.loginMethodsTitle}</div>
              <div className="mt-5 grid gap-3">
                {copy.loginMethods.map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-700">
                    <span>{item}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                      {index === 0 ? copy.active : copy.later}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.recentSecurityTitle}</div>
              <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-500">
                {copy.recentSecurityOps.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.accountStatus}</div>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <span>{copy.emailVerified}</span>
                  <span className="text-emerald-600">{copy.ok}</span>
                </div>
                <div className="flex items-center justify-between rounded-[18px] border border-slate-100 bg-slate-50/80 px-4 py-4">
                  <span>{copy.githubLinked}</span>
                  <span className="text-slate-400">{copy.waiting}</span>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/92 p-6">
              <div className="text-2xl font-semibold text-slate-900">{copy.recommendationsTitle}</div>
              <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-500">
                {copy.securityRecommendations.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(password);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fbfdff_0%,#f4f7fb_100%)] text-sm font-medium text-slate-500">
        {copy.authChecking}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f4f7fb_100%)]">
      {useStandaloneShell ? renderTopBar() : null}
      <div
        className={`mx-auto grid w-full max-w-[1360px] gap-8 px-6 pb-10 ${useStandaloneShell ? "pt-4" : "pt-10"} lg:grid-cols-[620px_minmax(0,1fr)] lg:px-10`}
      >
        <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.07)] lg:p-10">
          {isChangePassword ? (
            <div className="text-sm font-semibold text-slate-400">
              <span className="text-brand-600">{copy.breadcrumbSettings}</span> / {copy.breadcrumbSecurity}
            </div>
          ) : null}

          <h1 className="mt-3 text-[56px] font-semibold tracking-[-0.04em] text-slate-900">
            {isLogin ? copy.loginTitle : isRegister ? copy.registerTitle : isForgotPassword ? copy.forgotTitle : copy.changeTitle}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            {isLogin
              ? copy.loginDescription
              : isRegister
                ? copy.registerDescription
                : isForgotPassword
                  ? copy.forgotDescription
                  : copy.changeDescription}
          </p>

          {isLogin || isRegister ? (
            <div className="mt-8 flex gap-10 border-b border-slate-200">
              <LocalizedLink
                href="/login"
                className={`pb-4 text-lg font-semibold ${isLogin ? "border-b-2 border-brand-500 text-brand-600" : "text-slate-400"}`}
              >
                {copy.loginTab}
              </LocalizedLink>
              <LocalizedLink
                href="/register"
                className={`pb-4 text-lg font-semibold ${isRegister ? "border-b-2 border-brand-500 text-brand-600" : "text-slate-400"}`}
              >
                {copy.registerTab}
              </LocalizedLink>
            </div>
          ) : null}

          {isForgotPassword ? (
            <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">1</span>
                <span className="text-brand-600">{copy.progressEmail}</span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">2</span>
                <span>{copy.progressReset}</span>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-5">
            {(isLogin || isRegister || isForgotPassword)
              ? renderField({
                  label: copy.email,
                  required: true,
                  value: email,
                  onChange: setEmail,
                  placeholder: copy.emailPlaceholder,
                })
              : null}

            {(isRegister || isForgotPassword)
              ? renderField({
                  label: copy.emailCode,
                  required: true,
                  value: emailCode,
                  onChange: setEmailCode,
                  placeholder: copy.emailCodePlaceholder,
                  trailing: (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={sendingCode || countdown > 0}
                      className="ml-4 shrink-0 text-sm font-semibold text-brand-600 disabled:text-slate-300"
                    >
                      {countdown > 0 ? copy.resendIn.replace("{seconds}", String(countdown)) : copy.sendCode}
                    </button>
                  ),
                })
              : null}

            {isChangePassword
              ? renderField({
                  label: copy.currentPassword,
                  required: true,
                  value: currentPassword,
                  onChange: setCurrentPassword,
                  type: currentPasswordVisible ? "text" : "password",
                  placeholder: copy.currentPasswordPlaceholder,
                  trailing: (
                    <button
                      type="button"
                      aria-label={currentPasswordVisible ? copy.hide : copy.show}
                      onClick={() => setCurrentPasswordVisible((value) => !value)}
                      className="ml-4 text-slate-400 transition hover:text-slate-600"
                    >
                      <PasswordVisibilityIcon visible={currentPasswordVisible} />
                    </button>
                  ),
                })
              : null}

            {(isLogin || isRegister || isForgotPassword || isChangePassword)
              ? renderField({
                  label: isForgotPassword || isChangePassword ? copy.newPassword : copy.password,
                  required: true,
                  value: password,
                  onChange: setPassword,
                  type: passwordVisible ? "text" : "password",
                  placeholder: isForgotPassword || isChangePassword ? copy.newPasswordPlaceholder : copy.passwordPlaceholder,
                  trailing: (
                    <button
                      type="button"
                      aria-label={passwordVisible ? copy.hide : copy.show}
                      onClick={() => setPasswordVisible((value) => !value)}
                      className="ml-4 text-slate-400 transition hover:text-slate-600"
                    >
                      <PasswordVisibilityIcon visible={passwordVisible} />
                    </button>
                  ),
                })
              : null}

            {(isRegister || isForgotPassword || isChangePassword)
              ? renderField({
                  label: copy.confirmPassword,
                  required: true,
                  value: confirmPassword,
                  onChange: setConfirmPassword,
                  type: confirmPasswordVisible ? "text" : "password",
                  placeholder: copy.confirmPasswordPlaceholder,
                  trailing: (
                    <button
                      type="button"
                      aria-label={confirmPasswordVisible ? copy.hide : copy.show}
                      onClick={() => setConfirmPasswordVisible((value) => !value)}
                      className="ml-4 text-slate-400 transition hover:text-slate-600"
                    >
                      <PasswordVisibilityIcon visible={confirmPasswordVisible} />
                    </button>
                  ),
                })
              : null}
          </div>

          {isChangePassword ? (
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-900">{locale === "en" ? "Password Strength" : "密码强度"}</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((value) => (
                  <div
                    key={value}
                    className={`h-2 rounded-full ${passwordStrength >= value ? "bg-brand-500" : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-sm text-slate-400">
                <span>{copy.strengthWeak}</span>
                <span>{copy.strengthMedium}</span>
                <span>{copy.strengthStrong}</span>
              </div>
            </div>
          ) : null}

          {isRegister ? (
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-500">
              <input type="checkbox" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300" />
              <span>
                {copy.termsPrefix} <span className="font-semibold text-brand-600">{copy.terms}</span>、<span className="font-semibold text-brand-600">{copy.privacy}</span>
              </span>
            </label>
          ) : null}

          {isLogin ? (
            <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <span>{copy.rememberMe}</span>
              </label>
              <LocalizedLink href="/forgot-password" className="font-medium text-slate-500 hover:text-brand-600">
                {copy.forgotPassword}
              </LocalizedLink>
            </div>
          ) : null}

          {isForgotPassword ? <div className="mt-4 text-sm text-slate-400">{copy.resetHint}</div> : null}
          {debugCode ? <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-600">{copy.debugCode.replace("{code}", debugCode)}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
          {success ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div> : null}

          {isChangePassword ? (
            <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
              <div className="grid gap-2">
                {copy.passwordRules.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-2xl bg-brand-500 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {submitting
                ? copy.processing
                : isLogin
                  ? copy.loginSubmit
                  : isRegister
                    ? copy.registerSubmit
                    : isForgotPassword
                      ? copy.forgotSubmit
                      : copy.changeSubmit}
            </button>

            {(isLogin || isRegister) ? (
              <button
                type="button"
                onClick={handleGithubAuth}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-900 transition hover:border-slate-300"
              >
                {isLogin ? copy.githubLogin : copy.githubRegister}
              </button>
            ) : null}

            {isForgotPassword ? (
              <LocalizedLink href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base font-semibold text-brand-600 transition hover:border-slate-300">
                {copy.backToLogin}
              </LocalizedLink>
            ) : null}

            {isChangePassword ? (
              <LocalizedLink href="/" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base font-semibold text-brand-600 transition hover:border-slate-300">
                {copy.cancel}
              </LocalizedLink>
            ) : null}
          </div>

          {isLogin ? (
            <div className="mt-8 text-center text-base text-slate-500">
              {copy.noAccount}{" "}
              <LocalizedLink href="/register" className="font-semibold text-brand-600">
                {copy.createNow}
              </LocalizedLink>
            </div>
          ) : null}

          {isRegister ? (
            <div className="mt-8 text-center text-base text-slate-500">
              {copy.hasAccount}{" "}
              <LocalizedLink href="/login" className="font-semibold text-brand-600">
                {copy.loginNow}
              </LocalizedLink>
            </div>
          ) : null}
        </div>

        {renderRightPanel()}
      </div>
      {useStandaloneShell ? renderFooter() : null}
    </div>
  );
}
