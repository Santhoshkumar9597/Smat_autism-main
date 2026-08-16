import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Home, UserPlus, Upload, BarChart3, MessageCircle, History, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="bg-medical-navy text-primary-foreground shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent" />
            <span className="font-heading font-bold md:text-lg leading-tight truncate max-w-[150px] md:max-w-none">
              Smart Autism Detection
            </span>
          </Link>
          
          <nav className="flex items-center gap-1 md:gap-4">
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
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
            </div>

            {/* Profile Circle / Avatar Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none ring-offset-medical-navy focus:ring-2 focus:ring-accent rounded-full transition-all">
                    <Avatar className="h-9 w-9 border-2 border-accent/20 hover:border-accent transition-all">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel className="font-heading">My Account</DropdownMenuLabel>
                  <div className="px-2 pb-2 text-[10px] text-muted-foreground truncate italic">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
                    <User className="w-4 h-4" /> Profile Info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer gap-2">
                    <History className="w-4 h-4" /> Screening History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" /> Logout session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!user && (
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="font-bold">Login</Button>
              </Link>
            )}
          </nav>
        </div>
        <div className="bg-primary/80 text-center py-1.5 -mx-4 px-4 text-[10px] uppercase font-bold tracking-widest">
          AI-Based Early Screening · Multimodal Analysis System
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
