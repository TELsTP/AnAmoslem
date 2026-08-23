import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import CompanionPage from "./pages/CompanionPage";
import QuranPage from "./pages/QuranPage";
import ParadisePage from "./pages/ParadisePage";
import SunnahPage from "./pages/SunnahPage";
import WirdPage from "./pages/WirdPage";
import AdhkarPage from "./pages/AdhkarPage";
import LibraryPage from "./pages/LibraryPage";
import HayatPersona from "./components/HayatPersona";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/login" component={AuthPage} />
        <Route path="/" component={Home} />
        <Route path="/companion" component={CompanionPage} />
        <Route path="/quran" component={QuranPage} />
        <Route path="/paradise" component={ParadisePage} />
        <Route path="/sunnah" component={SunnahPage} />
        <Route path="/wird" component={WirdPage} />
        <Route path="/adhkar" component={AdhkarPage} />
        <Route path="/library" component={LibraryPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground">الصفحة غير موجودة</p>
            </div>
          </div>
        </Route>
      </Switch>
      <HayatPersona />
    </>
  );
}
