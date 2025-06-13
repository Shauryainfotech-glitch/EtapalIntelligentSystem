import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Shield, Cloud, MessageSquare, BarChart3 } from "lucide-react";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Welcome to e Patra (ई-पत्र)",
        description: "Please log in to access the document management system.",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered OCR",
      description: "Advanced optical character recognition with 98%+ accuracy for Marathi and English documents"
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      description: "Comprehensive security with granular permissions and audit trails"
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Secure cloud storage with automatic backups and version control"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Integrated WhatsApp and email notifications for document workflows"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time dashboards and reporting for document processing insights"
    },
    {
      icon: FileText,
      title: "Bilingual Support",
      description: "Full support for Marathi and English with seamless translation capabilities"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 flex-shrink-0">
              <img 
                src="/sp-office-logo.svg" 
                alt="SP Office Ahilyanagar Logo" 
                className="w-full h-full"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-blue-900 mb-4 font-devanagari">
            ई-पत्र (e-Patra)
          </h1>
          <p className="text-2xl text-blue-700 mb-2 font-semibold">
            SP Office Ahilyanagar
          </p>
          <p className="text-xl text-gray-600 mb-4">
            Superintendent of Police Office, Ahilyanagar
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Advanced Government Document Management System with AI-powered OCR, 
            bilingual support, and comprehensive analytics
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-medium">
              Developed by SP Office Ahilyanagar Technical Team
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Login Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-devanagari">प्रणालीमध्ये प्रवेश</CardTitle>
              <CardDescription>
                Access the advanced document management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login to Continue"}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Secure authentication powered by advanced encryption
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            © 2024 ई-ट्याल Advanced System. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Developed for Maharashtra Police Department
          </p>
        </div>
      </div>
    </div>
  );
}
