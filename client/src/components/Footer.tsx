import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Left side - Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex-shrink-0">
              <img 
                src="/sp-office-logo.svg" 
                alt="SP Office Logo" 
                className="w-full h-full"
              />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-blue-900">ई-पत्र (e-Patra)</p>
              <p className="text-gray-600">Government Document Management System</p>
            </div>
          </div>

          {/* Center - Development Credit */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Developed with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by</span>
            <span className="font-semibold text-blue-900">SP Office Ahilyanagar</span>
          </div>

          {/* Right side - Additional Info */}
          <div className="text-sm text-gray-500 text-center md:text-right">
            <p>© 2024 SP Office Ahilyanagar</p>
            <p>All rights reserved</p>
          </div>
        </div>
        
        {/* Bottom section - Technical info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>Powered by AI-driven document processing and analysis</p>
            <p>Version 2.0 | Built for Maharashtra Government</p>
          </div>
        </div>
      </div>
    </footer>
  );
}