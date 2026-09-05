import { ReactNode } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useAuth,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import Home from "./pages/Home";
import CompanionPage from "./pages/CompanionPage";
import QuranPage from "./pages/QuranPage";
import ParadisePage from "./pages/ParadisePage";
import SunnahPage from "./pages/SunnahPage";
import WirdPage from "./pages/WirdPage";
import AdhkarPage from "./pages/AdhkarPage";
import LibraryPage from "./pages/LibraryPage";
import HayatPersona from "./components/HayatPersona";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing Clerk publishable key");
}

const clerkAppearance = {
  theme: shadcn,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#5456db",
    colorForeground: "#172033",
    colorMutedForeground: "#667085",
    colorDanger: "#d92d20",
    colorBackground: "#ffffff",
    colorInput: "#f8f9fd",
    colorInputForeground: "#172033",
    colorNeutral: "#d9deea",
    fontFamily: "Tajawal, Arial, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-3xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-indigo-600 font-semibold",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-400",
    identityPreviewEditButton: "text-indigo-600",
    formFieldSuccessText: "text-emerald-600",
    alertText: "text-red-700",
    logoBox: "h-14",
    logoImage: "max-h-14",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 transition-colors",
    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 transition-colors",
    formFieldInput: "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500/20",
    footerAction: "border-t border-slate-100",
    dividerLine: "bg-slate-200",
    alert: "border-red-200 bg-red-50",
    otpCodeFieldInput: "border-slate-200",
    formFieldRow: "gap-2",
    main: "gap-5",
  },
};

function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      {mode === "sign-in" ? (
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      ) : (
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!isSignedIn) {
    return <Redirect to="/sign-in" />;
  }
  return <>{children}</>;
}

function HomeRoute() {
  return <Home />;
}

function AppRoutes() {
  const [, setLocation] = useLocation();

  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login">
        <Redirect to="/sign-in" />
      </Route>
      <Route path="/sign-in/*?">
        <AuthPage mode="sign-in" />
      </Route>
      <Route path="/sign-up/*?">
        <AuthPage mode="sign-up" />
      </Route>
      <Route path="/companion">
        <ProtectedRoute><CompanionPage /></ProtectedRoute>
      </Route>
      <Route path="/quran">
        <ProtectedRoute><QuranPage /></ProtectedRoute>
      </Route>
      <Route path="/paradise">
        <ProtectedRoute><ParadisePage /></ProtectedRoute>
      </Route>
      <Route path="/sunnah">
        <ProtectedRoute><SunnahPage /></ProtectedRoute>
      </Route>
      <Route path="/wird">
        <ProtectedRoute><WirdPage /></ProtectedRoute>
      </Route>
      <Route path="/adhkar">
        <ProtectedRoute><AdhkarPage /></ProtectedRoute>
      </Route>
      <Route path="/library">
        <ProtectedRoute><LibraryPage /></ProtectedRoute>
      </Route>
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground">الصفحة غير موجودة</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkApp />
    </WouterRouter>
  );
}

function ClerkApp() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "مرحباً بعودتك",
            subtitle: "سجّل الدخول لمتابعة رحلتك الروحية",
          },
        },
        signUp: {
          start: {
            title: "أنشئ حسابك",
            subtitle: "ابدأ مساحتك الروحية الخاصة",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <AppRoutes />
      <Show when="signed-in">
        <HayatPersona />
      </Show>
    </ClerkProvider>
  );
}