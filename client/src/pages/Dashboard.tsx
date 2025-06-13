import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import NewLetter from "./NewLetter";
import DocumentRegister from "./DocumentRegister";
import FieldMaster from "./FieldMaster";
import SecurityRBAC from "./SecurityRBAC";
import LLMIntegration from "./LLMIntegration";
import DocumentationAI from "./DocumentationAI";
import Communications from "./Communications";
import CloudStorage from "./CloudStorage";
import Analytics from "./Analytics";
import DocumentTemplates from "./DocumentTemplates";
import Notifications from "./Notifications";
import BulkOperations from "./BulkOperations";
import { DashboardOverview } from "./DashboardOverview";

const TAB_TITLES = {
  'dashboard': 'डॅशबोर्ड',
  'new-letter': 'नवीन पत्र नोंद',
  'inward-register': 'आवक पत्र रजिस्टर',
  'outward-register': 'जावक पत्र रजिस्टर',
  'ai-ocr': 'AI OCR Processing',
  'llm-integration': 'LLM Integration',
  'ai-documentation': 'AI Documentation',
  'document-templates': 'टेम्प्लेट्स',
  'notifications': 'सूचना',
  'bulk-operations': 'बल्क ऑपरेशन्स',
  'communications': 'Communications Hub',
  'cloud-storage': 'Cloud Storage',
  'field-master': 'Field Master',
  'security-rbac': 'Security & RBAC',
  'analytics': 'Advanced Analytics'
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'new-letter':
        return <NewLetter />;
      case 'inward-register':
      case 'outward-register':
      case 'ai-ocr':
        return <DocumentRegister type={activeTab} />;
      case 'field-master':
        return <FieldMaster />;
      case 'security-rbac':
        return <SecurityRBAC />;
      case 'llm-integration':
        return <LLMIntegration />;
      case 'ai-documentation':
        return <DocumentationAI />;
      case 'document-templates':
        return <DocumentTemplates />;
      case 'notifications':
        return <Notifications />;
      case 'bulk-operations':
        return <BulkOperations />;
      case 'communications':
        return <Communications />;
      case 'cloud-storage':
        return <CloudStorage />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title={TAB_TITLES[activeTab as keyof typeof TAB_TITLES] || activeTab}
            subtitle="ई-पत्र (e-Patra) - SP Office Ahilyanagar"
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
