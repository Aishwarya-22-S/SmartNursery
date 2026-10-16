import { createContext, useState, useEffect } from 'react'
import { authenticate, signInWithGoogle, restoreSession, logoutOnServer } from '../services/authService.js'
import { api, getToken, setToken } from '../services/api.js'

// AppContext - global store for user/session, cart, wishlist, notifications,
// orders, and the global Settings system: theme, font size, language and
// accent color. Demonstrates: useContext (consumed app-wide).
//
// Cart/wishlist/notifications/orders/settings are now backed by the
// Express + MongoDB API (see /server) instead of hard-coded demo arrays -
// every mutating function below calls the backend and then updates local
// state from the response, so MongoDB stays the source of truth. Guests
// (not logged in) still get a working, purely client-side cart/wishlist so
// browsing the catalog before logging in behaves the same as before.
export const AppContext = createContext(null)

// Shown before any login happens - role: null so canAccess() always denies
// protected routes until a real login sets a real role.
const guestUser = {
  name: 'Guest',
  email: '',
  role: null,
  phone: '',
  rewardPoints: 0,
}

const translations = {
  en: {
    home: 'Home',
    plants: 'Plants',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    welcomeBack: 'Welcome Back!',
    adminDashboard: 'Admin Dashboard',
    staffDashboard: 'Staff Dashboard',
    customerDashboard: 'Customer Dashboard',
    plantCatalog: 'Plant Catalog',
    plantDetails: 'Plant Details',
    diseaseDetection: 'AI Disease Detection',
    plantHealth: 'Plant Health Monitoring',
    careGuide: 'Plant Care Guide',
    inventory: 'Inventory Management',
    paymentVerification: 'Payment Verification',
    orderHistory: 'Previous Orders',
    cart: 'Shopping Cart',
    checkout: 'Checkout & Payment',
    orderTracking: 'Order Tracking',
    wishlist: 'Wishlist',
    notifications: 'Notifications',
    chatbot: 'AI Plant Care Chatbot',
    iot: 'IoT Sensor Dashboard',
    analytics: 'Analytics & Reports',
    settings: 'Settings',
    profile: 'Profile',
    fontSize: 'Font Size',
    language: 'Language',
    logout: 'Logout',
    search: 'Search',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    choosePlantSize: 'Choose a plant size',
    addedToCart: 'Added to Cart',
    adminToolsTitle: 'Find a management page',
    adminToolsSubtitle: 'Search to open the part of your nursery you want to manage.',
    adminToolsPlaceholder: 'Search plants, payments, reports, plant health…',
    adminOverviewSubtitle: 'Overview of your nursery business',
    adminBusinessSummary: 'Business summary',
    adminTotalUsers: 'Total Users',
    adminTotalPlants: 'Total Plants',
    adminTotalOrders: 'Total Orders',
    adminRevenue: 'Revenue',
    adminSalesOverview: 'Sales Overview',
    adminThisMonth: 'This Month',
    adminVerifiedSalesThisMonth: 'verified sales this month',
    adminNoSalesThisMonth: 'No verified sales this month yet.',
    adminRecentOrders: 'Recent Orders',
    adminNoOrders: 'No orders have been placed yet.',
    adminPlantOrder: 'Plant order',
    english: 'English',
    tamil: 'Tamil',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    accentColor: 'Theme Color',
    colorGreen: 'Green',
    colorBlue: 'Blue',
    colorPurple: 'Purple',
    colorOrange: 'Orange',
    colorRed: 'Red',
    colorTeal: 'Teal',
    viewAll: 'View All',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    edit: 'Edit',
    delete: 'Delete',
    remove: 'Remove',
    change: 'Change',
    quantity: 'Quantity',
    price: 'Price',
    category: 'Category',
    status: 'Status',
    action: 'Action',
    total: 'Total',
    subtotal: 'Subtotal',
    yesterday: 'Yesterday',
    statusDelivered: 'Delivered',
    statusProcessing: 'Processing',
    statusDone: 'Done',
    statusPending: 'Pending',
    statusGood: 'Good',
    statusModerate: 'Moderate',
    statusNormal: 'Normal',
    statusLow: 'Low',
    statusInStock: 'In Stock',
    statusLowStock: 'Low Stock',
    statusOutOfStock: 'Out of Stock',
    tagPopular: 'Popular',
    tagBestSeller: 'Best Seller',
    tagNew: 'New',
    aboutHeading: 'About GreenLeaf Nursery',
    aboutText1: 'GreenLeaf Nursery is a smart nursery management platform that brings together plant shopping, AI-assisted plant health monitoring, and simple IoT-style sensor dashboards in one place. This demo showcases the UI and React Hooks behind a nursery management and plant health monitoring system.',
    aboutText2: 'Founded with a love for houseplants and a passion for technology, our mission is to make plant care simple, data-driven and enjoyable for everyone - from first-time plant owners to experienced growers.',
    contactHeading: 'Contact Us',
    contactSubtitle: 'We\'d love to hear from you. Send us a message below.',
    contactSent: 'Message sent! We\'ll get back to you soon.',
    contactName: 'Name',
    contactEmail: 'Email',
    contactMessage: 'Message',
    contactSend: 'Send Message',
    loginSubtitle: 'Login to your account',
    loginEmailLabel: 'Email or Phone',
    loginPasswordLabel: 'Password',
    loginRemember: 'Remember Me',
    loginForgot: 'Forgot Password?',
    loginButton: 'Login',
    loginDemoNote: 'Demo credentials:',
    loginInvalid: 'Invalid email or password. Try admin@greenleaf.com / 123456',
    homeWelcomeTo: 'Welcome to',
    homeBrand: 'GreenLeaf Nursery',
    homeTagline: 'Healthy Plants, Happy Life. Your one-stop solution for quality plants and smart plant care.',
    homeShopNow: 'Shop Now',
    homeExplore: 'Explore Plants',
    homeMenuOpen: 'Menu is open (demo state)',
    homeWhyChoose: 'Why Choose GreenLeaf?',
    homeFeature1Title: 'Wide Variety',
    homeFeature1Sub: 'of Plants',
    homeFeature2Title: 'Expert',
    homeFeature2Sub: 'Care Guidance',
    homeFeature3Title: 'AI Plant',
    homeFeature3Sub: 'Health Check',
    homeFeature4Title: 'Fast &',
    homeFeature4Sub: 'Safe Delivery',
    homeToggleBanner: 'Toggle Promo Banner (useState demo)',
    homeFooter: '© 2024 GreenLeaf Nursery. All rights reserved.',
    profileName: 'Name',
    profileEmail: 'Email',
    profileRole: 'Role',
    profilePhone: 'Phone',
    profileEdit: 'Edit Profile',
    profileSave: 'Save Changes',
    adminSubtitle: 'Overview of your nursery business',
    loadingDashboard: 'Loading dashboard data...',
    statTotalUsers: 'Total Users',
    statTotalPlants: 'Total Plants',
    statTotalOrders: 'Total Orders',
    statRevenue: 'Revenue',
    salesOverview: 'Sales Overview',
    thisMonth: 'This Month',
    recentOrders: 'Recent Orders',
    staffHello: 'Hello, Staff!',
    staffSubtitle: 'Here\'s your today\'s overview',
    statMyTasks: 'My Tasks',
    statPlants: 'Plants',
    statWateringToday: 'Watering Today',
    statPendingTasks: 'Pending Tasks',
    todaysSchedule: 'Today\'s Schedule',
    taskWatering: 'Watering – Nursery A',
    taskFertilizer: 'Fertilizer – Section B',
    taskHealthCheck: 'Check Plant Health',
    taskUpdateInventory: 'Update Inventory',
    customerWelcome: 'Welcome,',
    customerSubtitle: 'Let\'s make your world greener',
    statMyOrders: 'My Orders',
    statWishlist: 'Wishlist',
    statRewards: 'Rewards',
    recommendedForYou: 'Recommended for You',
    cartSummary: 'Cart Summary',
    catalogTitle: 'Plant Catalog',
    catalogPlantsFound: 'plants found',
    searchPlaceholderCatalog: 'Search plants, categories...',
    catAll: 'All Plants',
    catIndoor: 'Indoor Plants',
    catOutdoor: 'Outdoor Plants',
    catSucculents: 'Succulents',
    catFlowering: 'Flowering Plants',
    catFruit: 'Fruit Plants',
    catAir: 'Air Purifiers',
    noPlantsMatch: 'No plants match your search.',
    reviewsLabel: 'reviews',
    plantDetailsDescription: 'Peace Lily is an air-purifying plant that brings peace and positivity.',
    labelSunlight: 'Sunlight',
    labelWater: 'Water',
    labelCareLevel: 'Care Level',
    labelHeight: 'Height',
    careEasy: 'Easy',
    sunLowIndirect: 'Low to Indirect',
    waterFreq: '2-3 times / week',
    uploadLeafImage: 'Upload Leaf Image',
    aiWillDetect: 'Our AI will detect possible diseases',
    dragDrop: 'Drag & Drop your image here',
    orText: 'or',
    browseFile: 'Browse File',
    analyzing: 'Analyzing image...',
    recentDetections: 'Recent Detections',
    viewResult: 'View Result',
    accuracyLabel: 'Accuracy',
    overallHealth: 'Overall Health',
    tabOverview: 'Overview',
    tabHistory: 'History',
    tabAlerts: 'Alerts',
    healthScore: 'Health Score',
    growthLabel: 'Growth',
    waterLevelLabel: 'Water Level',
    soilMoistureLabel: 'Soil Moisture',
    historyPlaceholder: 'Health history chart placeholder (dummy data).',
    noActiveAlerts: 'No active alerts for this plant.',
    careGuideTitle: 'Plant Care Guide',
    careWatering: 'Watering',
    careSunlight: 'Sunlight',
    careFertilizer: 'Fertilizer',
    carePruning: 'Pruning',
    carePest: 'Pest Control',
    careSeason: 'Seasonal Care',
    careWateringText: 'Water when top soil is dry to the touch, roughly once or twice a week.',
    careSunlightText: 'Bright, indirect light works best. Avoid harsh direct afternoon sun.',
    careFertilizerText: 'Feed once a month during the growing season with a balanced fertilizer.',
    carePruningText: 'Trim yellow or damaged leaves regularly to encourage healthy growth.',
    carePestText: 'Check the underside of leaves for pests weekly and treat early.',
    careSeasonText: 'Reduce watering in winter and repot in early spring for best results.',
    carePlantDesc: 'A tropical plant known for its unique leaves and easy maintenance.',
    inventoryTitle: 'Inventory Management',
    inventorySubtitle: 'Track stock levels across all plants',
    stockList: 'Stock List',
    addPlant: '+ Add Plant',
    thPlantName: 'Plant Name',
    thCategory: 'Category',
    thStock: 'Stock',
    thStatus: 'Status',
    thPrice: 'Price',
    thAction: 'Action',
    shoppingCartTitle: 'Shopping Cart',
    cartEmpty: 'Your cart is empty.',
    browsePlants: 'Browse plants',
    thPlant: 'Plant',
    thQuantity: 'Quantity',
    thTotal: 'Total',
    orderSummary: 'Order Summary',
    proceedCheckout: 'Proceed to Checkout',
    checkoutTitle: 'Checkout & Payment',
    deliveryAddress: 'Delivery Address',
    fullNameLabel: 'Full Name',
    streetAddressLabel: 'Street Address',
    statePinLabel: 'State / PIN',
    phoneLabel: 'Phone',
    paymentMethod: 'Payment Method',
    deliveryCharges: 'Delivery Charges',
    totalAmount: 'Total Amount',
    placeOrder: 'Place Order',
    orderHash: 'Order',
    statusTimeline: 'Status Timeline',
    orderOnWay: 'Your order is on its way!',
    stagePlaced: 'Order Placed',
    stageConfirmed: 'Order Confirmed',
    stagePacked: 'Packed',
    stageTransit: 'In Transit',
    stageOutDelivery: 'Out for Delivery',
    stageDelivered: 'Delivered',
    stageCancelled: 'Cancelled',
    myWishlist: 'My Wishlist',
    wishlistEmpty: 'Your wishlist is empty.',
    moveAllToCart: 'Move All to Cart',
    notificationsCenter: 'Notifications Center',
    tabAll: 'All',
    tabReminders: 'Reminders',
    tabOrders: 'Orders',
    tabOffers: 'Offers',
    markAllRead: 'Mark all as read',
    notifWateringTitle: 'Watering Reminder',
    notifWateringMsg: 'Water your plant Aloe Vera',
    notifOrderTitle: 'Order Update',
    notifOrderMsg: 'Your order #1025 is in transit',
    notifAiTitle: 'AI Alert',
    notifAiMsg: 'Early blight detected in Tomato',
    notifOfferTitle: 'New Offer',
    notifOfferMsg: 'Flat 20% off on all plants!',
    notifSystemTitle: 'System Update',
    notifSystemMsg: 'Inventory updated successfully.',
    greenleafBot: 'GreenLeaf Bot',
    aiAssistantSub: 'Your AI Plant Care Assistant',
    typeMessage: 'Type your message...',
    yesPlease: 'Yes, please',
    noThanks: 'No, thanks',
    botGreeting: 'Hello! I\'m your Plant Care Assistant. How can I help you today?',
    userQ1: 'Why are my plant leaves turning yellow?',
    botA1: 'Yellow leaves can be due to overwatering, poor drainage, or lack of sunlight. Would you like care tips for your plant?',
    botThanks: 'Thanks for your question! Keep soil moist but not soggy, and ensure indirect sunlight for best results.',
    iotTitle: 'IoT Sensor Dashboard',
    sensorTemperature: 'Temperature',
    sensorHumidity: 'Humidity',
    sensorLight: 'Light Intensity',
    sensorAirQuality: 'Air Quality',
    sensorHistory: 'Sensor History (24 Hrs)',
    analyticsTitle: 'Analytics & Reports Dashboard',
    analyticsSubtitle: 'Business performance overview',
    periodThisMonth: 'This Month',
    periodLastMonth: 'Last Month',
    periodThisYear: 'This Year',
    loadingAnalytics: 'Loading analytics...',
    statTotalSales: 'Total Sales',
    statNewCustomers: 'New Customers',
    statBestSelling: 'Best Selling',
    salesTrend: 'Sales Trend',
    topSellingPlants: 'Top Selling Plants',
    viewFullReport: 'View Full Report',
  },
  ta: {
    home: 'முகப்பு',
    plants: 'தாவரங்கள்',
    about: 'எங்களைப் பற்றி',
    contact: 'தொடர்பு',
    login: 'உள்நுழைய',
    welcomeBack: 'மீண்டும் வருக!',
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    staffDashboard: 'பணியாளர் டாஷ்போர்டு',
    customerDashboard: 'வாடிக்கையாளர் டாஷ்போர்டு',
    plantCatalog: 'தாவர பட்டியல்',
    plantDetails: 'தாவர விவரங்கள்',
    diseaseDetection: 'AI நோய் கண்டறிதல்',
    plantHealth: 'தாவர ஆரோக்கியம்',
    careGuide: 'பராமரிப்பு வழிகாட்டி',
    inventory: 'சரக்கு மேலாண்மை',
    paymentVerification: 'பணம் சரிபார்ப்பு',
    orderHistory: 'முந்தைய ஆர்டர்கள்',
    cart: 'வணிக கூடை',
    checkout: 'செக்அவுட் & பணம்',
    orderTracking: 'ஆர்டர் கண்காணிப்பு',
    wishlist: 'விருப்பப் பட்டியல்',
    notifications: 'அறிவிப்புகள்',
    chatbot: 'AI உதவியாளர்',
    iot: 'IoT சென்சார் டாஷ்போர்டு',
    analytics: 'பகுப்பாய்வு அறிக்கைகள்',
    settings: 'அமைப்புகள்',
    profile: 'சுயவிவரம்',
    fontSize: 'எழுத்து அளவு',
    language: 'மொழி',
    logout: 'வெளியேறு',
    search: 'தேடல்',
    small: 'சிறியது',
    medium: 'நடுத்தரம்',
    large: 'பெரியது',
    choosePlantSize: 'தாவர அளவைத் தேர்ந்தெடுக்கவும்',
    addedToCart: 'கூடையில் சேர்க்கப்பட்டது',
    adminToolsTitle: 'நிர்வாகப் பக்கத்தைத் தேடுங்கள்',
    adminToolsSubtitle: 'நீங்கள் நிர்வகிக்க வேண்டிய பகுதியைத் தேடித் திறக்கவும்.',
    adminToolsPlaceholder: 'தாவரங்கள், பணம், அறிக்கைகள், ஆரோக்கியம் எனத் தேடுங்கள்…',
    adminOverviewSubtitle: 'உங்கள் நர்சரி வணிகத்தின் கண்ணோட்டம்',
    adminBusinessSummary: 'வணிகச் சுருக்கம்',
    adminTotalUsers: 'மொத்த பயனர்கள்',
    adminTotalPlants: 'மொத்த தாவரங்கள்',
    adminTotalOrders: 'மொத்த ஆர்டர்கள்',
    adminRevenue: 'வருவாய்',
    adminSalesOverview: 'விற்பனை கண்ணோட்டம்',
    adminThisMonth: 'இந்த மாதம்',
    adminVerifiedSalesThisMonth: 'இந்த மாத உறுதிசெய்யப்பட்ட விற்பனை',
    adminNoSalesThisMonth: 'இந்த மாதம் உறுதிசெய்யப்பட்ட விற்பனை இல்லை.',
    adminRecentOrders: 'சமீபத்திய ஆர்டர்கள்',
    adminNoOrders: 'இன்னும் ஆர்டர்கள் எதுவும் இல்லை.',
    adminPlantOrder: 'தாவர ஆர்டர்',
    english: 'English',
    tamil: 'தமிழ்',
    theme: 'தீம்',
    lightMode: 'வெளிச்ச பயன்முறை',
    darkMode: 'இருள் பயன்முறை',
    accentColor: 'தீம் நிறம்',
    colorGreen: 'பச்சை',
    colorBlue: 'நீலம்',
    colorPurple: 'ஊதா',
    colorOrange: 'ஆரஞ்சு',
    colorRed: 'சிவப்பு',
    colorTeal: 'டீல்',
    viewAll: 'அனைத்தையும் காண்க',
    addToCart: 'கூடையில் சேர்',
    buyNow: 'இப்போது வாங்கு',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    remove: 'அகற்று',
    change: 'மாற்று',
    quantity: 'அளவு',
    price: 'விலை',
    category: 'வகை',
    status: 'நிலை',
    action: 'செயல்',
    total: 'மொத்தம்',
    subtotal: 'துணை மொத்தம்',
    yesterday: 'நேற்று',
    statusDelivered: 'டெலிவரி செய்யப்பட்டது',
    statusProcessing: 'செயலாக்கத்தில்',
    statusDone: 'முடிந்தது',
    statusPending: 'நிலுவையில்',
    statusGood: 'நல்லது',
    statusModerate: 'மிதமான',
    statusNormal: 'இயல்பானது',
    statusLow: 'குறைவு',
    statusInStock: 'இருப்பில் உள்ளது',
    statusLowStock: 'குறைந்த இருப்பு',
    statusOutOfStock: 'இருப்பு இல்லை',
    tagPopular: 'பிரபலமானது',
    tagBestSeller: 'சிறந்த விற்பனை',
    tagNew: 'புதியது',
    aboutHeading: 'GreenLeaf நர்சரி பற்றி',
    aboutText1: 'GreenLeaf நர்சரி என்பது தாவர கொள்முதல், AI உதவியுடன் தாவர ஆரோக்கிய கண்காணிப்பு மற்றும் எளிய IoT பாணி சென்சார் டாஷ்போர்டுகளை ஒன்றிணைக்கும் ஸ்மார்ட் நர்சரி மேலாண்மை தளம். இந்த டெமோ நர்சரி மேலாண்மை மற்றும் தாவர ஆரோக்கிய கண்காணிப்பு அமைப்பின் UI மற்றும் React Hooks-ஐ வெளிப்படுத்துகிறது.',
    aboutText2: 'வீட்டு தாவரங்கள் மீதான அன்பு மற்றும் தொழில்நுட்பத்தின் மீதான ஆர்வத்துடன் தொடங்கப்பட்ட எங்கள் நோக்கம், தாவர பராமரிப்பை எளிமையாகவும், தரவு அடிப்படையிலும், அனைவருக்கும் மகிழ்ச்சியானதாகவும் மாற்றுவதே.',
    contactHeading: 'எங்களை தொடர்பு கொள்ளுங்கள்',
    contactSubtitle: 'உங்களிடமிருந்து கேட்க விரும்புகிறோம். கீழே ஒரு செய்தி அனுப்புங்கள்.',
    contactSent: 'செய்தி அனுப்பப்பட்டது! விரைவில் உங்களைத் தொடர்புகொள்வோம்.',
    contactName: 'பெயர்',
    contactEmail: 'மின்னஞ்சல்',
    contactMessage: 'செய்தி',
    contactSend: 'செய்தி அனுப்பவும்',
    loginSubtitle: 'உங்கள் கணக்கில் உள்நுழையவும்',
    loginEmailLabel: 'மின்னஞ்சல் அல்லது தொலைபேசி',
    loginPasswordLabel: 'கடவுச்சொல்',
    loginRemember: 'என்னை நினைவில் வை',
    loginForgot: 'கடவுச்சொல் மறந்துவிட்டதா?',
    loginButton: 'உள்நுழைய',
    loginDemoNote: 'டெமோ சான்றுகள்:',
    loginInvalid: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். admin@greenleaf.com / 123456 முயற்சிக்கவும்',
    homeWelcomeTo: 'வரவேற்கிறோம்',
    homeBrand: 'GreenLeaf நர்சரி',
    homeTagline: 'ஆரோக்கியமான தாவரங்கள், மகிழ்ச்சியான வாழ்க்கை. தரமான தாவரங்கள் மற்றும் ஸ்மார்ட் தாவர பராமரிப்புக்கான உங்கள் ஒரே தீர்வு.',
    homeShopNow: 'இப்போது வாங்க',
    homeExplore: 'தாவரங்களை ஆராயுங்கள்',
    homeMenuOpen: 'மெனு திறந்துள்ளது (டெமோ நிலை)',
    homeWhyChoose: 'ஏன் GreenLeaf-ஐ தேர்வு செய்ய வேண்டும்?',
    homeFeature1Title: 'பல வகைகள்',
    homeFeature1Sub: 'தாவரங்கள்',
    homeFeature2Title: 'நிபுணர்',
    homeFeature2Sub: 'பராமரிப்பு வழிகாட்டுதல்',
    homeFeature3Title: 'AI தாவர',
    homeFeature3Sub: 'ஆரோக்கிய பரிசோதனை',
    homeFeature4Title: 'வேகமான &',
    homeFeature4Sub: 'பாதுகாப்பான டெலிவரி',
    homeToggleBanner: 'விளம்பர பேனரை மாற்று (useState டெமோ)',
    homeFooter: '© 2024 GreenLeaf நர்சரி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    profileName: 'பெயர்',
    profileEmail: 'மின்னஞ்சல்',
    profileRole: 'பங்கு',
    profilePhone: 'தொலைபேசி',
    profileEdit: 'சுயவிவரத்தைத் திருத்து',
    profileSave: 'மாற்றங்களை சேமி',
    adminSubtitle: 'உங்கள் நர்சரி வணிகத்தின் மேலோட்டம்',
    loadingDashboard: 'டாஷ்போர்டு தரவு ஏற்றப்படுகிறது...',
    statTotalUsers: 'மொத்த பயனர்கள்',
    statTotalPlants: 'மொத்த தாவரங்கள்',
    statTotalOrders: 'மொத்த ஆர்டர்கள்',
    statRevenue: 'வருவாய்',
    salesOverview: 'விற்பனை மேலோட்டம்',
    thisMonth: 'இந்த மாதம்',
    recentOrders: 'சமீபத்திய ஆர்டர்கள்',
    staffHello: 'வணக்கம், பணியாளரே!',
    staffSubtitle: 'இன்றைய உங்கள் மேலோட்டம்',
    statMyTasks: 'எனது பணிகள்',
    statPlants: 'தாவரங்கள்',
    statWateringToday: 'இன்று நீர்ப்பாசனம்',
    statPendingTasks: 'நிலுவையிலுள்ள பணிகள்',
    todaysSchedule: 'இன்றைய அட்டவணை',
    taskWatering: 'நீர்ப்பாசனம் – நர்சரி A',
    taskFertilizer: 'உரம் – பிரிவு B',
    taskHealthCheck: 'தாவர ஆரோக்கியத்தை சரிபார்க்கவும்',
    taskUpdateInventory: 'சரக்கை புதுப்பிக்கவும்',
    customerWelcome: 'வரவேற்கிறோம்,',
    customerSubtitle: 'உங்கள் உலகை பசுமையாக்குவோம்',
    statMyOrders: 'எனது ஆர்டர்கள்',
    statWishlist: 'விருப்பப் பட்டியல்',
    statRewards: 'வெகுமதிகள்',
    recommendedForYou: 'உங்களுக்கு பரிந்துரைக்கப்படுகிறது',
    cartSummary: 'கூடை சுருக்கம்',
    catalogTitle: 'தாவர பட்டியல்',
    catalogPlantsFound: 'தாவரங்கள் கிடைத்தன',
    searchPlaceholderCatalog: 'தாவரங்கள், வகைகளைத் தேடுங்கள்...',
    catAll: 'அனைத்து தாவரங்கள்',
    catIndoor: 'உட்புற தாவரங்கள்',
    catOutdoor: 'வெளிப்புற தாவரங்கள்',
    catSucculents: 'சுக்குலண்ட்ஸ்',
    catFlowering: 'பூக்கும் தாவரங்கள்',
    catFruit: 'பழ தாவரங்கள்',
    catAir: 'காற்று சுத்திகரிப்பாளர்கள்',
    noPlantsMatch: 'உங்கள் தேடலுக்கு பொருந்தும் தாவரங்கள் இல்லை.',
    reviewsLabel: 'மதிப்புரைகள்',
    plantDetailsDescription: 'பீஸ் லில்லி என்பது அமைதி மற்றும் நேர்மறையை தரும் காற்று சுத்திகரிக்கும் தாவரம்.',
    labelSunlight: 'சூரிய ஒளி',
    labelWater: 'நீர்',
    labelCareLevel: 'பராமரிப்பு நிலை',
    labelHeight: 'உயரம்',
    careEasy: 'எளிது',
    sunLowIndirect: 'குறைந்த மறைமுக ஒளி',
    waterFreq: 'வாரத்திற்கு 2-3 முறை',
    uploadLeafImage: 'இலை படத்தை பதிவேற்றவும்',
    aiWillDetect: 'எங்கள் AI சாத்தியமான நோய்களைக் கண்டறியும்',
    dragDrop: 'உங்கள் படத்தை இங்கே இழுத்து விடவும்',
    orText: 'அல்லது',
    browseFile: 'கோப்பை உலாவவும்',
    analyzing: 'படம் பகுப்பாய்வு செய்யப்படுகிறது...',
    recentDetections: 'சமீபத்திய கண்டறிதல்கள்',
    viewResult: 'முடிவைக் காண்க',
    accuracyLabel: 'துல்லியம்',
    overallHealth: 'ஒட்டுமொத்த ஆரோக்கியம்',
    tabOverview: 'மேலோட்டம்',
    tabHistory: 'வரலாறு',
    tabAlerts: 'எச்சரிக்கைகள்',
    healthScore: 'ஆரோக்கிய மதிப்பெண்',
    growthLabel: 'வளர்ச்சி',
    waterLevelLabel: 'நீர் மட்டம்',
    soilMoistureLabel: 'மண் ஈரப்பதம்',
    historyPlaceholder: 'ஆரோக்கிய வரலாறு விளக்கப்படம் (மாதிரி தரவு).',
    noActiveAlerts: 'இந்த தாவரத்திற்கு செயலில் எச்சரிக்கைகள் இல்லை.',
    careGuideTitle: 'தாவர பராமரிப்பு வழிகாட்டி',
    careWatering: 'நீர்ப்பாசனம்',
    careSunlight: 'சூரிய ஒளி',
    careFertilizer: 'உரம்',
    carePruning: 'கத்தரித்தல்',
    carePest: 'பூச்சி கட்டுப்பாடு',
    careSeason: 'பருவகால பராமரிப்பு',
    careWateringText: 'மேல் மண் தொட்டால் உலர்ந்திருக்கும் போது நீர் ஊற்றவும், வாரத்திற்கு ஒன்று அல்லது இரண்டு முறை.',
    careSunlightText: 'பிரகாசமான, மறைமுக ஒளி சிறந்தது. கடுமையான நேரடி மதிய சூரிய ஒளியை தவிர்க்கவும்.',
    careFertilizerText: 'வளரும் பருவத்தில் மாதம் ஒரு முறை சமச்சீர் உரத்துடன் ஊட்டவும்.',
    carePruningText: 'ஆரோக்கியமான வளர்ச்சியை ஊக்குவிக்க மஞ்சள் அல்லது சேதமடைந்த இலைகளை தவறாமல் கத்தரிக்கவும்.',
    carePestText: 'பூச்சிகளுக்காக இலைகளின் அடிப்பகுதியை வாரந்தோறும் சரிபார்த்து சீக்கிரம் சிகிச்சை அளிக்கவும்.',
    careSeasonText: 'குளிர்காலத்தில் நீர்ப்பாசனத்தை குறைத்து, வசந்த காலத்தின் தொடக்கத்தில் மறுநடவு செய்யவும்.',
    carePlantDesc: 'தனித்துவமான இலைகள் மற்றும் எளிதான பராமரிப்புக்கு பெயர் பெற்ற வெப்பமண்டல தாவரம்.',
    inventoryTitle: 'சரக்கு மேலாண்மை',
    inventorySubtitle: 'அனைத்து தாவரங்களின் இருப்பு நிலைகளைக் கண்காணிக்கவும்',
    stockList: 'இருப்பு பட்டியல்',
    addPlant: '+ தாவரம் சேர்',
    thPlantName: 'தாவர பெயர்',
    thCategory: 'வகை',
    thStock: 'இருப்பு',
    thStatus: 'நிலை',
    thPrice: 'விலை',
    thAction: 'செயல்',
    shoppingCartTitle: 'வணிக கூடை',
    cartEmpty: 'உங்கள் கூடை காலியாக உள்ளது.',
    browsePlants: 'தாவரங்களை உலாவவும்',
    thPlant: 'தாவரம்',
    thQuantity: 'அளவு',
    thTotal: 'மொத்தம்',
    orderSummary: 'ஆர்டர் சுருக்கம்',
    proceedCheckout: 'செக்அவுட்டிற்கு தொடரவும்',
    checkoutTitle: 'செக்அவுட் & பணம்',
    deliveryAddress: 'டெலிவரி முகவரி',
    fullNameLabel: 'முழு பெயர்',
    streetAddressLabel: 'தெரு முகவரி',
    statePinLabel: 'மாநிலம் / பின்கோட்',
    phoneLabel: 'தொலைபேசி',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    deliveryCharges: 'டெலிவரி கட்டணம்',
    totalAmount: 'மொத்த தொகை',
    placeOrder: 'ஆர்டர் செய்யவும்',
    orderHash: 'ஆர்டர்',
    statusTimeline: 'நிலை காலவரிசை',
    orderOnWay: 'உங்கள் ஆர்டர் வந்து கொண்டிருக்கிறது!',
    stagePlaced: 'ஆர்டர் செய்யப்பட்டது',
    stageConfirmed: 'ஆர்டர் உறுதிப்படுத்தப்பட்டது',
    stagePacked: 'பேக் செய்யப்பட்டது',
    stageTransit: 'போக்குவரத்தில்',
    stageOutDelivery: 'டெலிவரிக்கு புறப்பட்டது',
    stageDelivered: 'டெலிவரி செய்யப்பட்டது',
    stageCancelled: 'ரத்து செய்யப்பட்டது',
    myWishlist: 'எனது விருப்பப் பட்டியல்',
    wishlistEmpty: 'உங்கள் விருப்பப் பட்டியல் காலியாக உள்ளது.',
    moveAllToCart: 'அனைத்தையும் கூடைக்கு நகர்த்து',
    notificationsCenter: 'அறிவிப்பு மையம்',
    tabAll: 'அனைத்தும்',
    tabReminders: 'நினைவூட்டல்கள்',
    tabOrders: 'ஆர்டர்கள்',
    tabOffers: 'சலுகைகள்',
    markAllRead: 'அனைத்தையும் படித்ததாக குறி',
    notifWateringTitle: 'நீர்ப்பாசன நினைவூட்டல்',
    notifWateringMsg: 'உங்கள் Aloe Vera தாவரத்திற்கு நீர் ஊற்றவும்',
    notifOrderTitle: 'ஆர்டர் புதுப்பிப்பு',
    notifOrderMsg: 'உங்கள் ஆர்டர் #1025 போக்குவரத்தில் உள்ளது',
    notifAiTitle: 'AI எச்சரிக்கை',
    notifAiMsg: 'தக்காளியில் ஆரம்ப நோய் கண்டறியப்பட்டது',
    notifOfferTitle: 'புதிய சலுகை',
    notifOfferMsg: 'அனைத்து தாவரங்களுக்கும் 20% தள்ளுபடி!',
    notifSystemTitle: 'கணினி புதுப்பிப்பு',
    notifSystemMsg: 'சரக்கு வெற்றிகரமாக புதுப்பிக்கப்பட்டது.',
    greenleafBot: 'GreenLeaf போட்',
    aiAssistantSub: 'உங்கள் AI தாவர பராமரிப்பு உதவியாளர்',
    typeMessage: 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
    yesPlease: 'ஆம், தயவுசெய்து',
    noThanks: 'வேண்டாம், நன்றி',
    botGreeting: 'வணக்கம்! நான் உங்கள் தாவர பராமரிப்பு உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    userQ1: 'என் தாவர இலைகள் ஏன் மஞ்சளாக மாறுகின்றன?',
    botA1: 'அதிக நீர்ப்பாசனம், மோசமான வடிகால் அல்லது சூரிய ஒளி பற்றாக்குறையால் இலைகள் மஞ்சளாகலாம். உங்கள் தாவரத்திற்கான பராமரிப்பு குறிப்புகள் வேண்டுமா?',
    botThanks: 'உங்கள் கேள்விக்கு நன்றி! மண்ணை ஈரமாக வைத்திருங்கள் ஆனால் சேறு ஆகாமல், மற்றும் சிறந்த முடிவுகளுக்கு மறைமுக சூரிய ஒளியை உறுதி செய்யுங்கள்.',
    iotTitle: 'IoT சென்சார் டாஷ்போர்டு',
    sensorTemperature: 'வெப்பநிலை',
    sensorHumidity: 'ஈரப்பதம்',
    sensorLight: 'ஒளி தீவிரம்',
    sensorAirQuality: 'காற்றின் தரம்',
    sensorHistory: 'சென்சார் வரலாறு (24 மணி நேரம்)',
    analyticsTitle: 'பகுப்பாய்வு & அறிக்கைகள் டாஷ்போர்டு',
    analyticsSubtitle: 'வணிக செயல்திறன் மேலோட்டம்',
    periodThisMonth: 'இந்த மாதம்',
    periodLastMonth: 'கடந்த மாதம்',
    periodThisYear: 'இந்த ஆண்டு',
    loadingAnalytics: 'பகுப்பாய்வு ஏற்றப்படுகிறது...',
    statTotalSales: 'மொத்த விற்பனை',
    statNewCustomers: 'புதிய வாடிக்கையாளர்கள்',
    statBestSelling: 'சிறந்த விற்பனை',
    salesTrend: 'விற்பனை போக்கு',
    topSellingPlants: 'அதிக விற்பனையான தாவரங்கள்',
    viewFullReport: 'முழு அறிக்கையைக் காண்க',
  },
}

