import { useState } from "react";
import { 
  FileText, 
  BarChart3, 
  Plus, 
  Inbox, 
  Send, 
  Brain, 
  Bot, 
  MessageSquare, 
  Cloud, 
  Settings, 
  Shield, 
  Menu, 
  X,
  Bell,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItemProps {
  icon: React.ElementType;
  text: string;
  tabKey: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

function NavItem({ icon: Icon, text, tabKey, count, isActive, onClick, collapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-xl mx-2 transition-all ${
        isActive 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
      {!collapsed && (
        <>
          <span className="font-medium font-devanagari">{text}</span>
          {count && (
            <Badge className="ml-auto bg-red-500 text-white">
              {count}
            </Badge>
          )}
        </>
      )}
    </button>
  );
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: BarChart3, text: 'डॅशबोर्ड', tabKey: 'dashboard' },
    { icon: Plus, text: 'नवीन पत्र नोंद', tabKey: 'new-letter' },
    { icon: Inbox, text: 'आवक पत्र रजिस्टर', tabKey: 'inward-register' },
    { icon: Send, text: 'जावक पत्र रजिस्टर', tabKey: 'outward-register' },
    { icon: Brain, text: 'AI OCR Processing', tabKey: 'ai-ocr', count: 3 },
    { icon: Bot, text: 'LLM Integration', tabKey: 'llm-integration' },
    { icon: FileText, text: 'AI Documentation', tabKey: 'ai-documentation' },
    { icon: FileText, text: 'टेम्प्लेट्स', tabKey: 'document-templates' },
    { icon: Bell, text: 'सूचना', tabKey: 'notifications', count: 5 },
    { icon: Package, text: 'बल्क ऑपरेशन्स', tabKey: 'bulk-operations' },
    { icon: MessageSquare, text: 'Communications', tabKey: 'communications', count: 12 },
    { icon: Cloud, text: 'Cloud Storage', tabKey: 'cloud-storage' },
    { icon: Settings, text: 'Field Master', tabKey: 'field-master' },
    { icon: Shield, text: 'Security & RBAC', tabKey: 'security-rbac' },
    { icon: BarChart3, text: 'Advanced Analytics', tabKey: 'analytics' },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-72'} bg-white shadow-xl transition-all duration-300 relative`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div className="bg-primary p-3 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 font-devanagari">ई-ट्याल Advanced</h1>
                <p className="text-xs text-gray-500 font-devanagari">जि. पो. अ. अहमदनगर</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.tabKey}
              icon={item.icon}
              text={item.text}
              tabKey={item.tabKey}
              count={item.count}
              isActive={activeTab === item.tabKey}
              onClick={() => onTabChange(item.tabKey)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
