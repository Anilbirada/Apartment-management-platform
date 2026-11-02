export type Language = 'en' | 'hi' | 'kn';

export interface Translations {
  appName: string;
  tagline: string;
  home: string;
  services: string;
  requests: string;
  requirements: string;
  messages: string;
  dashboard: string;
  admin: string;
  login: string;
  logout: string;
  searchPlaceholder: string;
  offerService: string;
  postRequirement: string;
  popularNearYou: string;
  communityNotices: string;
  verifiedResident: string;
  verifiedProvider: string;
  requestService: string;
  viewProfile: string;
  startingFrom: string;
  jobsCompleted: string;
  rating: string;
  allCategories: string;
  filterBy: string;
  sortBy: string;
  highestRated: string;
  lowestPrice: string;
  mostJobs: string;
  noProvidersFound: string;
  requestItHere: string;
  privacyNotice: string;
  myRequests: string;
  incomingRequests: string;
  upcomingJobs: string;
  completedJobs: string;
  earningsSummary: string;
  accept: string;
  reject: string;
  markCompleted: string;
  festivalGreeting: string;
  festivalTagline: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Palm Heights Residences',
    tagline: 'Premium Community Living & Trusted Doorstep Services',
    home: 'Home',
    services: 'Services',
    requests: 'My Requests',
    requirements: 'Requirements (Hire)',
    messages: 'Messages',
    dashboard: 'Dashboard',
    admin: 'Admin Portal',
    login: 'Sign In',
    logout: 'Sign Out',
    searchPlaceholder: 'Search plumber, electrician, car wash, deep clean...',
    offerService: 'Offer a Service',
    postRequirement: 'Post a Requirement',
    popularNearYou: 'Popular Verified Providers Near You',
    communityNotices: 'Community Announcements & Updates',
    verifiedResident: 'Verified Resident',
    verifiedProvider: 'Verified Provider',
    requestService: 'Request Service',
    viewProfile: 'View Profile',
    startingFrom: 'Starts from',
    jobsCompleted: 'jobs completed',
    rating: 'Rating',
    allCategories: 'All Categories',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    highestRated: 'Highest Rated',
    lowestPrice: 'Lowest Starting Price',
    mostJobs: 'Most Completed Jobs',
    noProvidersFound: 'No providers yet for this service in your community.',
    requestItHere: 'Post a requirement and we will notify verified specialists nearby.',
    privacyNotice: 'Your phone number is never shared. Direct and secure in-app communication.',
    myRequests: 'My Service Requests',
    incomingRequests: 'Incoming Requests',
    upcomingJobs: 'Upcoming Scheduled Jobs',
    completedJobs: 'Completed Jobs',
    earningsSummary: 'Earnings Summary',
    accept: 'Accept Job',
    reject: 'Decline with Reason',
    markCompleted: 'Mark Completed',
    festivalGreeting: '✨ Joyful Festive Greetings from Palm Heights! ✨',
    festivalTagline: 'Celebrate harmony, community warmth, and effortless comfort with our trusted resident services.'
  },
  hi: {
    appName: 'पाम हाइट्स रेजीडेंसी',
    tagline: 'प्रीमियम अपार्टमेंट जीवन और विश्वसनीय सामुदायिक सेवाएं',
    home: 'होम',
    services: 'सेवाएं',
    requests: 'मेरे अनुरोध',
    requirements: 'आवश्यकताएं (हायर करें)',
    messages: 'संदेश',
    dashboard: 'डैशबोर्ड',
    admin: 'प्रशासन पोर्टल',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    searchPlaceholder: 'प्लंबर, इलेक्ट्रीशियन, कार वॉश, सफाई खोजें...',
    offerService: 'सेवा प्रदान करें',
    postRequirement: 'आवश्यकता पोस्ट करें',
    popularNearYou: 'आपके पास लोकप्रिय सत्यापित सेवा प्रदाता',
    communityNotices: 'सोसायटी सूचनाएं और समाचार',
    verifiedResident: 'सत्यापित निवासी',
    verifiedProvider: 'सत्यापित प्रदाता',
    requestService: 'सेवा का अनुरोध करें',
    viewProfile: 'प्रोफाइल देखें',
    startingFrom: 'शुरुआती कीमत',
    jobsCompleted: 'कार्य पूर्ण',
    rating: 'रेटिंग',
    allCategories: 'सभी श्रेणियां',
    filterBy: 'फ़िल्टर करें',
    sortBy: 'क्रमबद्ध करें',
    highestRated: 'सर्वोच्च रेटिंग',
    lowestPrice: 'न्यूनतम मूल्य',
    mostJobs: 'सबसे अधिक कार्य',
    noProvidersFound: 'इस श्रेणी में अभी कोई प्रदाता उपलब्ध नहीं है।',
    requestItHere: 'अपनी आवश्यकता पोस्ट करें, हम सत्यापित विशेषज्ञों को सूचित करेंगे।',
    privacyNotice: 'आपका फोन नंबर कभी साझा नहीं किया जाता। ऐप के अंदर सुरक्षित चैट करें।',
    myRequests: 'मेरे सेवा अनुरोध',
    incomingRequests: 'आने वाले अनुरोध',
    upcomingJobs: 'आगामी कार्य',
    completedJobs: 'पूर्ण किए गए कार्य',
    earningsSummary: 'कमाई का विवरण',
    accept: 'स्वीकार करें',
    reject: 'कारण सहित अस्वीकार करें',
    markCompleted: 'पूर्ण चिह्नित करें',
    festivalGreeting: '✨ पाम हाइट्स की ओर से उत्सव की हार्दिक शुभकामनाएं! ✨',
    festivalTagline: 'पारिवारिक सौहार्द और भरोसेमंद सामुदायिक सेवाओं के साथ उत्सव का आनंद लें।'
  },
  kn: {
    appName: 'ಪಾಮ್ ಹೈಟ್ಸ್ ರೆಸಿಡೆನ್ಸೀಸ್',
    tagline: 'ಉನ್ನತ ಅಪಾರ್ಟ್‌ಮೆಂಟ್ ಜೀವನ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಸಮುದಾಯ ಸೇವೆಗಳು',
    home: 'ಮುಖಪುಟ',
    services: 'ಸೇವೆಗಳು',
    requests: 'ನನ್ನ ವಿನಂತಿಗಳು',
    requirements: 'ಅಗತ್ಯತೆಗಳು (ನೇಮಕಾತಿ)',
    messages: 'ಸಂದೇಶಗಳು',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    admin: 'ಆಡಳಿತ ಪೋರ್ಟಲ್',
    login: 'ಲಾಗಿನ್ ಮಾಡಿ',
    logout: 'ಲಾಗ್ ಔಟ್',
    searchPlaceholder: 'ಪ್ಲಂಬರ್, ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ಕಾರ್ ವಾಶ್, ಕ್ಲೀನಿಂಗ್ ಹುಡುಕಿ...',
    offerService: 'ಸೇವೆ ನೀಡಿ',
    postRequirement: 'ಅಗತ್ಯತೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ',
    popularNearYou: 'ನಿಮ್ಮ ಬಳಿ ಜನಪ್ರಿಯ ಪರಿಶೀಲಿಸಿದ ಸೇವಾ ಪೂರೈಕೆದಾರರು',
    communityNotices: 'ಸಮುದಾಯ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ನವೀಕರಣಗಳು',
    verifiedResident: 'ಪರಿಶೀಲಿತ ನಿವಾಸಿ',
    verifiedProvider: 'ಪರಿಶೀಲಿತ ಪೂರೈಕೆದಾರ',
    requestService: 'ಸೇವೆಯನ್ನು ವಿನಂತಿಸಿ',
    viewProfile: 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
    startingFrom: 'ಆರಂಭಿಕ ದರ',
    jobsCompleted: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು',
    rating: 'ರೇಟಿಂಗ್',
    allCategories: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
    filterBy: 'ಫಿಲ್ಟರ್ ಮಾಡಿ',
    sortBy: 'ವಿಂಗಡಿಸಿ',
    highestRated: 'ಅತ್ಯುನ್ನತ ರೇಟಿಂಗ್',
    lowestPrice: 'ಕನಿಷ್ಠ ಆರಂಭಿಕ ಬೆಲೆ',
    mostJobs: 'ಹೆಚ್ಚು ಕೆಲಸ ಮಾಡಿದವರು',
    noProvidersFound: 'ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ಈ ಸೇವೆಗೆ ಇನ್ನೂ ಯಾವುದೇ ಪೂರೈಕೆದಾರರಿಲ್ಲ.',
    requestItHere: 'ಅಗತ್ಯತೆಯನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ, ನಾವು ಪರಿಶೀಲಿಸಿದ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.',
    privacyNotice: 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ. ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತ ಚಾಟ್ ಮಾಡಿ.',
    myRequests: 'ನನ್ನ ಸೇವಾ ವಿನಂತಿಗಳು',
    incomingRequests: 'ಬರುವ ವಿನಂತಿಗಳು',
    upcomingJobs: 'ಮುಂಬರುವ ನಿಗದಿತ ಕೆಲಸಗಳು',
    completedJobs: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು',
    earningsSummary: 'ಗಳಿಕೆಯ ಸಾರಾಂಶ',
    accept: 'ಸ್ವೀಕರಿಸಿ',
    reject: 'ಕಾರಣ ನೀಡಿ ತಿರಸ್ಕರಿಸಿ',
    markCompleted: 'ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    festivalGreeting: '✨ ಪಾಮ್ ಹೈಟ್ಸ್ ವತಿಯಿಂದ ಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ✨',
    festivalTagline: 'ವಿಶ್ವಾಸಾರ್ಹ ಸಮುದಾಯ ಸೇವೆಗಳೊಂದಿಗೆ ಹಬ್ಬದ ಸಡಗರವನ್ನು ಆಚರಿಸಿ.'
  }
};
