import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 font-devanagari">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              5
            </Badge>
          </Button>
          
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-gray-500">{user?.role || 'Admin'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
