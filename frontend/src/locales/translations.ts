import { profile } from "console";

export const TRANSLATIONS = {
  // Header & Navigation
  customMode: {
    en: "Custom Mode",
    vi: "Chế độ tùy chỉnh",
  },
  viewMode: {
    en: "View Mode",
    vi: "Chế độ xem",
  },
  myPlans: {
    en: "My Plans",
    vi: "Kế hoạch của tôi",
  },
  login: {
    en: "Login",
    vi: "Đăng nhập",
  },
  logout: {
    en: "Logout",
    vi: "Đăng xuất",
  },
  userManual: {
    en: "User Manual",
    vi: "Hướng dẫn sử dụng",
  },

  // Main Title Section
  generateYourPerfectTrip: {
    en: "Generate Your Perfect Trip",
    vi: "Tạo chuyến đi hoàn hảo của bạn",
  },
  aiOptimizedItinerary: {
    en: "Let AI create an optimized itinerary for you",
    vi: "Để AI tạo lịch trình tối ưu cho bạn",
  },

  // Text Area Placeholder
  tripPreferencesPlaceholder: {
    en: `Tell us about your dream trip and your travel constraints so we can plan it perfectly for you!
You can mention some details below to help us design a better plan for you:
      🌍 Where would you like to go?
      🗓️ How long will your trip be?
      💰 What's your budget?
      👥 How many people are traveling?`,
    vi: `Hãy cho chúng tôi biết về chuyến đi mơ ước và các ràng buộc của bạn để chúng tôi có thể lập kế hoạch hoàn hảo!
Bạn có thể đề cập một số chi tiết dưới đây để giúp chúng tôi thiết kế kế hoạch tốt hơn:
      🌍 Bạn muốn đi đâu?
      🗓️ Chuyến đi của bạn kéo dài bao lâu?
      💰 Ngân sách của bạn là bao nhiêu?
      👥 Có bao nhiêu người đi du lịch?`,
  },

  // Buttons
  generate: {
    en: "Generate",
    vi: "Tạo",
  },
  waiting: {
    en: "Waiting",
    vi: "Đang chờ",
  },
  save: {
    en: "Save",
    vi: "Lưu",
  },
  saving: {
    en: "Saving",
    vi: "Đang lưu",
  },
  reset: {
    en: "Reset",
    vi: "Đặt lại",
  },
  resetting: {
    en: "Resetting",
    vi: "Đang đặt lại",
  },
  back: {
    en: "Back",
    vi: "Quay lại",
  },
  delete: {
    en: "Delete",
    vi: "Xóa",
  },
  add: {
    en: "Add",
    vi: "Thêm",
  },
  addDestination: {
    en: "Add Destination",
    vi: "Thêm điểm đến",
  },
  optimize: {
    en: "Optimize",
    vi: "Tối ưu hóa",
  },
  optimizing: {
    en: "Optimizing",
    vi: "Đang tối ưu",
  },
  expand: {
    en: "Expand",
    vi: "Mở rộng",
  },
  collapse: {
    en: "Thu gọn",
    vi: "Thu gọn",
  },

  // Custom Mode Section
  customModeTitle: {
    en: "Custom Mode - Manual Editing",
    vi: "Chế độ tùy chỉnh - Chỉnh sửa thủ công",
  },
  customModeSubtitle: {
    en: "Manually create and edit your multi-day trip",
    vi: "Tạo và chỉnh sửa chuyến đi nhiều ngày của bạn",
  },
  tripPlanName: {
    en: "Trip Plan Name",
    vi: "Tên kế hoạch chuyến đi",
  },
  tripPlanPlaceholder: {
    en: "e.g. Summer Vacation, Business Trip...",
    vi: "ví dụ: Kỳ nghỉ hè, Chuyến công tác...",
  },
  enterTripName: {
    en: "Enter trip name...",
    vi: "Nhập tên chuyến đi...",
  },
  tripName: {
    en: "Trip name",
    vi: "Tên chuyến đi",
  },
  numberOfMembers: {
    en: "Number of members",
    vi: "Số lượng thành viên",
  },
  members: {
    en: "members",
    vi: "thành viên",
  },
  startDate: {
    en: "Start Date",
    vi: "Ngày bắt đầu",
  },
  endDate: {
    en: "End Date",
    vi: "Ngày kết thúc",
  },
  autoEstimateCosts: {
    en: "Auto-Estimate Costs",
    vi: "Tự động ước tính chi phí",
  },
  autoEstimateCurrentDay: {
    en: "Auto-Estimate Costs (Current Day)",
    vi: "Tự động ước tính chi phí (Ngày hiện tại)",
  },
  autoEstimateAllDays: {
    en: "Auto-Estimate Costs (All Days)",
    vi: "Tự động ước tính chi phí (Tất cả các ngày)",
  },
  estimating: {
    en: "Estimating...",
    vi: "Đang ước tính...",
  },
  findOptimalRoute: {
    en: "Find Optimal Route",
    vi: "Tìm lộ trình tối ưu",
  },
  savePlan: {
    en: "Save Plan",
    vi: "Lưu kế hoạch",
  },
  saved: {
    en: "Saved!",
    vi: "Đã lưu!",
  },
  pleaseEnterTripName: {
    en: "Please enter a trip name",
    vi: "Vui lòng nhập tên chuyến đi",
  },
  planUpdated: {
    en: "Trip plan updated successfully!",
    vi: "Kế hoạch chuyến đi đã được cập nhật thành công!",
  },
  planNotFound: {
    en: "Plan not found",
    vi: "Không tìm thấy kế hoạch",
  },
  tripAdjusted: {
    en: "Trip adjusted to",
    vi: "Chuyến đi đã được điều chỉnh thành",
  },
  endDateMustBeAfter: {
    en: "End Date must be on or after Start Date",
    vi: "Ngày kết thúc phải bằng hoặc sau Ngày bắt đầu",
  },
  mustHaveOneDay: {
    en: "You must have at least one day in your trip",
    vi: "Bạn phải có ít nhất một ngày trong chuyến đi",
  },
  dayRemoved: {
    en: "Day removed",
    vi: "Đã xóa ngày",
  },
  costsEstimatedCurrentDay: {
    en: "Costs estimated for current day",
    vi: "Chi phí đã được ước tính cho ngày hiện tại",
  },
  costsEstimatedAllDays: {
    en: "Costs estimated for all days",
    vi: "Chi phí đã được ước tính cho tất cả các ngày",
  },

  // Day Management
  day: {
    en: "Day",
    vi: "Ngày",
  },
  days: {
    en: "days",
    vi: "ngày",
  },
  addDay: {
    en: "Add Day",
    vi: "Thêm ngày",
  },
  viewAllDays: {
    en: "View All Days",
    vi: "Xem tất cả các ngày",
  },

  // Destinations
  destination: {
    en: "destination",
    vi: "điểm đến",
  },
  destinations: {
    en: "destinations",
    vi: "điểm đến",
  },
  destinationName: {
    en: "Destination Name",
    vi: "Tên điểm đến",
  },
  destinationNamePlaceholder: {
    en: "e.g. Eiffel Tower, Central Park...",
    vi: "ví dụ: Tháp Eiffel, Công viên Trung tâm...",
  },
  latitude: {
    en: "Latitude",
    vi: "Vĩ độ",
  },
  longitude: {
    en: "Longitude",
    vi: "Kinh độ",
  },

  // Costs
  costs: {
    en: "Costs",
    vi: "Chi phí",
  },
  costItem: {
    en: "Cost Item",
    vi: "Khoản chi",
  },
  costItemPlaceholder: {
    en: "e.g. Hotel, Meals, Transportation...",
    vi: "ví dụ: Khách sạn, Ăn uống, Di chuyển...",
  },
  amount: {
    en: "Amount",
    vi: "Số tiền",
  },
  addCost: {
    en: "Add Cost",
    vi: "Thêm chi phí",
  },
  totalCost: {
    en: "Total Cost",
    vi: "Tổng chi phí",
  },

  // Route & Map
  optimizeRoute: {
    en: "Optimize Route",
    vi: "Tối ưu hóa lộ trình",
  },
  mapView: {
    en: "Map View",
    vi: "Chế độ bản đồ",
  },
  placeSearch: {
    en: "Find Destination",
    vi: "Tìm kiếm địa điểm",
  },
  searchResults: {
    en: "Search Results",
    vi: "Kt quả tìm kiếm",
  },
  addToDay: {
    en: "Add to Day",
    vi: "Thêm vào ngày",
  },
  placeDetails: {
    en: "Place Details",
    vi: "Chi tiết địa điểm",
  },
  noResultsFound: {
    en: "No results found",
    vi: "Không tìm thấy kết quả",
  },
  searchForPlaces: {
    en: "Search for places to visit",
    vi: "Tìm kiếm địa điểm để tham quan",
  },
  routeList: {
    en: "Route List",
    vi: "Danh sách tuyến đường",
  },
  clickToNavigate: {
    en: "Click on a route segment to navigate:",
    vi: "Nhấp vào một đoạn tuyến đường để điều hướng:",
  },
  routeSegment: {
    en: "route segment",
    vi: "đoạn tuyến đường",
  },
  routeSegments: {
    en: "route segments",
    vi: "đoạn tuyến đường",
  },
  goStartNavigation: {
    en: "Go - Start Navigation",
    vi: "Đi - Bắt đầu điều hướng",
  },
  addDestinationsToMap: {
    en: "Add destinations to see them on the map",
    vi: "Thêm điểm đến để xem chúng trên bản đồ",
  },
  showingAllDays: {
    en: "Showing all days",
    vi: "Hiển thị tất cả các ngày",
  },

  // Route Guidance
  routeGuidance: {
    en: "Route Guidance",
    vi: "Hướng dẫn lộ trình",
  },
  from: {
    en: "From",
    vi: "Từ",
  },
  to: {
    en: "To",
    vi: "Đến",
  },
  closeGuidance: {
    en: "Back to Map",
    vi: "Quay lại bản đồ",
  },
  openInGoogleMaps: {
    en: "Open in Google Maps",
    vi: "Mở trong Google Maps",
  },
  distance: {
    en: "Distance",
    vi: "Khoảng cách",
  },
  estimatedTime: {
    en: "Est. Time",
    vi: "Thời gian ước tính",
  },
  turnByTurnDirections: {
    en: "Turn-by-turn Directions",
    vi: "Hướng dẫn từng bước",
  },
  gpsNavigation: {
    en: "GPS Navigation",
    vi: "Điều hướng GPS",
  },
  followingRoute: {
    en: "Following route...",
    vi: "Đang đi theo lộ trình...",
  },
  gpsSimulation: {
    en: "GPS navigation simulation",
    vi: "Mô phỏng điều hướng GPS",
  },

  // Saved Plans
  mySavedPlans: {
    en: "My Saved Plans",
    vi: "Kế hoạch đã lưu của tôi",
  },
  createNewPlan: {
    en: "Create New Plan",
    vi: "Tạo kế hoạch mới",
  },
  noSavedPlans: {
    en: "No saved plans yet. Create your first trip plan!",
    vi: "Chưa có kế hoạch nào được lưu. Tạo kế hoạch chuyến đi đầu tiên của bạn!",
  },
  total: {
    en: "total",
    vi: "tổng cộng",
  },

  // Auth Modal
  welcomeBack: {
    en: "Welcome Back",
    vi: "Chào mừng trở lại",
  },
  createAccount: {
    en: "Create Account",
    vi: "Tạo tài khoản",
  },
  loginTitle: {
    en: "Login",
    vi: "Đăng nhập",
  },
  loginToAccount: {
    en: "Sign in to save and manage multiple trip plans",
    vi: "Đăng nhập để lưu và quản lý nhiều kế hoạch chuyến đi",
  },
  signupToStart: {
    en: "Create a new account to save and manage your trip plans",
    vi: "Tạo tài khoản mới để lưu và quản lý kế hoạch chuyến đi của bạn",
  },
  email: {
    en: "Email",
    vi: "Email",
  },
  username: {
    en: "Username",
    vi: "Tên đăng nhập",
  },
  password: {
    en: "Password",
    vi: "Mật khẩu",
  },
  confirmPassword: {
    en: "Confirm Password",
    vi: "Xác nhận mật khẩu",
  },
  forgotPassword: {
    en: "Forgot Password?",
    vi: "Quên mật khẩu?",
  },
  signUp: {
    en: "Sign Up",
    vi: "Đăng ký",
  },
  register: {
    en: "Register",
    vi: "Đăng ký",
  },
  startExploring: {
    en: "Start Exploring",
    vi: "Bắt đầu khám phá",
  },
  cancel: {
    en: "Cancel",
    vi: "Hủy",
  },
  alreadyHaveAccount: {
    en: "Already have an account? Login",
    vi: "Đã có tài khoản? Đăng nhập",
  },
  dontHaveAccount: {
    en: "Don't have an account? Register",
    vi: "Chưa có tài khoản? Đăng ký",
  },
  enterEmailPassword: {
    en: "Please enter email and password",
    vi: "Vui lòng nhập email và mật khẩu",
  },
  accountCreated: {
    en: "Account created successfully! You are now logged in.",
    vi: "Tài khoản đã được tạo thành công! Bạn hiện đã đăng nhập.",
  },
  loggedInSuccess: {
    en: "Logged in successfully!",
    vi: "Đăng nhập thành công!",
  },
  accountProfile: {
    en: "Account Profile",
    vi: "Thông tin tài khoản",
  },
  accountProfileDescription: {
    en: "Manage your account information and settings",
    vi: "Quản lý thông tin tài khoản và cài đặt",
  },
  changePassword: {
    en: "Change Password",
    vi: "Đổi mật khẩu",
  },
  currentPassword: {
    en: "Current Password",
    vi: "Mật khẩu hiện tại",
  },
  newPassword: {
    en: "New Password",
    vi: "Mật khẩu mới",
  },
  fillAllFields: {
    en: "Please fill in all fields",
    vi: "Vui lòng điền đầy đủ thông tin",
  },
  incorrectPassword: {
    en: "Current password is incorrect",
    vi: "Mật khẩu hiện tại không đúng",
  },
  passwordsDontMatch: {
    en: "Passwords don't match",
    vi: "Mật khẩu không khớp",
  },
  passwordTooShort: {
    en: "Password must be at least 6 characters",
    vi: "Mật khẩu phải có ít nhất 6 ký tự",
  },
  passwordChanged: {
    en: "Password changed successfully!",
    vi: "Đổi mật khẩu thành công!",
  },
  avatarUrl: {
    en: "Upload Avatar",
    vi: "Tải lên ảnh đại diện",
  },
  avatarUpdated: {
    en: "Avatar updated successfully!",
    vi: "Cập nhật ảnh đại diện thành công!",
  },
  enterAvatarUrl: {
    en: "Please select an image file",
    vi: "Vui lòng chọn file ảnh",
  },
  invalidImageFile: {
    en: "Please select a valid image file",
    vi: "Vui lòng chọn file ảnh hợp lệ",
  },
  fileTooLarge: {
    en: "File size must be less than 5MB",
    vi: "Kích thước file phải nhỏ hơn 5MB",
  },
  errorReadingFile: {
    en: "Error reading file. Please try again.",
    vi: "Lỗi đọc file. Vui lòng thử lại.",
  },
  uploadAvatar: {
    en: "Upload Avatar",
    vi: "Tải lên ảnh đại diện",
  },
  update: {
    en: "Update",
    vi: "Cập nhật",
  },
  close: {
    en: "Close",
    vi: "Đóng",
  },

  // Toast Messages
  pleaseLogin: {
    en: "Please login to save your trip plan",
    vi: "Vui lòng đăng nhập để lưu kế hoạch chuyến đi",
  },
  planSaved: {
    en: "Trip plan saved successfully!",
    vi: "Kế hoạch chuyến đi đã được lưu thành công!",
  },
  planDeleted: {
    en: "Plan deleted",
    vi: "Kế hoạch đã bị xóa",
  },
  planLoaded: {
    en: "Plan loaded successfully!",
    vi: "Kế hoạch đã được tải thành công!",
  },
  tripPreferencesRequired: {
    en: "Please tell us about your trip preferences first!",
    vi: "Vui lng cho chúng tôi biết sở thích chuyến đi của bạn trước!",
  },
  generatingTrip: {
    en: "Generating your perfect trip plan...",
    vi: "Đang tạo kế hoạch chuyến đi hoàn hảo của bạn...",
  },
  routeOptimized: {
    en: "Route optimized successfully!",
    vi: "Lộ trình đã được tối ưu hóa thành công!",
  },
  optimizingRoute: {
    en: "Optimizing route...",
    vi: "Đang tối ưu hóa lộ trình...",
  },
  addDestinationsFirst: {
    en: "Add at least 2 destinations to optimize the route",
    vi: "Thêm ít nhất 2 điểm đến để tối ưu hóa lộ trình",
  },
  dayDeleted: {
    en: "Day deleted successfully",
    vi: "Đã xóa ngày thành công",
  },
  cannotDeleteLastDay: {
    en: "Cannot delete the last remaining day",
    vi: "Không thể xóa ngày cuối cùng",
  },
  allDataCleared: {
    en: "All data has been cleared!",
    vi: "Tất cả dữ liệu đã được xóa!",
  },
  clearingData: {
    en: "Clearing all data...",
    vi: "Đang xóa tất c dữ liệu...",
  },

  // User Manual / Tutorial
  tutorialStep: {
    en: "Step",
    vi: "Bước",
  },
  of: {
    en: "of",
    vi: "của",
  },
  skipTutorial: {
    en: "Skip Tutorial",
    vi: "Bỏ qua hướng dẫn",
  },
  next: {
    en: "Next",
    vi: "Tiếp theo",
  },
  finish: {
    en: "Finish",
    vi: "Hoàn thành",
  },

  // Tutorial Steps
  tutorial_welcome_title: {
    en: "Welcome to Intelligent Tour Planner!",
    vi: "Chào mừng đến với Intelligent Tour Planner!",
  },
  tutorial_welcome_desc: {
    en: "Let's take a quick tour of all the features to help you plan your perfect trip. Click Next to begin!",
    vi: "Hãy cùng tham quan nhanh tất cả các tính năng để giúp bạn lên kế hoạch cho chuyến đi hoàn hảo. Nhấp Tiếp theo để bắt đầu!",
  },

  // Sidebar Steps
  tutorial_sidebar_overview_title: {
    en: "Sidebar Navigation Panel",
    vi: "Bảng điều hướng thanh bên",
  },
  tutorial_sidebar_overview_desc: {
    en: "This sidebar contains all main navigation buttons. Use it to switch modes, access settings, view saved plans, and more.",
    vi: "Thanh bên này chứa tất cả các nút điều hướng chính. Sử dụng nó để chuyển chế độ, truy cập cài đặt, xem kế hoạch đã lưu và nhiều hơn nữa.",
  },
  tutorial_custom_mode_btn_title: {
    en: "Custom Mode Button",
    vi: "Nút chế độ tùy chỉnh",
  },
  tutorial_custom_mode_btn_desc: {
    en: "Click this button to enter Custom Mode where you can manually edit your trip with the AI chat assistant visible on the right side.",
    vi: "Nhấp vào nút này để vào Chế độ tùy chỉnh nơi bạn có thể chỉnh sửa chuyến đi thủ công với trợ lý chat AI hiển thị bên phải.",
  },
  tutorial_view_mode_btn_title: {
    en: "View Mode Button",
    vi: "Nút chế độ xem",
  },
  tutorial_view_mode_btn_desc: {
    en: "Click this button to enter View Mode where the chat is hidden and the map takes up 50% of the screen for better visualization.",
    vi: "Nhấp vào nút này để vào Chế độ xem nơi chat bị ẩn và bản đồ chiếm 50% màn hình để hình dung tốt hơn.",
  },
  tutorial_user_manual_btn_title: {
    en: "User Manual Button",
    vi: "Nút hướng dẫn sử dụng",
  },
  tutorial_user_manual_btn_desc: {
    en: "Click this button to open the user manual and learn about all features step by step. You can track your progress through each chapter.",
    vi: "Nhấp vào nút này để mở hướng dẫn sử dụng và tìm hiểu về tất cả các tính năng từng bước. Bạn có thể theo dõi tiến độ của mình qua từng chương.",
  },
  tutorial_settings_btn_title: {
    en: "Settings Button",
    vi: "Nút cài đặt",
  },
  tutorial_settings_btn_desc: {
    en: "Click this button to open settings where you can change language (EN/VI), currency (USD/VND), and theme color.",
    vi: "Nhấp vào nút này để mở cài đặt nơi bạn có thể thay đổi ngôn ngữ (EN/VI), tiền tệ (USD/VND) và màu chủ đề.",
  },
  tutorial_saved_plans_btn_title: {
    en: "My Plans Button",
    vi: "Nút kế hoạch của tôi",
  },
  tutorial_saved_plans_btn_desc: {
    en: "Click this button to view all your saved trip plans. You can load, delete, or create new plans from here.",
    vi: "Nhấp vào nút này để xem tất cả kế hoạch chuyến đi đã lưu. Bạn có thể tải, xóa hoặc tạo kế hoạch mới từ đây.",
  },
  tutorial_login_btn_title: {
    en: "Login/Avatar Button",
    vi: "Nút đăng nhập/Avatar",
  },
  tutorial_login_btn_desc: {
    en: "Click this button to login or logout. You must be logged in to save and access your trip plans across devices.",
    vi: "Nhấp vào nút này để đăng nhập hoặc đăng xuất. Bạn phải đăng nhập để lưu và truy cập kế hoạch chuyến đi trên các thiết bị.",
  },

  // Trip Details Steps
  tutorial_trip_details_card_title: {
    en: "Trip Details Card",
    vi: "Thẻ chi tiết chuyến đi",
  },
  tutorial_trip_details_card_desc: {
    en: "This card contains all the essential information about your trip: trip name, number of members, start date, and end date. You can edit any of these details directly. If logged in, use the Save button to preserve your changes.",
    vi: "Thẻ này chứa tất cả thông tin cần thiết về chuyến đi của bạn: tên chuyến đi, số lượng thành viên, ngày bắt đầu và ngày kết thúc. Bạn có thể chỉnh sửa bất kỳ chi tiết nào trực tiếp. Nếu đã đăng nhập, hãy sử dụng nút Lưu để bảo toàn các thay đổi.",
  },
  tutorial_trip_name_input_title: {
    en: "Trip Name Input",
    vi: "Nhập tên chuyến đi",
  },
  tutorial_trip_name_input_desc: {
    en: "Enter a memorable name for your trip here (e.g., 'Summer Vacation', 'Business Trip'). This helps you identify the plan later.",
    vi: "Nhập tên đáng nhớ cho chuyến đi của bạn tại đây (ví dụ: 'Kỳ nghỉ hè', 'Chuyến công tác'). Điều này giúp bạn nhận diện kế hoạch sau này.",
  },
  tutorial_members_input_title: {
    en: "Number of Members Input",
    vi: "Nhập số lượng thành viên",
  },
  tutorial_members_input_desc: {
    en: "Specify how many people are traveling. This information can help with cost estimations and planning.",
    vi: "Chỉ định số người đi du lịch. Thông tin này có thể giúp ước tính chi phí và lập kế hoạch.",
  },
  tutorial_start_date_input_title: {
    en: "Start Date Picker",
    vi: "Chọn ngày bắt đầu",
  },
  tutorial_start_date_input_desc: {
    en: "Click to select the start date of your trip. The app will automatically adjust the number of days based on your date range.",
    vi: "Nhấp để chọn ngày bắt đầu chuyến đi. Ứng dụng sẽ tự động điều chỉnh số ngày dựa trên khoảng ngày của bạn.",
  },
  tutorial_end_date_input_title: {
    en: "End Date Picker",
    vi: "Chọn ngày kết thúc",
  },
  tutorial_end_date_input_desc: {
    en: "Click to select the end date of your trip. Make sure it's on or after the start date.",
    vi: "Nhấp để chọn ngày kết thúc chuyến đi. Đảm bảo nó bằng hoặc sau ngày bắt đầu.",
  },
  tutorial_save_plan_btn_title: {
    en: "Save Plan Button",
    vi: "Nút lưu kế hoạch",
  },
  tutorial_save_plan_btn_desc: {
    en: "Click this button to save your current trip plan. You must be logged in to use this feature. Saved plans can be accessed anytime.",
    vi: "Nhấp vào nút này để lưu kế hoạch chuyến đi hiện tại. Bạn phải đăng nhập để sử dụng tính năng này. Kế hoạch đã lưu có thể được truy cập bất cứ lúc nào.",
  },

  // Day View Steps
  tutorial_day_view_card_title: {
    en: "Day View Card",
    vi: "Thẻ xem theo ngày",
  },
  tutorial_day_view_card_desc: {
    en: "This card is where you manage your daily itinerary. Add destinations to each day, track costs for each place, view all your destinations, and switch between days.",
    vi: "Thẻ này là nơi bạn quản lý lịch trình hàng ngày. Thêm điểm đến cho từng ngày, theo dõi chi phí cho từng địa điểm, xem tất cả điểm đến và chuyển đổi giữa các ngày.",
  },
  tutorial_find_destination_card_title: {
    en: "Find Destination Card",
    vi: "Thẻ tìm điểm đến",
  },
  tutorial_find_destination_card_desc: {
    en: "Use this card to search and discover places to visit. Enter a destination name or location, browse search results, view place details, and add them to your trip. The card provides an easy way to find interesting destinations and integrate them into your itinerary with GPS coordinates automatically.",
    vi: "Sử dụng thẻ này để tìm kiếm và khám phá các địa điểm để tham quan. Nhập tên điểm đến hoặc vị trí, duyệt kết quả tìm kiếm, xem chi tiết địa điểm và thêm chúng vào chuyến đi của bạn. Thẻ này cung cấp cách dễ dàng để tìm các điểm đến thú vị và tích hợp chúng vào lịch trình với tọa độ GPS tự động.",
  },
  tutorial_chatbox_card_title: {
    en: "AI Chat Assistant Card",
    vi: "Thẻ trợ lý chat AI",
  },
  tutorial_chatbox_card_desc: {
    en: "This AI-powered chat assistant helps you generate trip plans automatically. Describe your trip preferences (destination, duration, budget, interests) and let AI create an optimized itinerary. The chat interface allows you to interact with the AI, send messages, view responses, and clear chat history. This feature is only visible in Custom Mode.",
    vi: "Trợ lý chat AI này giúp bạn tạo kế hoạch chuyến đi tự động. Mô tả sở thích chuyến đi (điểm đến, thời gian, ngân sách, sở thích) và để AI tạo lịch trình được tối ưu hóa. Giao diện chat cho phép bạn tương tác với AI, gửi tin nhắn, xem phản hồi và xóa lịch sử chat. Tính năng này chỉ hiển thị trong Chế độ tùy chỉnh.",
  },
  tutorial_day_selector_title: {
    en: "Day Selector Tabs",
    vi: "Tab chọn ngày",
  },
  tutorial_day_selector_desc: {
    en: "Click on these tabs to switch between different days of your trip. Each day can have its own destinations and costs.",
    vi: "Nhấp vào các tab này để chuyển đổi giữa các ngày khác nhau trong chuyến đi. Mỗi ngày có thể có điểm đến và chi phí riêng.",
  },
  tutorial_add_day_btn_title: {
    en: "Add Day Button",
    vi: "Nút thêm ngày",
  },
  tutorial_add_day_btn_desc: {
    en: "Click this button to add a new day to your trip. Useful when you want to extend your trip beyond the original date range.",
    vi: "Nhấp vào nút này để thêm một ngày mới vào chuyến đi. Hữu ích khi bạn muốn kéo dài chuyến đi ngoài khoảng ngày ban đầu.",
  },
  tutorial_all_days_btn_title: {
    en: "All Days View Button",
    vi: "Nút xem tất cả các ngày",
  },
  tutorial_all_days_btn_desc: {
    en: "Click this button to see an overview of all days at once. Great for getting a complete picture of your entire trip.",
    vi: "Nhấp vào nút này để xem tổng quan về tất cả các ngày cùng lúc. Tuyệt vời để có cái nhìn toàn diện về toàn bộ chuyến đi.",
  },
  tutorial_add_destination_btn_title: {
    en: "Add Destination Button",
    vi: "Nút thêm điểm đến",
  },
  tutorial_add_destination_btn_desc: {
    en: "Click this button to add a new destination to the current day. Type the destination name and press Add, or click directly on the map.",
    vi: "Nhấp vào nút này để thêm điểm đến mới vào ngày hiện tại. Nhập tên điểm đến và nhấn Thêm, hoặc nhấp trực tiếp vào bản đồ.",
  },
  tutorial_destination_card_title: {
    en: "Destination Card",
    vi: "Thẻ điểm đến",
  },
  tutorial_destination_card_desc: {
    en: "This card shows each destination with its name, location coordinates, and associated costs. You can edit or delete the destination.",
    vi: "Thẻ này hiển thị mỗi điểm đến với tên, tọa độ vị trí và chi phí liên quan. Bạn có thể chỉnh sửa hoặc xóa điểm đến.",
  },
  tutorial_edit_destination_btn_title: {
    en: "Edit Destination Button",
    vi: "Nút chỉnh sửa điểm đến",
  },
  tutorial_edit_destination_btn_desc: {
    en: "Click the edit icon to modify the destination's name or location. Changes are saved automatically.",
    vi: "Nhấp vào biểu tượng chỉnh sửa để thay đổi tên hoặc vị trí của điểm đến. Thay đổi được lưu tự động.",
  },
  tutorial_delete_destination_btn_title: {
    en: "Delete Destination Button",
    vi: "Nút xóa điểm đn",
  },
  tutorial_delete_destination_btn_desc: {
    en: "Click the trash icon to remove this destination from your itinerary. This also removes all associated costs.",
    vi: "Nhấp vào biểu tượng thùng rác để xóa điểm đến này khỏi lịch trình. Điều này cũng xóa tất cả chi phí liên quan.",
  },
  tutorial_add_cost_btn_title: {
    en: "Add Cost Button",
    vi: "Nút thêm chi phí",
  },
  tutorial_add_cost_btn_desc: {
    en: "Click this button to add a cost item to the destination (e.g., entrance fee, meals). Enter the description and amount.",
    vi: "Nhấp vào nút này để thêm khoản chi phí vào điểm đến (ví dụ: phí vào cửa, bữa ăn). Nhập mô tả và số tiền.",
  },
  tutorial_cost_item_title: {
    en: "Cost Item Display",
    vi: "Hiển thị khoản chi phí",
  },
  tutorial_cost_item_desc: {
    en: "Each cost item shows the description and amount. Click the edit icon to modify or the trash icon to delete it.",
    vi: "Mỗi khoản chi phí hiển thị mô tả và số tiền. Nhấp vào biểu tượng chỉnh sửa để sửa đổi hoặc biểu tượng thùng rác để xóa.",
  },
  tutorial_total_cost_display_title: {
    en: "Total Cost Display",
    vi: "Hiển thị tổng chi phí",
  },
  tutorial_total_cost_display_desc: {
    en: "This shows the total cost for all destinations and days. It updates automatically as you add or remove costs.",
    vi: "Hiển thị tổng chi phí cho tất cả điểm đến và ngày. Nó tự động cập nhật khi bạn thêm hoặc xóa chi phí.",
  },
  tutorial_currency_toggle_title: {
    en: "Currency Toggle Button",
    vi: "Nút chuyển đổi tiền tệ",
  },
  tutorial_currency_toggle_desc: {
    en: "Click this button to toggle between USD and VND. All costs throughout the app will convert automatically.",
    vi: "Nhấp vào nút này để chuyển đổi giữa USD và VND. Tất cả chi phí trong ứng dụng sẽ tự động chuyển đổi.",
  },

  // Map View Steps
  tutorial_map_display_title: {
    en: "Interactive Map Display",
    vi: "Hiển thị bản đồ tương tác",
  },
  tutorial_map_display_desc: {
    en: "This interactive map shows all your destinations. You can zoom, pan, and click on the map to add new destinations directly.",
    vi: "Bản đồ tương tác này hiển thị tất cả điểm đến của bạn. Bạn có thể phóng to, thu nhỏ và nhấp vào bản đồ để thêm điểm đến mới trực tiếp.",
  },
  tutorial_map_markers_title: {
    en: "Destination Markers",
    vi: "Dấu điểm đến",
  },
  tutorial_map_markers_desc: {
    en: "Each destination appears as a numbered marker on the map. Click on a marker to see destination details in an info window.",
    vi: "Mỗi điểm đến xuất hiện dưới dạng dấu đánh số trên bản đồ. Nhấp vào dấu để xem chi tiết điểm đến trong cửa sổ thông tin.",
  },
  tutorial_route_line_title: {
    en: "Route Line Display",
    vi: "Hiển thị đường tuyến",
  },
  tutorial_route_line_desc: {
    en: "Routes between destinations are shown as lines on the map. The color and style help you visualize your journey.",
    vi: "Tuyến đường giữa các điểm đến được hiển thị dưới dạng đường kẻ trên bản đồ. Màu sắc và kiểu giúp bạn hình dung hành trình.",
  },
  tutorial_optimize_route_btn_title: {
    en: "Optimize Route Button",
    vi: "Nút tối ưu hóa lộ trình",
  },
  tutorial_optimize_route_btn_desc: {
    en: "Click this button to automatically reorder your destinations for the most efficient route. Requires at least 2 destinations.",
    vi: "Nhấp vào nút này để tự động sắp xếp lại các điểm đến để có lộ trình hiệu quả nhất. Yêu cầu ít nhất 2 điểm đến.",
  },
  tutorial_center_map_btn_title: {
    en: "Center Map Button",
    vi: "Nút căn giữa bản đồ",
  },
  tutorial_center_map_btn_desc: {
    en: "Click this button to center and zoom the map to show all your destinations at once.",
    vi: "Nhấp vào nút này để căn giữa và phóng to bản đồ để hiển thị tất cả điểm đến cùng lúc."
  },

  // Map View & Route Guidance Combined Steps
  tutorial_map_view_card_title: {
    en: "Map View Card",
    vi: "Thẻ bản đồ"
  },
  tutorial_map_view_card_desc: {
    en: "This interactive map displays all your destinations with markers, route lines connecting them, and zoom/pan controls. You can visualize your entire trip, see distances between locations, and click on markers for destination details. The map automatically adjusts to show all your destinations.",
    vi: "Bản đồ tương tác này hiển thị tất cả điểm đến với các dấu, đường tuyến kết nối chúng và điều khiển thu phóng/di chuyển. Bạn có thể hình dung toàn bộ chuyến đi, xem khoảng cách giữa các vị trí và nhấp vào dấu để xem chi tiết điểm đến. Bản đồ tự động điều chỉnh để hiển thị tất cả điểm đến của bạn."
  },
  tutorial_map_header_switch_title: {
    en: "Switch Between Map & Route Guidance",
    vi: "Chuyển đổi giữa bản đồ & hướng dẫn lộ trình"
  },
  tutorial_map_header_switch_desc: {
    en: "Click on the Map View header (title bar) to toggle between Map View and Route Guidance List. This allows you to switch from viewing all destinations on the map to seeing a detailed list of route segments for navigation.",
    vi: "Nhấp vào tiêu đề Bản đồ (thanh tiêu đề) để chuyển đổi giữa Chế độ bản đồ và Danh sách hướng dẫn lộ trình. Điều này cho phép bạn chuyển từ xem tất cả điểm đến trên bản đồ sang xem danh sách chi tiết các đoạn tuyến đường để điều hướng."
  },
  tutorial_route_guidance_mode_title: {
    en: "Route Guidance List",
    vi: "Danh sách hướng dẫn lộ trình"
  },
  tutorial_route_guidance_mode_desc: {
    en: "In this mode, you'll see a list of all route segments between your destinations. Each segment shows the starting point, destination, distance, and estimated time. Click on any route segment to start turn-by-turn GPS navigation with detailed directions. You can also open the route in Google Maps for external navigation.",
    vi: "Trong chế độ này, bạn sẽ thấy danh sách tất cả các đoạn tuyến đường giữa các điểm đến. Mỗi đoạn hiển thị điểm bắt đầu, đích đến, khoảng cách và thời gian ước tính. Nhấp vào bất kỳ đoạn tuyến đường nào để bắt đầu điều hướng GPS từng bước với hướng dẫn chi tiết. Bạn cũng có thể mở tuyến đường trong Google Maps để điều hướng bên ngoài."
  },

  // ChatBox Steps
  tutorial_chatbox_overview_title: {
    en: "AI Chat Assistant",
    vi: "Trợ lý chat AI"
  },
  tutorial_chatbox_overview_desc: {
    en: "This AI-powered chat helps you generate trip plans automatically. Describe your trip preferences and let AI create an optimized itinerary.",
    vi: "Chat được hỗ trợ bởi AI này giúp bạn tạo kế hoạch chuyến đi tự động. Mô tả sở thích chuyến đi và để AI tạo lịch trình được tối ưu hóa.",
  },
  tutorial_chat_input_title: {
    en: "Chat Message Input",
    vi: "Nhập tin nhắn chat",
  },
  tutorial_chat_input_desc: {
    en: "Type your trip preferences here (destination, duration, budget, interests). Be as detailed as possible for better results.",
    vi: "Nhập sở thích chuyến đi tại đây (điểm đến, thời gian, ngân sách, sở thích). Càng chi tiết càng tốt để có kết quả tốt hơn.",
  },
  tutorial_send_message_btn_title: {
    en: "Send Message Button",
    vi: "Nút gửi tin nhắn",
  },
  tutorial_send_message_btn_desc: {
    en: "Click this button (or press Enter) to send your message to the AI. The AI will process your request and generate a trip plan.",
    vi: "Nhấp vào nút này (hoặc nhấn Enter) để gửi tin nhắn đến AI. AI sẽ xử lý yêu cầu và tạo kế hoạch chuyến đi.",
  },
  tutorial_ai_response_title: {
    en: "AI Response Display",
    vi: "Hiển thị phản hồi AI",
  },
  tutorial_ai_response_desc: {
    en: "The AI's responses appear here with suggested destinations, daily itineraries, and cost estimates based on your preferences.",
    vi: "Phản hồi của AI xuất hiện tại đây với các điểm đến được đề xuất, lịch trình hàng ngày và ước tính chi phí dựa trên sở thích của bạn.",
  },
  tutorial_clear_chat_btn_title: {
    en: "Clear Chat Button",
    vi: "Nút xóa chat",
  },
  tutorial_clear_chat_btn_desc: {
    en: "Click this button to clear the chat history and start a fresh conversation with the AI assistant.",
    vi: "Nhấp vào nút này ể xóa lịch sử chat và bắt đầu cuộc trò chuyện mới với trợ lý AI.",
  },

  // Route Guidance Steps
  tutorial_start_navigation_btn_title: {
    en: "Start Navigation Button",
    vi: "Nút bắt đầu điều hướng",
  },
  tutorial_start_navigation_btn_desc: {
    en: "Click this button on a route segment to start turn-by-turn GPS navigation with detailed directions.",
    vi: "Nhấp vào nút này trên đoạn tuyến đường để bắt đầu điều hướng GPS từng bước với hướng dẫn chi tiết.",
  },
  tutorial_navigation_steps_title: {
    en: "Turn-by-Turn Steps",
    vi: "Các bước từng bước",
  },
  tutorial_navigation_steps_desc: {
    en: "Follow these detailed turn-by-turn directions to navigate from one destination to another. Each step includes distance and instructions.",
    vi: "Làm theo các hướng dẫn chi tiết từng bước này để điều hướng từ điểm đến này đến điểm đến khác. Mỗi bước bao gồm khoảng cách và hướng dẫn.",
  },
  tutorial_close_navigation_btn_title: {
    en: "Close Navigation Button",
    vi: "Nút đóng điều hướng",
  },
  tutorial_close_navigation_btn_desc: {
    en: "Click this button to exit the navigation view and return to the main map view.",
    vi: "Nhấp vào nút này để thoát khỏi chế độ điều hướng và quay lại chế độ xem bản đồ chính.",
  },

  // Settings Steps
  tutorial_language_toggle_title: {
    en: "Language Toggle",
    vi: "Chuyển đổi ngôn ngữ",
  },
  tutorial_language_toggle_desc: {
    en: "Use this toggle to switch between English and Vietnamese. All text in the app will change immediately.",
    vi: "Sử dụng nút này để chuyển đổi giữa tiếng Anh và tiếng Việt. Tất cả văn bản trong ứng dụng sẽ thay đổi ngay lập tức.",
  },
  tutorial_currency_setting_title: {
    en: "Currency Setting Toggle",
    vi: "Chuyển đổi cài đặt tiền tệ",
  },
  tutorial_currency_setting_desc: {
    en: "Use this toggle to switch between USD and VND. All cost displays will convert automatically using the current exchange rate.",
    vi: "Sử dụng nút này để chuyển đổi giữa USD và VND. Tất cả hiển thị chi phí sẽ tự động chuyển đổi theo tỷ giá hiện tại.",
  },
  tutorial_account_info_title: {
    en: "Account Information",
    vi: "Thông tin tài khoản",
  },
  tutorial_account_info_desc: {
    en: "View your account email and profile information here. You can also logout from this section.",
    vi: "Xem email tài khoản và thông tin hồ sơ tại đây. Bạn cũng có thể đăng xuất từ phần này.",
  },
  tutorial_close_settings_btn_title: {
    en: "Close Settings Button",
    vi: "Nút đóng cài đặt",
  },
  tutorial_close_settings_btn_desc: {
    en: "Click this button to close the settings panel and return to the main app view.",
    vi: "Nhấp vào nút này để đóng bảng cài đặt và quay lại giao diện ứng dụng chính.",
  },

  // Saved Plans Steps
  tutorial_plans_list_title: {
    en: "Plans List View",
    vi: "Giao diện danh sách kế hoạch",
  },
  tutorial_plans_list_desc: {
    en: "All your saved trip plans are displayed here as cards showing key information like destinations, days, and total cost.",
    vi: "Tất cả kế hoạch chuyến đi đã lưu được hiển thị tại đây dưới dạng thẻ hiển thị thông tin chính như điểm đến, số ngày và tổng chi phí.",
  },
  tutorial_plan_card_title: {
    en: "Plan Card",
    vi: "Thẻ kế hoạch",
  },
  tutorial_plan_card_desc: {
    en: "Each plan card shows the trip name, number of destinations, days, and total cost. Click on a card to load that plan.",
    vi: "Mỗi thẻ kế hoạch hiển thị tên chuyến đi, số điểm đến, số ngày và tổng chi phí. Nhấp vào thẻ để tải kế hoạch đó.",
  },
  tutorial_load_plan_btn_title: {
    en: "Load Plan Action",
    vi: "Hành động tải kế hoạch",
  },
  tutorial_load_plan_btn_desc: {
    en: "Click on any plan card to load it into the app. All destinations, costs, and dates will be restored.",
    vi: "Nhấp vào bất kỳ thẻ kế hoạch nào để tải nó vào ứng dụng. Tất cả điểm đến, chi phí và ngày tháng sẽ được khôi phục.",
  },
  tutorial_delete_plan_btn_title: {
    en: "Delete Plan Button",
    vi: "Nút xóa kế hoạch",
  },
  tutorial_delete_plan_btn_desc: {
    en: "Click the trash icon on a plan card to permanently delete that saved plan. This action cannot be undone.",
    vi: "Nhấp vào biểu tượng thùng rác trên thẻ kế hoạch để xóa vĩnh viễn kế hoạch đã lưu đó. Hành động này không thể hoàn tác.",
  },
  tutorial_new_plan_btn_title: {
    en: "Create New Plan Button",
    vi: "Nút tạo kế hoạch mới",
  },
  tutorial_new_plan_btn_desc: {
    en: "Click this button to start creating a brand new trip plan from scratch. All current data will be cleared.",
    vi: "Nhấp vào nút này để bắt đầu tạo kế hoạch chuyến đi hoàn toàn mới từ đầu. Tất cả dữ liệu hiện tại sẽ bị xóa.",
  },

  tutorial_layout_title: {
    en: "App Layout Overview",
    vi: "Tổng quan bố cục ứng dụng",
  },
  tutorial_layout_desc: {
    en: "The app consists of a left sidebar for navigation, a main planning area with multiple cards for trip details and destinations, a map view, and an AI chat assistant (in Custom Mode).",
    vi: "Ứng dụng bao gồm thanh bên trái để điều hướng, khu vực lập kế hoạch chính với nhiều thẻ cho chi tiết chuyến đi và điểm đến, chế độ xem bản đồ và trợ lý chat AI (trong Chế độ tùy chỉnh).",
  },
  tutorial_sidebar_title: {
    en: "Sidebar Navigation",
    vi: "Điều hướng thanh bên",
  },
  tutorial_sidebar_desc: {
    en: "The sidebar contains quick access to mode switching (Custom/View), user manual, settings, saved plans, and login/logout. Use these buttons to navigate the app efficiently.",
    vi: "Thanh bên chứa các nút truy cập nhanh để chuyển chế độ (Tùy chỉnh/Xem), hướng dẫn sử dụng, cài đặt, kế hoạch đã lưu và đăng nhập/xuất. Sử dụng các nút này để điều hướng ứng dụng hiệu quả.",
  },
  tutorial_tripdetails_title: {
    en: "Trip Details Card",
    vi: "Thẻ chi tiết chuyến đi",
  },
  tutorial_tripdetails_desc: {
    en: "This card lets you set your trip name, number of members, start and end dates. All your trip information is managed here, and you can save your plan to access it later.",
    vi: "Thẻ này cho phép bạn đặt tên chuyến đi, số thành viên, ngày bt đầu và kết thúc. Tất cả thông tin chuyến đi được quản lý tại đây, và bạn có thể lưu kế hoạch để truy cập sau này.",
  },
  tutorial_dayview_title: {
    en: "Day View Card",
    vi: "Thẻ xem theo ngày",
  },
  tutorial_dayview_desc: {
    en: "The Day View card is where you manage your daily itinerary. Add destinations, track costs for each place, and view all your destinations for each day. You can also switch between days, add new days, or view all days at once.",
    vi: "Thẻ xem theo ngày là nơi bạn quản lý lịch trình hàng ngày. Thêm điểm đến, theo dõi chi phí cho từng địa điểm và xem tất cả điểm đến cho mỗi ngày. Bạn cũng có thể chuyển đổi giữa các ngày, thêm ngày mới hoặc xem tất cả các ngày cùng lúc.",
  },
  tutorial_chatbox_title: {
    en: "AI Chat Assistant Card",
    vi: "Thẻ trợ lý chat AI",
  },
  tutorial_chatbox_desc: {
    en: "The AI Chat Assistant helps you generate trip plans automatically. Describe your dream trip (destination, duration, budget, preferences) and the AI will create an optimized multi-day itinerary for you. This card is only visible in Custom Mode.",
    vi: "Trợ lý chat AI giúp bạn tạo kế hoạch chuyến đi tự động. Mô tả chuyến đi mơ ước của bạn (điểm đến, thời gian, ngân sách, sở thích) và AI sẽ tạo lịch trình nhiều ngày được tối ưu hóa cho bạn. Thẻ này chỉ hiển thị trong Chế độ tùy chỉnh.",
  },
  tutorial_savedplans_title: {
    en: "Saved Plans View",
    vi: "Giao din kế hoạch đã lưu",
  },
  tutorial_savedplans_desc: {
    en: "Access all your saved trip plans here. View plan summaries showing destinations, days, and total costs. Click on any plan to load it, or create a new plan from scratch. You must be logged in to save and access plans.",
    vi: "Truy cập tất cả kế hoạch chuyến đi đã lưu tại đây. Xem tóm tắt kế hoạch hiển thị điểm đến, số ngày và tổng chi phí. Nhấp vào bất kỳ kế hoạch nào để tải nó, hoặc tạo kế hoạch mới từ đầu. Bạn phải đăng nhập để lưu và truy cập kế hoạch.",
  },
  tutorial_interface_title: {
    en: "App Interface Overview",
    vi: "Tổng quan giao diện ứng dụng",
  },
  tutorial_interface_desc: {
    en: "The app has a sidebar on the left with quick access buttons, and the main planning area takes up the rest of the screen.",
    vi: "Ứng dụng có thanh bên bên trái với các nút truy cập nhanh, và khu vực lập kế hoạch chính chiếm phần còn lại của màn hình.",
  },
  tutorial_modes_title: {
    en: "Custom Mode & View Mode",
    vi: "Chế độ tùy chỉnh & Chế độ xem",
  },
  tutorial_modes_desc: {
    en: "Switch between Custom Mode (for editing with chat) and View Mode (for viewing with full-screen map).",
    vi: "Chuyển đổi giữa Chế độ tùy chỉnh (để chỉnh sửa với chat) và Chế độ xem (để xem với bản đồ toàn màn hình).",
  },
  tutorial_settings_title: {
    en: "Open Settings",
    vi: "Mở cài đặt",
  },
  tutorial_settings_desc: {
    en: "Click here to access all app settings including language, currency, and theme customization.",
    vi: "Nhấp vào đây để truy cập tất cả cài đặt ứng dụng bao gồm ngôn ngữ, tiền tệ và tùy chỉnh chủ đề.",
  },
  tutorial_login_title: {
    en: "Login to Save Your Plans",
    vi: "Đăng nhập để lưu kế hoạch",
  },
  tutorial_login_desc: {
    en: "Click the Login button to save your trip plans and access them from any device.",
    vi: "Nhấp vào nút Đăng nhập để lưu kế hoạch chuyến đi và truy cập từ bất kỳ thiết bị nào.",
  },
  tutorial_language_title: {
    en: "Change Language",
    vi: "Thay đổi ngôn ngữ",
  },
  tutorial_language_desc: {
    en: "Switch between English and Vietnamese to use the app in your preferred language.",
    vi: "Chuyển đổi giữa tiếng Anh và tiếng Việt để sử dụng ứng dụng bằng ngôn ngữ ưa thích của bạn.",
  },
  tutorial_currency_title: {
    en: "Change Currency",
    vi: "Thay đổi tiền tệ",
  },
  tutorial_currency_desc: {
    en: "Toggle between USD and VND. All costs throughout the app will update automatically.",
    vi: "Chuyển đổi giữa USD và VND. Tất cả chi phí trong ứng dụng sẽ tự động cập nhật.",
  },
  tutorial_generate_title: {
    en: "Generate Your Plan",
    vi: "Tạo kế hoạch của bạn",
  },
  tutorial_generate_desc: {
    en: "Describe your dream trip and let AI create an optimized itinerary for you.",
    vi: "Mô tả chuyến đi mơ ước của bạn và để AI tạo lịch trình được tối ưu hóa cho bạn.",
  },
  tutorial_tripname_title: {
    en: "Name Your Trip",
    vi: "Đặt tên chuyến đi",
  },
  tutorial_tripname_desc: {
    en: "Give your trip a memorable name to easily identify it later.",
    vi: "Đặt tên đáng nhớ cho chuyến đi để dễ dàng nhận biết sau này.",
  },
  tutorial_members_title: {
    en: "Number of Members",
    vi: "Số lượng thành viên",
  },
  tutorial_members_desc: {
    en: "Enter how many people will be traveling on this trip.",
    vi: "Nhập số người sẽ đi du lịch trong chuyến đi này.",
  },
  tutorial_dates_title: {
    en: "Set Your Trip Dates",
    vi: "Đặt ngày chuyến đi",
  },
  tutorial_dates_desc: {
    en: "Choose your start and end dates. The app will automatically adjust the number of days.",
    vi: "Chọn ngày bắt đầu và kết thúc. Ứng dụng sẽ tự động điều chỉnh số ngày.",
  },
  tutorial_adddays_title: {
    en: "Add More Days",
    vi: "Thêm ngày",
  },
  tutorial_adddays_desc: {
    en: "Click this button to add extra days to your trip manually.",
    vi: "Nhấp vào nút này để thêm thêm ngày vào chuyến đi của bạn một cách thủ công.",
  },
  tutorial_daynav_title: {
    en: "Navigate Between Days",
    vi: "Điều hướng giữa các ngày",
  },
  tutorial_daynav_desc: {
    en: "Use these tabs to switch between different days of your trip.",
    vi: "Sử dụng các tab này để chuyển đổi giữa các ngày khác nhau trong chuyến đi của bạn.",
  },
  tutorial_placedetails_title: {
    en: "View Place Details",
    vi: "Xem chi tiết địa điểm",
  },
  tutorial_placedetails_desc: {
    en: "Click on any destination to see detailed information, costs, and location on the map.",
    vi: "Nhấp vào bất kỳ điểm đến nào để xem thông tin chi tiết, chi phí và vị trí trên bản đồ.",
  },
  tutorial_budget_title: {
    en: "Track Your Budget",
    vi: "Theo dõi ngân sách",
  },
  tutorial_budget_desc: {
    en: "Monitor your total spending across all days and destinations to stay within budget.",
    vi: "Theo dõi tổng chi tiêu của bạn trên tất cả các ngày và điểm đến để ở trong ngân sách.",
  },
  tutorial_gps_title: {
    en: "GPS Navigation",
    vi: "Điều hướng GPS",
  },
  tutorial_gps_desc: {
    en: "Get real-time GPS navigation with turn-by-turn directions to your destinations.",
    vi: "Nhận điều hướng GPS thời gian thực với hướng dn từng bước đến các điểm đến của bạn.",
  },
  tutorial_saveplan_title: {
    en: "Save Your Plan",
    vi: "Lưu kế hoạch",
  },
  tutorial_saveplan_desc: {
    en: "Save your trip plan to access it later. You must be logged in to save plans.",
    vi: "Lưu kế hoạch chuyến đi để truy cập sau này. Bạn phải đăng nhập để lưu kế hoạch.",
  },
  tutorial_myplans_title: {
    en: "My Plans",
    vi: "Kế hoạch của tôi",
  },
  tutorial_myplans_desc: {
    en: "Access all your saved trip plans from this menu. View, edit, or delete existing plans.",
    vi: "Truy cập tất cả các kế hoạch chuyến đi đã lưu từ menu này. Xem, chỉnh sửa hoặc xóa các kế hoạch hiện có.",
  },
  tutorial_loadplan_title: {
    en: "Load a Plan",
    vi: "Tải kế hoạch",
  },
  tutorial_loadplan_desc: {
    en: "Click on any saved plan to load it and continue planning your trip.",
    vi: "Nhấp vào bất kỳ kế hoạch đã lưu nào để tải nó và tiếp tục lập kế hoạch cho chuyến đi của bạn.",
  },
  tutorial_daytabs_title: {
    en: "Navigate Between Days",
    vi: "Điều hướng giữa các ngày",
  },
  tutorial_daytabs_desc: {
    en: "Switch between different days of your trip. You can also delete days you don't need.",
    vi: "Chuyển đổi giữa các ngày khác nhau trong chuyến đi của bạn. Bạn cũng có thể xóa những ngày không cần thiết.",
  },
  tutorial_viewalldays_title: {
    en: "View All Days",
    vi: "Xem tất cả các ngày",
  },
  tutorial_viewalldays_desc: {
    en: "Click here to see an overview of all your trip days at once.",
    vi: "Nhấp vào đây để xem tổng quan về tất cả các ngày trong chuyến đi của bạn cùng một lúc.",
  },
  tutorial_adddest_title: {
    en: "Add Destinations",
    vi: "Thêm điểm đến",
  },
  tutorial_adddest_desc: {
    en: "Add destinations to your daily itinerary by typing a name or clicking on the map.",
    vi: "Thêm điểm đến vào lịch trình hàng ngày của bạn bằng cách nhập tên hoặc nhấp vào bản đồ.",
  },
  tutorial_addcost_title: {
    en: "Add Cost Items",
    vi: "Thêm khoản chi phí",
  },
  tutorial_addcost_desc: {
    en: "Add detailed cost items for each destination to track your expenses accurately.",
    vi: "Thêm các khoản chi phí chi tiết cho từng điểm đến để theo dõi chi tiêu chính xác.",
  },
  tutorial_autoestimate_title: {
    en: "Auto-Estimate Costs",
    vi: "Ước tính chi phí tự động",
  },
  tutorial_autoestimate_desc: {
    en: "Let the app automatically estimate costs for your destinations based on typical expenses.",
    vi: "Để ứng dụng tự động ước tính chi phí cho các điểm đến của bạn dựa trên chi phí điển hình.",
  },
  tutorial_optimize_title: {
    en: "Find Optimal Route",
    vi: "Tìm lộ trình tối ưu",
  },
  tutorial_optimize_desc: {
    en: "Optimize your route for efficient travel between all your destinations.",
    vi: "Tối ưu hóa lộ trình của bạn để di chuyển hiệu quả giữa tất cả các điểm đến.",
  },
  tutorial_mapview_title: {
    en: "View on Map",
    vi: "Xem trên bản đồ",
  },
  tutorial_mapview_desc: {
    en: "Visualize your destinations and routes on the map for better planning.",
    vi: "Hình dung các điểm đến và lộ trình của bạn trên bản đồ để lập kế hoạch tốt hơn.",
  },
  tutorial_routelist_title: {
    en: "Route List",
    vi: "Danh sách tuyến đường",
  },
  tutorial_routelist_desc: {
    en: "See all route segments in a list view with detailed navigation information.",
    vi: "Xem tất cả các đoạn tuyến đường trong chế độ xem danh sách với thông tin điều hướng chi tiết.",
  },
  tutorial_routeguidance_title: {
    en: "Turn-by-Turn Navigation",
    vi: "Điều hướng từng bước",
  },
  tutorial_routeguidance_desc: {
    en: "Get detailed turn-by-turn directions between destinations with GPS navigation support.",
    vi: "Nhận hướng dẫn chi tiết từng bước giữa các điểm đến với hỗ trợ điều hướng GPS.",
  },
  tutorial_complete_title: {
    en: "Tutorial Complete!",
    vi: "Hoàn thành hướng dẫn!",
  },
  tutorial_complete_desc: {
    en: "You've completed the tutorial! You're now ready to plan amazing trips. Happy traveling!",
    vi: "Bạn đã hoàn thành hướng dẫn! Bây giờ bạn đã sẵn sàng để lập kế hoạch cho những chuyến đi tuyệt vời. Chúc bạn du lịch vui vẻ!",
  },

  // User Manual Chapter Titles
  chapter_welcome_sidebar: {
    en: "Welcome & Sidebar",
    vi: "Chào mừng & Thanh bên",
  },
  chapter_welcome_sidebar_desc: {
    en: "Learn app basics and sidebar navigation",
    vi: "Tìm hiểu cơ bản và điều hướng thanh bên",
  },
  chapter_trip_details: {
    en: "Trip Details Card",
    vi: "Thẻ chi tiết chuyến đi",
  },
  chapter_trip_details_desc: {
    en: "Set up your trip information",
    vi: "Thiết lập thông tin chuyến đi",
  },
  chapter_day_view: {
    en: "Day View Card",
    vi: "Thẻ xem theo ngày",
  },
  chapter_day_view_desc: {
    en: "Add destinations and manage daily itinerary",
    vi: "Thêm điểm đến và quản lý lịch trình hàng ngày",
  },
  chapter_find_destination: {
    en: "Find Destination Card",
    vi: "Thẻ tìm điểm đến",
  },
  chapter_find_destination_desc: {
    en: "Search and discover places to visit",
    vi: "Tìm kiếm và khám phá địa điểm để tham quan",
  },
  chapter_map_view: {
    en: "Map View Card",
    vi: "Thẻ bản đồ",
  },
  chapter_map_view_desc: {
    en: "Visualize your destinations on an interactive map",
    vi: "Hình dung các điểm đến trên bản đồ tưng tác",
  },
  chapter_chatbox: {
    en: "AI Chat Assistant",
    vi: "Trợ lý chat AI",
  },
  chapter_chatbox_desc: {
    en: "Generate trip plans with AI assistance",
    vi: "Tạo kế hoạch chuyến đi với trợ giúp AI"
  },
  chapter_map_route_guidance: {
    en: "Map View & Route Guidance",
    vi: "Bản đồ & Hướng dẫn lộ trình"
  },
  chapter_map_route_guidance_desc: {
    en: "Visualize destinations and navigate with GPS",
    vi: "Hình dung điểm đến và điều hướng bằng GPS"
  },
  chapter_route_guidance: {
    en: "Route Guidance Panel",
    vi: "Bảng hướng dẫn lộ trình"
  },
  chapter_settings: {
    en: "Settings Panel",
    vi: "Bảng cài đặt",
  },
  chapter_settings_desc: {
    en: "Customize language, currency, and app preferences",
    vi: "Tùy chỉnh ngôn ngữ, tiền tệ và tùy chọn ứng dụng",
  },
  chapter_saved_plans: {
    en: "Saved Plans View",
    vi: "Giao diện kế hoạch đã lưu",
  },
  chapter_saved_plans_desc: {
    en: "Access and manage all your saved trip plans",
    vi: "Truy cập và quản lý tất cả kế hoạch đã lưu",
  },
  chapter_getting_started: {
    en: "Getting Started",
    vi: "Bắt đầu",
  },
  chapter_getting_started_desc: {
    en: "Learn the basics of using Intelligent Tour Planner",
    vi: "Tìm hiểu cơ bản về Intelligent Tour Planner",
  },

  // User Manual UI
  learnHowToUse: {
    en: "Learn how to use all features",
    vi: "Tìm hiểu cách sử dụng tất cả các tính năng",
  },
  overallProgress: {
    en: "Overall Progress",
    vi: "Tiến độ tổng thể",
  },
  steps: {
    en: "steps",
    vi: "bước",
  },
  step: {
    en: "Step",
    vi: "Bước",
  },
  complete: {
    en: "complete",
    vi: "hoàn thành",
  },
  start: {
    en: "Start",
    vi: "Bắt đầu",
  },
  continue: {
    en: "Continue",
    vi: "Tiếp tục",
  },
  review: {
    en: "Review",
    vi: "Xem lại",
  },
  previous: {
    en: "Previous",
    vi: "Trước",
  },

  // Day View & All Days View
  enterDestinationName: {
    en: "Enter destination name (or click on map)",
    vi: "Nhập tên điểm đến (hoặc nhấp vào bản đồ)",
  },
  adding: {
    en: "Adding...",
    vi: "Đang thêm...",
  },
  noDestinationsYet: {
    en: "No destinations yet. Add a destination in Custome mode!",
    vi: "Chưa có điểm đến nào. Thêm điểm đến ở chế độ tuỳ chỉnh!",
  },
  detailPlaceholder: {
    en: "Detail (e.g., entrance fee)",
    vi: "Chi tiết (ví dụ: phí vào cửa)",
  },
  addCostItem: {
    en: "Add Cost Item",
    vi: "Thêm khoản chi phí",
  },
  destinationTotal: {
    en: "Destination Total:",
    vi: "Tổng điểm đến:",
  },
  dayTotal: {
    en: "Day {n} Total:",
    vi: "Tổng ngày {n}:",
  },
  allDaysOverview: {
    en: "All Days Overview",
    vi: "Tổng quan tất cả các ngày",
  },
  pleaseEnterDestinationName: {
    en: "Please enter a destination name",
    vi: "Vui lòng nhập tên điểm đến",
  },
  destinationAdded: {
    en: "Destination added!",
    vi: "Đã thêm điểm đến!",
  },
  mustHaveOneCostItem: {
    en: "Each destination must have at least one cost item",
    vi: "Mỗi điểm đến phải có ít nhất một khoản chi phí",
  },
  tripTotal: {
    en: "Trip Total:",
    vi: "Tổng chuyến đi:",
  },
  tripDetails: {
    en: "Trip Details",
    vi: "Chi tiết chuyến đi",
  },
  enterTripInfo: {
    en: "Enter your trip information below.",
    vi: "Nhập thông tin chuyến đi của bạn bên dưới.",
  },
  selectDate: {
    en: "Select a date",
    vi: "Chọn một ngày",
  },
  selectPlaceToView: {
    en: "Select a place to view details",
    vi: "Chọn một địa điểm để xem chi tiết",
  },
  places: {
    en: "places",
    vi: "địa điểm",
  },
  costBreakdown: {
    en: "Cost Breakdown",
    vi: "Chi tiết chi phí",
  },
  dates: {
    en: "Dates",
    vi: "Ngày tháng",
  },
  noInstructions: {
    en: "No instructions available.",
    vi: "Không có hướng dẫn nào."
  },
  errorAddingDestination: {
    en: "Error adding destination. Please try again.",
    vi: "Lỗi khi thêm điểm đến. Vui lòng thử lại.",
  },
  errorRemovingDestination: {
    en: "Error removing destination. Please try again.",
    vi: "Lỗi khi xóa điểm đến. Vui lòng thử lại.",
  },
  routeOptimizationFailed: {
    en: "Route optimization failed. Please try again.",
    vi: "Tối ưu hóa lộ trình thất bại. Vui lòng thử lại.",
  },
  authenticationNotFound: {
    en: "Authentication not found. Please log in again.",
    vi: "Không tìm thấy xác thực. Vui lòng đăng nhập lại.",
  },
  sessionExpired: {
    en: "Session expired. Please login again.",
    vi: "Phiên đã hết hạn. Vui lòng đăng nhập lại."
  },
  planSaveFailed: {
    en: "Failed to save trip plan. Please try again.",
    vi: "Lưu kế hoạch chuyến đi thất bại. Vui lòng thử lại."
  },
  wrongNameOrPass: {
    en: "Wrong username or password. Please try again.",
    vi: "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại."
  },
  loginFailedCheckCredentials: {
    en: "Login failed. Please check your credentials and try again.",
    vi: "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại."
  },
  enterNameAndPass: {
    en: "Please enter both username and password.",
    vi: "Vui lòng nhập cả tên đăng nhập và mật khẩu."
  },
  pleaseFillInAllFields: {
    en: "Please fill in all fields.",
    vi: "Vui lòng điền vào tất cả các trường."
  },
  userNameorEmailExists: {
    en: "Username or email already exists. Please choose another.",
    vi: "Tên đăng nhập hoặc email đã tồn tại. Vui lòng chọn cái khác.",
  },
  registationFailed: {
    en: "Registration failed. Please try again.",
    vi: "Đăng ký thất bại. Vui lòng thử lại.",
  },
  updateProfileFailed: {
    en: "Profile update failed. Please try again.",
    vi: "Cập nhật hồ sơ thất bại. Vui lòng thử lại.",
  },
  profileUpdated: {
    en: "Profile updated successfully.",
    vi: "Cập nhật hồ sơ thành công.",
  },
  loadingImages: {
    en: "Loading images...",
    vi: "Đang tải hình ảnh...",
  },
  destinationAlreadyExists: {
    en: "Destination already exists for this day.",
    vi: "Điểm đến đã tồn tại cho ngày này.",
  },
  destinationReplaced: {
    en: "Destination replaced with the new one.",
    vi: "Điểm đến đã được thay thế bằng điểm mới.",
  },
  destinationToReplaceNotFound: {
    en: "Destination to replace not found.",
    vi: "Không tìm thấy điểm đến để thay thế.",
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;
export type Language = "en" | "vi";

export function t(key: TranslationKey, lang: Language): string {
  return TRANSLATIONS[key][lang];
}

export const osrmTypeVi: Record<string, string> = {
  turn: "Rẽ",
  depart: "Rẽ",
  arrive: "Rẽ",
  merge: "Nhập vào làn đường",
  "on ramp": "Vào đường nhánh",
  "off ramp": "Ra khỏi đường nhánh",
  fork: "Đi thẳng",
  "end of road": "Cuối đường",
  roundabout: "Vào vòng xoay",
  "exit roundabout": "Ra khỏi vòng xoay",
  continue: "Rồi",
  rotary: "Vào vòng xoay",
  "exit rotary": "Ra khỏi vòng xoay",
  "roundabout turn": "Vào vòng xoay",
  // ...add more as needed
};

export const osrmModifierVi: Record<string, string> = {
  left: "theo hướng bên trái",
  right: "theo hướng bên phải",
  straight: "đi thẳng",
  sharp: "gắt",
  uturn: "quay đầu",
  "slight right": "theo hướng phải",
  "slight left": "theo hướng trái",
  "sharp right": "theo hướng phải",
  "sharp left": "theo hướng trái",
  // ...add more as needed
};

export function getDirectionVi(type: string, modifier: string): string {
  const typeVi = osrmTypeVi[type] || type;
  const modifierVi = osrmModifierVi[modifier] || modifier;
  if (modifierVi) return `${typeVi} ${modifierVi}`;
  return typeVi;
}