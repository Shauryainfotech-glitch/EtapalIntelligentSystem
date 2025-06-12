export const LETTER_TYPES = [
  'निवडा...',
  'वरिष्ठ ट्यापल - पोलिस महासंचालक',
  'वरिष्ठ ट्यापल - महाराष्ट्र शासन',
  'वरिष्ठ ट्यापल - विशेष पोलिस महानिदेशक',
  'वरिष्ठ ट्यापल - अपर पोलिस महासंचालक',
  'वरिष्ठ ट्यापल - पोलिस आयुक्त',
  'वरिष्ठ ट्यापल - विभागीय आयुक्त',
  'वरिष्ठ ट्यापल - एसपी',
  'वरिष्ठ ट्यापल - एसडीपीओ'
];

export const LETTER_SUBJECTS = [
  'निवडा...',
  'गोपनीय', 'गुंजरी गुन्हा', 'दुखी', 'उलखागाना नोंद', 'उल्लेख रजा प्रकरण',
  'सुलेख रजा प्रकरण', 'आठवडी आश्वी', 'डेली चेकी', 'अंगूळी मुद्रा',
  'बेसरकारीय बीत', 'टेलंट खेडसी फॉर्मेशन', 'रजा मंजूरी बाबत', 'वॉटेट',
  'खुलासा/रेटहार', 'मुदत संपती मंजूरी बाबत', 'स्टेशन', 'हिसाब',
  'विभागीय चौकशी आदेश', 'अनिम आदेश', 'जिल्हा पोलिस पशस्त्री प्रमुख',
  'अनुशासन', 'दप्तर उपाधणी', 'बंदोबस्त', 'बहिर्ग शिक्षा', 'प्रभारी अधिकारी आदेश',
  'साफकर', 'CDR', 'CAF', 'SDR', 'IMEI', 'DUMP DATA', 'IT ACT', 'FACEBOOK',
  'ONLINE FRAUD', 'आयमडन', 'नाहीं हुक्म संदेश', 'PCR', 'STENO', 'लघुलेखक',
  'अ वर्ग- मा. पंतप्रधान', 'अ वर्ग- मा. मुख्यमंत्री', 'अ वर्ग- मा. उपमुख्यमंत्री',
  'अ वर्ग- मा. गृहमंत्री', 'अ वर्ग- मा. गुहारामंत्री', 'अ वर्ग- मा. पालक मंत्री',
  'अ वर्ग- केंद्रीय मंत्री', 'अ वर्ग- खासदार', 'अ वर्ग- आमदार', 'अ वर्ग- इतर',
  'क वर्ग -पोलिस आयुक्त', 'क वर्ग-विभागीय आयुक्त', 'क वर्ग-जिल्हाधिकारी',
  'शस्त्र परवाना', 'चारित्र्य पडताळणी', 'लाउडस्पीकर परवाना', 'सुरक्षा बंदोबस्त',
  'स्फोटक परवाना', 'शासकीय वाहन परवाना', 'इतर परवाने', 'देवस्थान दर्जा',
  'कोषागार', 'समादेशक', 'अपील', 'सेवानिवृत्त प्रशिक्षण', 'हमारत शाखा',
  'पेन्शन संदर्भाती', 'देणके', 'विभागीय चौकशी', 'कसुरी प्रकरण', 'वेतनविहीत',
  'बदली', 'माहिती अधिकार', 'तक्रार', 'खाजगारी संदर्भ', 'शिक्षाधिकारी संदर्भ',
  'न्यायालयीन संदर्भ', 'परीक्षक', 'मंत्री संदर्भ', 'लोकआयुक्त संदर्भ',
  'लोकशाही दिन संदर्भ', 'विधानसभा सचिवालय', 'शासन पत्र', 'शासन संदर्भ'
];

export const OFFICES = [
  'जिल्हा पोलिस कार्यालय अहमदनगर',
  'पोलिस अधीक्षक कार्यालय',
  'पोलिस उपअधीक्षक कार्यालय',
  'महाराष्ट्र शासन',
  'जिल्हाधिकारी कार्यालय',
  'तहसीलदार कार्यालय'
];

export const DOCUMENT_STATUSES = {
  pending: { label: 'Pending', color: 'gray' },
  processing: { label: 'Processing', color: 'yellow' },
  processed: { label: 'Processed', color: 'green' },
  failed: { label: 'Failed', color: 'red' }
};

export const USER_ROLES = {
  super_admin: { label: 'Super Admin', permissions: ['all'] },
  admin: { label: 'Administrator', permissions: ['create', 'read', 'update', 'delete'] },
  officer: { label: 'Officer', permissions: ['create', 'read', 'update'] },
  clerk: { label: 'Clerk', permissions: ['create', 'read'] }
};

export const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'date', label: 'Date Picker' },
  { value: 'number', label: 'Number Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'tel', label: 'Phone Input' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' }
];

export const COMMUNICATION_TYPES = {
  whatsapp: { label: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'green' },
  email: { label: 'Email', icon: 'fas fa-envelope', color: 'blue' },
  sms: { label: 'SMS', icon: 'fas fa-sms', color: 'purple' }
};
