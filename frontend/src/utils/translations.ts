import { geocodeDestination } from "./geocode";

export const TRANSLATIONS = {
  // Header & Navigation
  customMode: {
    en: "Custom Mode",
    vi: "Chế độ tùy chỉnh"
  },
  myPlans: {
    en: "My Plans",
    vi: "Kế hoạch của tôi"
  },
  login: {
    en: "Login",
    vi: "Đăng nhập"
  },
  logout: {
    en: "Logout",
    vi: "Đăng xuất"
  },
  userManual: {
    en: "User Manual",
    vi: "Hướng dẫn sử dụng"
  },
  
  // Main Title Section
  generateYourPerfectTrip: {
    en: "Generate Your Perfect Trip",
    vi: "Tạo chuyến đi hoàn hảo của bạn"
  },
  aiOptimizedItinerary: {
    en: "Let AI create an optimized itinerary for you",
    vi: "Hãy để AI tạo một lịch trình tối ưu cho bạn"
  },
  
  // Text Area Placeholder
  tripPreferencesPlaceholder: {
    en: `Tell us about your dream trip and your travel constraints so we can plan it perfectly for you!
You can mention some details below to help us design a better plan for you:
      🌍 Where would you like to go?
      🗓️ How long will your trip be?
      💰 What's your budget?
      👥 How many people are traveling?`,
    vi: `Hãy mô tả chuyến đi mơ ước và các ràng buộc của bạn để chúng tôi có thể một lập kế hoạch hoàn hảo!
Bạn có thể đề cập một số chi tiết dưới đây để giúp chúng tôi thiết kế kế hoạch tốt hơn:
      🌍 Bạn muốn đi đâu?
      🗓️ Chuyến đi của bạn kéo dài bao lâu?
      💰 Ngân sách của bạn là bao nhiêu?
      👥 Có bao nhiêu người đi du lịch?`
  },
  
  // Buttons
  generate: {
    en: "Generate",
    vi: "Tạo"
  },
  waiting: {
    en: "Waiting",
    vi: "Đang chờ"
  },
  save: {
    en: "Save",
    vi: "Lưu"
  },
  saving: {
    en: "Saving",
    vi: "Đang lưu"
  },
  back: {
    en: "Back",
    vi: "Quay lại"
  },
  add: {
    en: "Add",
    vi: "Thêm"
  },
  optimizing: {
    en: "Optimizing",
    vi: "Đang tối ưu"
  },
  
  // Custom Mode Section
  enterTripName: {
    en: "Enter trip name...",
    vi: "Nhập tên chuyến đi..."
  },
  numberOfMembers: {
    en: "Number of members",
    vi: "Số lượng thành viên"
  },
  startDate: {
    en: "Start Date",
    vi: "Ngày bắt đầu"
  },
  endDate: {
    en: "End Date",
    vi: "Ngày kết thúc"
  },
  autoEstimateCurrentDay: {
    en: "Auto-Estimate Costs (Current Day)",
    vi: "Ước tính chi phí (Ngày hiện tại)"
  },
  autoEstimateAllDays: {
    en: "Auto-Estimate Costs (All Days)",
    vi: "Ước tính chi phí (Tất cả các ngày)"
  },
  estimating: {
    en: "Estimating...",
    vi: "Đang ước tính..."
  },
  findOptimalRoute: {
    en: "Find Optimal Route",
    vi: "Tìm lộ trình tối ưu"
  },
  savePlan: {
    en: "Save Plan",
    vi: "Lưu kế hoạch"
  },
  saved: {
    en: "Saved!",
    vi: "Đã lưu!"
  },
  pleaseEnterTripName: {
    en: "Please enter a trip name",
    vi: "Vui lòng nhập tên chuyến đi"
  },
  planUpdated: {
    en: "Trip plan updated successfully!",
    vi: "Kế hoạch chuyến đi đã được cập nhật thành công!"
  },
  tripAdjusted: {
    en: "Trip adjusted to",
    vi: "Chuyến đi đã được điều chỉnh thành"
  },
  mustHaveOneDay: {
    en: "You must have at least one day in your trip",
    vi: "Bạn phải có ít nhất một ngày trong chuyến đi"
  },
  dayRemoved: {
    en: "Day removed",
    vi: "Đã xóa ngày"
  },
  costsEstimatedCurrentDay: {
    en: "Costs estimated for current day",
    vi: "Chi phí đã được ước tính cho ngày hiện tại"
  },
  costsEstimatedAllDays: {
    en: "Costs estimated for all days",
    vi: "Chi phí đã được ước tính cho tất cả các ngày"
  },
  
  // Day Management
  day: {
    en: "Day",
    vi: "Ngày"
  },
  days: {
    en: "days",
    vi: "ngày"
  },
  addDay: {
    en: "Add Day",
    vi: "Thêm ngày"
  },
  viewAllDays: {
    en: "View All Days",
    vi: "Xem tất cả các ngày"
  },
  
  // Destinations
  destination: {
    en: "destination",
    vi: "điểm đến"
  },
  destinations: {
    en: "destinations",
    vi: "điểm đến"
  },
  destinationName: {
    en: "Destination Name",
    vi: "Tên điểm đến"
  },
  destinationNamePlaceholder: {
    en: "e.g. The Complex of Hue Monuments, Ho Xuan Huong, Saigon Notre-Dame Basilica, ...",
    vi: "ví dụ: Quần thể di tích cố đô Huế, Hồ Xuân Hương, Nhà thờ Đức Bà Sài Gòn..."
  },
  
  // Route & Map
  mapView: {
    en: "Map View",
    vi: "Bản đồ"
  },
  routeList: {
    en: "Route List",
    vi: "Danh sách tuyến đường"
  },
  clickToNavigate: {
    en: "Click on a route segment to navigate:",
    vi: "Nhấp vào một tuyến đường để điều hướng:"
  },
  routeSegment: {
    en: "route segment",
    vi: "tuyến đường"
  },
  routeSegments: {
    en: "route segments",
    vi: "tuyến đường"
  },
  goStartNavigation: {
    en: "Go - Start Navigation",
    vi: "Đi - Bắt đầu điều hướng"
  },
  showingAllDays: {
    en: "Showing all days",
    vi: "Hiển thị tất cả các ngày"
  },
  
  // Route Guidance
  routeGuidance: {
    en: "Route Guidance",
    vi: "Hướng dẫn lộ trình"
  },
  closeGuidance: {
    en: "Back to Map",
    vi: "Quay lại bản đồ"
  },
  distance: {
    en: "Distance",
    vi: "Khoảng cách"
  },
  estimatedTime: {
    en: "Est. Time",
    vi: "Thời gian ước tính"
  },
  turnByTurnDirections: {
    en: "Turn-by-turn Directions",
    vi: "Hướng dẫn từng bước"
  },
  gpsNavigation: {
    en: "GPS Navigation",
    vi: "Điều hướng GPS"
  },
  noInstructions: {
    en: "No instructions available.",
    vi: "Không có hướng dẫn nào."
  },
  
  // Saved Plans
  createNewPlan: {
    en: "Create New Plan",
    vi: "Tạo kế hoạch mới"
  },
  noSavedPlans: {
    en: "No saved plans yet. Create your first trip plan!",
    vi: "Chưa có kế hoạch nào được lưu. Tạo kế hoạch chuyến đi đầu tiên của bạn!"
  },
  total: {
    en: "total",
    vi: "tổng cộng"
  },
  
  // Auth Modal
  createAccount: {
    en: "Create Account",
    vi: "Tạo tài khoản"
  },
  loginToAccount: {
    en: "Sign in to save and manage multiple trip plans",
    vi: "Đăng nhập để lưu và quản lý nhiều kế hoạch chuyến đi"
  },
  signupToStart: {
    en: "Create a new account to save and manage your trip plans",
    vi: "Tạo tài khoản mới để lưu và quản lý kế hoạch chuyến đi của bạn"
  },
  userName: {
    en: "User name",
    vi: "Tên đăng nhập"
  },
  email: {
    en: "Email",
    vi: "Email"
  },
  password: {
    en: "Password",
    vi: "Mật khẩu"
  },
  signUp: {
    en: "Sign Up",
    vi: "Đăng ký"
  },
  cancel: {
    en: "Cancel",
    vi: "Hủy"
  },
  alreadyHaveAccount: {
    en: "Already have an account? Login",
    vi: "Đã có tài khoản? Đăng nhập"
  },
  dontHaveAccount: {
    en: "Don't have an account? Register",
    vi: "Chưa có tài khoản? Đăng ký"
  },
  enterEmailPassword: {
    en: "Please enter email and password",
    vi: "Vui lòng nhập email và mật khẩu"
  },
  
  // Toast Messages
  pleaseLogin: {
    en: "Please login to save your trip plan",
    vi: "Vui lòng đăng nhập để lưu kế hoạch chuyến đi"
  },
  authenticationNotFound: {
    en: "Authentication not found. Please login again.",
    vi: "Không tìm thấy xác thực. Vui lòng đăng nhập lại."
  },
  sessionExpired: {
    en: "Session expired. Please login again.",
    vi: "Phiên đã hết hạn. Vui lòng đăng nhập lại."
  },
  planSaved: {
    en: "Trip plan saved successfully!",
    vi: "Kế hoạch chuyến đi đã được lưu thành công!"
  },
  planSaveFailed: {
    en: "Failed to save trip plan. Please try again.",
    vi: "Lưu kế hoạch chuyến đi thất bại. Vui lòng thử lại."
  },
  tripPreferencesRequired: {
    en: "Please tell us about your trip preferences first!",
    vi: "Vui lòng cho chúng tôi biết sở thích chuyến đi của bạn trước!"
  },
  generatingTrip: {
    en: "Generating your perfect trip plan...",
    vi: "Đang tạo kế hoạch chuyến đi hoàn hảo của bạn..."
  },
  generateFailed: {
    en: "Failed to generate trip plan. Please try again.",
    vi: "Tạo kế hoạch chuyến đi thất bại. Vui lòng thử lại."
  },
  routeOptimized: {
    en: "Route optimized successfully!",
    vi: "Lộ trình đã được tối ưu hóa thành công!"
  },
  routeOptimizationFailed: {
    en: "Route optimization failed. Please try again.",
    vi: "Tối ưu hóa lộ trình thất bại. Vui lòng thử lại."
  },
  optimizingRoute: {
    en: "Optimizing route...",
    vi: "Đang tối ưu hóa lộ trình..."
  },
  addDestinationsFirst: {
    en: "Add at least 1 destinations to optimize the route",
    vi: "Thêm ít nhất 1 điểm đến để tối ưu hóa lộ trình"
  },
  loginToViewPlans: {
    en: "Please login to view your saved plans",
    vi: "Vui lòng đăng nhập để xem các kế hoạch đã lưu của bạn"
  },
  loadTripsFailed: {
    en: "Failed to load trips. Please try again.",
    vi: "Tải chuyến đi thất bại. Vui lòng thử lại."
  },
  loginToDeletePlans: {
    en: "Please login to delete plans",
    vi: "Vui lòng đăng nhập để xóa kế hoạch"
  },
  planDeletedFailed: {
    en: "Failed to delete plan. Please try again.",
    vi: "Xóa kế hoạch thất bại. Vui lòng thử lại."
  },
  pleaseEnterDestinationName: {
    en: "Please enter a destination name",
    vi: "Vui lòng nhập tên điểm đến"
  },
  geocodeDestinationFailed: {
    en: "Failed to geocode destination. Please try again.",
    vi: "Không thể mã hóa điểm đến. Vui lòng thử lại."
  },
  oneCostItemRequired: {
    en: "Each destination must have at least one cost item",
    vi: "Mỗi điểm đến phải có ít nhất một khoản chi phí"
  },
  
  // User Manual / Tutorial
  tutorialStep: {
    en: "Step",
    vi: "Bước"
  },
  of: {
    en: "of",
    vi: "của"
  },
  skipTutorial: {
    en: "Skip Tutorial",
    vi: "Bỏ qua hướng dẫn"
  },
  next: {
    en: "Next",
    vi: "Tiếp theo"
  },
  finish: {
    en: "Finish",
    vi: "Hoàn thành"
  },
  
  // Tutorial Steps
  tutorial_welcome_title: {
    en: "Welcome to Intelligent Tour Planner!",
    vi: "Chào mừng đến với Intelligent Tour Planner!"
  },
  tutorial_welcome_desc: {
    en: "Let's take a quick tour of all the features to help you plan your perfect trip. Click Next to begin!",
    vi: "Hãy cùng tham quan nhanh tất cả các tính năng để giúp bạn lên kế hoạch cho chuyến đi hoàn hảo. Nhấp Tiếp theo để bắt đầu!"
  },
  tutorial_login_title: {
    en: "Login to Save Your Plans",
    vi: "Đăng nhập để lưu kế hoạch"
  },
  tutorial_login_desc: {
    en: "Click the Login button to save your trip plans and access them from any device.",
    vi: "Nhấp vào nút Đăng nhập để lưu kế hoạch chuyến đi và truy cập từ bất kỳ thiết bị nào."
  },
  tutorial_language_title: {
    en: "Change Language",
    vi: "Thay đổi ngôn ngữ"
  },
  tutorial_language_desc: {
    en: "Switch between English and Vietnamese to use the app in your preferred language.",
    vi: "Chuyển đổi giữa tiếng Anh và tiếng Việt để sử dụng ứng dụng bằng ngôn ngữ ưa thích của bạn."
  },
  tutorial_currency_title: {
    en: "Change Currency",
    vi: "Thay đổi tiền tệ"
  },
  tutorial_currency_desc: {
    en: "Toggle between USD and VND. All costs throughout the app will update automatically.",
    vi: "Chuyển đổi giữa USD và VND. Tất cả chi phí trong ứng dụng sẽ tự động cập nhật."
  },
  tutorial_generate_title: {
    en: "Generate Your Plan",
    vi: "Tạo kế hoạch của bạn"
  },
  tutorial_generate_desc: {
    en: "Describe your dream trip and let AI create an optimized itinerary for you.",
    vi: "Mô tả chuyến đi mơ ước của bạn và để AI tạo lịch trình được tối ưu hóa cho bạn."
  },
  tutorial_tripname_title: {
    en: "Name Your Trip",
    vi: "Đặt tên chuyến đi"
  },
  tutorial_tripname_desc: {
    en: "Give your trip a memorable name to easily identify it later.",
    vi: "Đặt tên đáng nhớ cho chuyến đi để dễ dàng nhận biết sau này."
  },
  tutorial_members_title: {
    en: "Number of Members",
    vi: "Số lượng thành viên"
  },
  tutorial_members_desc: {
    en: "Enter how many people will be traveling on this trip.",
    vi: "Nhập số người sẽ đi du lịch trong chuyến đi này."
  },
  tutorial_startdate_title: {
    en: "Select Start Date",
    vi: "Chọn ngày bắt đầu"
  },
  tutorial_startdate_desc: {
    en: "Choose when your trip begins. You can use the calendar or the arrow buttons.",
    vi: "Chọn khi nào chuyến đi của bạn bắt đầu. Bạn có thể sử dụng lịch hoặc các nút mũi tên."
  },
  tutorial_enddate_title: {
    en: "Select End Date",
    vi: "Chọn ngày kết thúc"
  },
  tutorial_enddate_desc: {
    en: "Choose when your trip ends. The app will automatically create days based on your date range.",
    vi: "Chọn khi nào chuyến đi của bạn kết thúc. Ứng dụng sẽ tự động tạo các ngày dựa trên khoảng thời gian của bạn."
  },
  tutorial_daytabs_title: {
    en: "Navigate Between Days",
    vi: "Điều hướng giữa các ngày"
  },
  tutorial_daytabs_desc: {
    en: "Switch between different days of your trip. You can also delete days you don't need.",
    vi: "Chuyển đổi giữa các ngày khác nhau trong chuyến đi của bạn. Bạn cũng có thể xóa những ngày không cần thiết."
  },
  tutorial_viewalldays_title: {
    en: "View All Days",
    vi: "Xem tất cả các ngày"
  },
  tutorial_viewalldays_desc: {
    en: "Click here to see an overview of all your trip days at once.",
    vi: "Nhấp vào đây để xem tổng quan về tất cả các ngày trong chuyến đi của bạn cùng một lúc."
  },
  tutorial_adddest_title: {
    en: "Add Destinations",
    vi: "Thêm điểm đến"
  },
  tutorial_adddest_desc: {
    en: "Add destinations to your daily itinerary by typing a name or clicking on the map.",
    vi: "Thêm điểm đến vào lịch trình hàng ngày của bạn bằng cách nhập tên hoặc nhấp vào bản đồ."
  },
  tutorial_addcost_title: {
    en: "Add Cost Items",
    vi: "Thêm khoản chi phí"
  },
  tutorial_addcost_desc: {
    en: "Add detailed cost items for each destination to track your expenses accurately.",
    vi: "Thêm các khoản chi phí chi tiết cho từng điểm đến để theo dõi chi tiêu chính xác."
  },
  tutorial_autoestimate_title: {
    en: "Auto-Estimate Costs",
    vi: "Ước tính chi phí tự động"
  },
  tutorial_autoestimate_desc: {
    en: "Let the app automatically estimate costs for your destinations based on typical expenses.",
    vi: "Để ứng dụng tự động ước tính chi phí cho các điểm đến của bạn dựa trên chi phí điển hình."
  },
  tutorial_optimize_title: {
    en: "Find Optimal Route",
    vi: "Tìm lộ trình tối ưu"
  },
  tutorial_optimize_desc: {
    en: "Optimize your route for efficient travel between all your destinations.",
    vi: "Tối ưu hóa lộ trình của bạn để di chuyển hiệu quả giữa tất cả các điểm đến."
  },
  tutorial_mapview_title: {
    en: "View on Map",
    vi: "Xem trên bản đồ"
  },
  tutorial_mapview_desc: {
    en: "Visualize your destinations and routes on the map for better planning.",
    vi: "Hình dung các điểm đến và lộ trình của bạn trên bản đồ để lập kế hoạch tốt hơn."
  },
  tutorial_routelist_title: {
    en: "Route List",
    vi: "Danh sách tuyến đường"
  },
  tutorial_routelist_desc: {
    en: "See all route segments in a list view with detailed navigation information.",
    vi: "Xem tất cả các đoạn tuyến đường trong chế độ xem danh sách với thông tin điều hướng chi tiết."
  },
  tutorial_routeguidance_title: {
    en: "Turn-by-Turn Navigation",
    vi: "Điều hướng từng bước"
  },
  tutorial_routeguidance_desc: {
    en: "Get detailed turn-by-turn directions between destinations with GPS navigation support.",
    vi: "Nhận hướng dẫn chi tiết từng bước giữa các điểm đến với hỗ trợ điều hướng GPS."
  },
  tutorial_complete_title: {
    en: "Tutorial Complete!",
    vi: "Hoàn thành hướng dẫn!"
  },
  tutorial_complete_desc: {
    en: "You've learned all the features of Intelligent Tour Planner. Start creating your perfect trip now!",
    vi: "Bạn đã học tất cả các tính năng của Intelligent Tour Planner. Bắt đầu tạo chuyến đi hoàn hảo của bạn ngay bây giờ!"
  },
  
  // Day View & All Days View
  enterDestinationName: {
    en: "Enter destination name (or click on map)",
    vi: "Nhập tên điểm đến (hoặc nhấp vào bản đồ)"
  },
  adding: {
    en: "Adding...",
    vi: "Đang thêm..."
  },
  noDestinationsYet: {
    en: "No destinations yet. Add a destination or click on the map!",
    vi: "Chưa có điểm đến nào. Thêm điểm đến hoặc nhấp vào bản đồ!"
  },
  detailPlaceholder: {
    en: "Detail (e.g., entrance fee)",
    vi: "Ghi chú (ví dụ: phí vào cửa)"
  },
  addCostItem: {
    en: "Add Cost Item",
    vi: "Thêm khoản chi phí"
  },
  destinationTotal: {
    en: "Destination's Cost Total:",
    vi: "Tổng chi phí điểm đến:"
  },
  allDaysOverview: {
    en: "All Days Overview",
    vi: "Tổng quan tất cả các ngày"
  },
  tripTotal: {
    en: "Trip Total:",
    vi: "Tổng chuyến đi:"
  },
  totalCost: {
    en: "Total Cost of ",
    vi: "Tổng chi phí "
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;
export type Language = "en" | "vi";

export function t(key: TranslationKey, lang: Language): string {
  return TRANSLATIONS[key][lang];
}