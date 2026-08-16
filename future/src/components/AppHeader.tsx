import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Home, UserPlus, Upload, BarChart3, MessageCircle, History, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/profile", label: "Profile", icon: UserPlus },
  { path: "/upload", label: "Upload", icon: Upload },
  { path: "/results", label: "Results", icon: BarChart3 },
  { path: "/assistant", label: "AI Chat", icon: MessageCircle },
  { path: "/history", label: "History", icon: History },
];

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-medical-navy text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent" />
            <span className="font-heading font-bold text-lg">Smart Autism Detection</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/20 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </nav>
        </div>
        <div className="bg-primary/80 text-center py-1.5 -mx-4 px-4 text-xs font-medium tracking-wide">
          AI-Based Early Screening · Upload Audio, Video, or Image Samples
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