// Font size presets, applied app-wide via a `font-<size>` class (see below).
export const FONT_SIZES = ['small', 'medium', 'large']

// Accent color presets. Each swaps --primary / --primary-dark / --primary-light /
// --accent / --sidebar-bg app-wide via an `accent-<color>` class - see App.css.
// 'green' is the default brand color and needs no extra class.
export const ACCENT_COLORS = ['green', 'blue', 'purple', 'orange', 'red', 'teal']

// formatNotifTime - turns a Mongo createdAt timestamp into the same
// "10:00 AM" / "Yesterday" display the original hard-coded demo
// notifications used (Notifications.jsx translates the literal string
// 'Yesterday' via t('yesterday'), so that exact string is kept here).
function formatNotifTime(createdAt) {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (isYesterday) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// mapNotification / mapOrder - reshape backend documents into exactly the
// flat shape the existing components already read (notification.id,
// order.id, etc.) so no component besides AppContext needs to know the
// data now comes from MongoDB instead of a hard-coded array.
function mapNotification(n) {
  return {
    id: n._id,
    icon: n.icon,
    title: n.title || n.titleKey,
    titleKey: n.titleKey,
    message: n.message || n.msgKey,
    msgKey: n.msgKey,
    group: n.group,
    roles: n.roles,
    read: n.read,
    time: formatNotifTime(n.createdAt),
  }
}

function mapOrder(o) {
  return {
    ...o,
    id: o.orderNumber,
    _id: o._id,
  }
}

export function AppProvider({ children }) {
  // useState - holds the currently authenticated user (id, name, email, role, phone)
  const [user, setUser] = useState(guestUser)

  // useState - holds cart items shared across the app
  const [cart, setCart] = useState([])

  // useState - holds wishlist items shared across the app
  const [wishlist, setWishlist] = useState([])

  // useState - holds notification items shared across the app
  const [notifications, setNotifications] = useState([])

  // useState - holds every placed order (all roles read from this one list,
  // filtered by role/ownership where it matters - see Order History /
  // Payment Verification / Order Tracking). Admin/staff get every order
  // from the backend; customers only ever receive their own (enforced
  // server-side in orderController.getOrders).
  const [orders, setOrders] = useState([])

  // useState - holds the most recent login error, if any
  const [authError, setAuthError] = useState('')

  // ===================== TOAST (global action feedback) =====================
  // useState - a small stack of transient success/error messages so every
  // action (Add to Cart, Plant updated, Payment verified, ...) can show a
  // clear confirmation instead of leaving the user to guess whether it
  // worked. Rendered once, in RootLayout.
  const [toasts, setToasts] = useState([])
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // useState - true once the initial "is there a saved session?" check has
  // finished, so protected routes don't redirect to /login for a split
  // second while a saved token is still being verified against the backend.
  const [authChecked, setAuthChecked] = useState(false)

  // ===================== GLOBAL SETTINGS STATE =====================
  // useState - holds the current theme (light/dark)
  const [darkMode, setDarkMode] = useState(false)

  // useState - holds the current font size preference
  const [fontSize, setFontSize] = useState('medium')

  // useState - holds the current language ('en' or 'ta')
  const [language, setLanguage] = useState('en')

  // useState - holds the current accent/theme color
  const [accentColor, setAccentColor] = useState('green')

  // useState - holds the login session flag
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // applySettings - applies a Settings document fetched from the backend
  // (GET /api/settings) to the four preference states in one place.
  const applySettings = (settings) => {
    if (!settings) return
    setDarkMode(settings.theme === 'dark')
    if (FONT_SIZES.includes(settings.fontSize)) setFontSize(settings.fontSize)
    if (settings.language) setLanguage(settings.language)
    if (ACCENT_COLORS.includes(settings.accentColor)) setAccentColor(settings.accentColor)
  }

  // loadUserData - fetches everything that depends on who's logged in:
  // notifications and orders for every role, settings for every role, and
  // cart/wishlist for customers only (the only role that has either).
  // MongoDB is the source of truth here - this replaces the old
  // localStorage-restored `orders` array entirely.
  const loadUserData = async (account) => {
    try {
      const [notifRes, ordersRes, settingsRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/orders'),
        api.get('/settings'),
      ])
      setNotifications(notifRes.notifications.map(mapNotification))
      setOrders(ordersRes.orders.map(mapOrder))
      applySettings(settingsRes.settings)

      if (account.role === 'customer') {
        const [cartRes, wishlistRes] = await Promise.all([api.get('/cart'), api.get('/wishlist')])
        setCart(cartRes.cart)
        setWishlist(wishlistRes.wishlist)
      }
    } catch (err) {
      console.error('Failed to load account data:', err.message)
    }
  }

  const refreshNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.notifications.map(mapNotification))
    } catch (err) {
      console.error('Failed to refresh notifications:', err.message)
    }
  }

  // useEffect - on first load, restore theme/font/language/accent from
  // localStorage (instant paint for guests), then - if a JWT was saved
  // from a previous session - verify it against the backend and load that
  // user's real cart/wishlist/orders/notifications/settings from MongoDB.
  useEffect(() => {
    const savedTheme = localStorage.getItem('greenleaf-theme')
    setDarkMode(savedTheme === 'dark')

    const savedFont = localStorage.getItem('greenleaf-fontsize')
    if (FONT_SIZES.includes(savedFont)) setFontSize(savedFont)

    const savedLang = localStorage.getItem('greenleaf-language')
    if (savedLang) setLanguage(savedLang)

    const savedAccent = localStorage.getItem('greenleaf-accent')
    if (ACCENT_COLORS.includes(savedAccent)) setAccentColor(savedAccent)

    const token = getToken()
    if (!token) {
      setAuthChecked(true)
      return
    }

    restoreSession()
      .then(async (account) => {
        setUser(account)
        setIsLoggedIn(true)
        await loadUserData(account)
      })
      .catch(() => {
        // Saved token is expired/invalid - fall back to a guest session.
        setToken(null)
        setIsLoggedIn(false)
        setUser(guestUser)
      })
      .finally(() => setAuthChecked(true))
  }, [])

  // useEffect - persist theme preference whenever it changes (and sync to
  // the backend for a logged-in user so preferences follow them across
  // devices, per Settings section 17)
  useEffect(() => {
    localStorage.setItem('greenleaf-theme', darkMode ? 'dark' : 'light')
    if (isLoggedIn) api.put('/settings', { theme: darkMode ? 'dark' : 'light' }).catch(() => {})
  }, [darkMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect - persist font size preference whenever it changes
  useEffect(() => {
    localStorage.setItem('greenleaf-fontsize', fontSize)
    if (isLoggedIn) api.put('/settings', { fontSize }).catch(() => {})
  }, [fontSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect - persist language preference whenever it changes
  useEffect(() => {
    localStorage.setItem('greenleaf-language', language)
    if (isLoggedIn) api.put('/settings', { language }).catch(() => {})
  }, [language]) // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect - persist accent color preference whenever it changes
  useEffect(() => {
    localStorage.setItem('greenleaf-accent', accentColor)
    if (isLoggedIn) api.put('/settings', { accentColor }).catch(() => {})
  }, [accentColor]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => setDarkMode((prev) => !prev)

  // themeMode - convenience string form of darkMode ('light' | 'dark')
  const themeMode = darkMode ? 'dark' : 'light'

  // login - calls the real backend (authService -> POST /api/auth/login).
  // The backend is the only place a role is decided, never the caller.
  const login = async (email, password) => {
    try {
      const account = await authenticate(email, password)
      setUser(account)
      setIsLoggedIn(true)
      setAuthError('')
      await loadUserData(account)
      return account
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.')
      return null
    }
  }

  // loginWithGoogle - delegates to the Firebase-backed authService, which
  // then upserts the identity into our own backend for a real JWT session.
  // Throws a friendly Error (caught by Login.jsx) if not configured, or if
  // the popup sign-in fails for any reason.
  const loginWithGoogle = async () => {
    const account = await signInWithGoogle()
    setUser(account)
    setIsLoggedIn(true)
    setAuthError('')
    await loadUserData(account)
    return account
  }

  // logout - completely clears the session so protected routes redirect to
  // /login and the browser back button can no longer reveal dashboard pages
  const logout = () => {
    logoutOnServer()
    setToken(null)
    setIsLoggedIn(false)
    setUser(guestUser)
    setCart([])
    setWishlist([])
    setOrders([])
    setNotifications([])
  }

  // updateProfile - Profile.jsx already strips `role` out of the fields it
  // passes here; the backend enforces the same rule independently
  // (userController.updateProfile never reads role from the body).
  const updateProfile = async (fields) => {
    setUser((prev) => ({ ...prev, ...fields }))
    try {
      const res = await api.put('/users/profile', fields)
      setUser(res.user)
    } catch (err) {
      console.error('Failed to save profile:', err.message)
    }
  }

  // t - translation helper. Looks the key up in the active language, falls
  // back to English, then to the raw key itself if nothing matches.
  const t = (key) => translations[language]?.[key] || translations.en[key] || key

  // ===================== CART =====================
  // Customers get a real, MongoDB-backed cart (source of truth per section
  // 10). Guests - and anyone else browsing the public PlantCatalog before
  // logging in - fall back to a local-only cart so "add to cart" still
  // works the same way it always did; it just isn't persisted anywhere.
  const addToCart = async (item) => {
    if (isLoggedIn && user.role === 'customer') {
      try {
        const res = await api.post('/cart', item)
        setCart(res.cart)
        notify(`${item.name} added to cart.`)
        return
      } catch (err) {
        notify(err.message || 'Could not add to cart.', 'error')
      }
      return
    }
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id && p.size === item.size)
      if (exists) return prev.map((p) => (p.id === item.id && p.size === item.size ? { ...p, qty: p.qty + (item.qty || 1) } : p))
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
    notify(`${item.name} added to cart.`)
  }

  const removeFromCart = async (id) => {
    if (isLoggedIn && user.role === 'customer') {
      try {
        const res = await api.del(`/cart/${id}`)
        setCart(res.cart)
        return
      } catch (err) {
        console.error('Remove from cart failed:', err.message)
      }
    }
    setCart((prev) => prev.filter((p) => p.id !== id))
  }

  const updateCartQty = async (id, qty) => {
    const safeQty = Math.max(1, qty)
    if (isLoggedIn && user.role === 'customer') {
      try {
        const res = await api.put(`/cart/${id}`, { qty: safeQty })
        setCart(res.cart)
        return
      } catch (err) {
        console.error('Update cart quantity failed:', err.message)
      }
    }
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty: safeQty } : p)))
  }

  // ===================== WISHLIST =====================
  const addToWishlist = async (item) => {
    if (isLoggedIn && user.role === 'customer') {
      try {
        const res = await api.post('/wishlist', item)
        setWishlist(res.wishlist)
        notify(`${item.name} added to wishlist.`)
        return
      } catch (err) {
        notify(err.message || 'Could not add to wishlist.', 'error')
      }
      return
    }
    setWishlist((prev) => (prev.find((p) => p.id === item.id) ? prev : [...prev, item]))
    notify(`${item.name} added to wishlist.`)
  }

  const removeFromWishlist = async (id, name = 'Item') => {
    if (isLoggedIn && user.role === 'customer') {
      try {
        const res = await api.del(`/wishlist/${id}`)
        setWishlist(res.wishlist)
        notify(`${name} removed from wishlist.`)
        return
      } catch (err) {
        notify(err.message || 'Could not remove from wishlist.', 'error')
      }
      return
    }
    setWishlist((prev) => prev.filter((p) => p.id !== id))
    notify(`${name} removed from wishlist.`)
  }

  const toggleWishlist = (item) => {
    const exists = wishlist.find((p) => p.id === item.id)
    if (exists) removeFromWishlist(item.id, item.name)
    else addToWishlist(item)
  }

  // ===================== NOTIFICATIONS =====================
  const toggleNotificationRead = async (id) => {
    const current = notifications.find((n) => n.id === id)
    const nextRead = current ? !current.read : true
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: nextRead } : n)))
    try {
      await api.put(`/notifications/${id}/read`, { read: nextRead })
    } catch (err) {
      console.error('Failed to update notification:', err.message)
    }
  }

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await api.put('/notifications/read-all')
    } catch (err) {
      console.error('Failed to mark notifications read:', err.message)
    }
  }

  // ===================== ORDERS =====================
  // placeOrder - called from Checkout once payment info is submitted. The
  // backend reads the customer's persisted Cart (never trusting a total
  // sent from here), validates stock, creates the Order + Payment record,
  // decrements inventory, and notifies Admin/Staff - see
  // server/controllers/orderController.js#placeOrder.
  const placeOrder = async ({ paymentMethod, address }) => {
    const res = await api.post('/orders', { paymentMethod, address })
    const order = mapOrder(res.order)
    setOrders((prev) => [order, ...prev])
    setCart([])
    refreshNotifications()
    notify(`Order ${order.id} placed successfully!`)
    return order
  }

  // updateOrderStatus - used by Staff/Admin to move an order along the
  // tracking timeline. The customer sees the update immediately on their
  // next fetch because everyone reads from the same MongoDB Order.
  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus })
      const updated = mapOrder(res.order)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      refreshNotifications()
      notify(`Order ${orderId} updated.`)
    } catch (err) {
      notify(err.message || 'Failed to update order status.', 'error')
    }
  }

  // cancelOrder - Admin/Staff action to cancel an order (restocks items).
  const cancelOrder = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}/cancel`)
      const updated = mapOrder(res.order)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      refreshNotifications()
      notify(`Order ${orderId} cancelled.`)
    } catch (err) {
      notify(err.message || 'Failed to cancel order.', 'error')
    }
  }

  // verifyPayment - Admin/Staff action from the Payment Verification page.
  const verifyPayment = async (orderId) => {
    try {
      await api.put(`/payments/by-order/${orderId}/verify`)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'Verified' } : o)))
      refreshNotifications()
      notify('Payment verified successfully.')
    } catch (err) {
      notify(err.message || 'Failed to verify payment.', 'error')
    }
  }

  // rejectPayment - Admin/Staff action from the Payment Verification page.
  const rejectPayment = async (orderId) => {
    try {
      await api.put(`/payments/by-order/${orderId}/reject`)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'Rejected' } : o)))
      refreshNotifications()
      notify('Payment rejected.', 'error')
    } catch (err) {
      notify(err.message || 'Failed to reject payment.', 'error')
    }
  }

  const value = {
    user,
    updateProfile,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    notifications,
    toggleNotificationRead,
    markAllNotificationsRead,
    orders,
    placeOrder,
    updateOrderStatus,
    cancelOrder,
    verifyPayment,
    rejectPayment,
    toasts,
    notify,
    dismissToast,
    darkMode,
    toggleTheme,
    themeMode,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    accentColor,
    setAccentColor,
    t,
    isLoggedIn,
    authChecked,
    login,
    loginWithGoogle,
    logout,
    authError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
