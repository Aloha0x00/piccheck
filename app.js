const fileInput = document.querySelector("#fileInput");
const scanPage = document.querySelector("#scanPage");
const dropzone = document.querySelector("#dropzone");
const uploadFormatError = document.querySelector("#uploadFormatError");
const imageGrid = document.querySelector("#imageGrid");
const selectionSummary = document.querySelector("#selectionSummary");
const selectionCount = document.querySelector("#selectionCount");
const memberRequirement = document.querySelector("#memberRequirement");
const uploadButtonText = document.querySelector("#uploadButtonText");
const analyzeButton = document.querySelector("#analyzeButton");
const urlImportForm = document.querySelector("#urlImportForm");
const imageUrlInput = document.querySelector("#imageUrlInput");
const urlFetchProgress = document.querySelector("#urlFetchProgress");
const urlFetchProgressValue = document.querySelector("#urlFetchProgressValue");
const urlFetchProgressBar = document.querySelector("#urlFetchProgressBar");
const urlImportError = document.querySelector("#urlImportError");
const scoreRing = document.querySelector("#scoreRing");
const scoreValue = document.querySelector("#scoreValue");
const verdict = document.querySelector("#verdict");
const confidence = document.querySelector("#confidence");
const dimensions = document.querySelector("#dimensions");
const fileSize = document.querySelector("#fileSize");
const signals = document.querySelector("#signals");
const languageSelect = document.querySelector("#languageSelect");
const scanNavButton = document.querySelector("#scanNavButton");
const profileNavButton = document.querySelector("#profileNavButton");
const signInButton = document.querySelector("#signInButton");
const heroSignInButton = document.querySelector("#heroSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const memberChip = document.querySelector("#memberChip");
const memberEmail = document.querySelector("#memberEmail");
const memberAvatar = document.querySelector("#memberAvatar");
const accountButton = document.querySelector("#accountButton");
const accountMenu = document.querySelector("#accountMenu");
const profileMenuButton = document.querySelector("#profileMenuButton");
const authDialog = document.querySelector("#authDialog");
const signOutConfirmDialog = document.querySelector("#signOutConfirmDialog");
const cancelSignOutButton = document.querySelector("#cancelSignOutButton");
const confirmSignOutButton = document.querySelector("#confirmSignOutButton");
const googleSignInButton = document.querySelector("#googleSignInButton");
const firebaseStatus = document.querySelector("#firebaseStatus");
const historyStatus = document.querySelector("#historyStatus");
const historyList = document.querySelector("#historyList");
const seeMoreHistoryButton = document.querySelector("#seeMoreHistoryButton");
const profilePage = document.querySelector("#profilePage");
const profileAvatar = document.querySelector("#profileAvatar");
const profileEmail = document.querySelector("#profileEmail");
const profileCloseButton = document.querySelector("#profileCloseButton");
const profileHistory = document.querySelector("#profileHistory");
const historyGridButton = document.querySelector("#historyGridButton");
const historyListButton = document.querySelector("#historyListButton");
const supportBot = document.querySelector("#supportBot");
const supportBotToggle = document.querySelector("#supportBotToggle");
const supportBotMinimize = document.querySelector("#supportBotMinimize");

const MAX_MEMBER_IMAGES = 3;
const MAX_GUEST_SCANS = 5;
const GUEST_SCAN_COUNT_KEY = "pic-check-ai-guest-scan-count";
const SUPPORT_BOT_STATE_KEY = "pic-check-ai-support-bot-state";
const ANALYSIS_CACHE_PREFIX = "ai-media-risk-analysis:";
const ANALYSIS_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
const AI_THRESHOLD = 72;
const REAL_IMAGE_MAX_SCORE = 2;
const HEIC_FORMATS = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const SUPPORTED_IMAGE_FORMATS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
let urlFetchProgressTimer = null;
let urlFetchInFlight = false;

const state = {
  locale: localStorage.getItem("ai-media-risk-locale") || "en",
  selectedItems: [],
  activeItemId: null,
  historyPreviewItem: null,
  scanHistory: [],
  guestScanCount: Number(localStorage.getItem(GUEST_SCAN_COUNT_KEY) || 0),
  historyView: localStorage.getItem("ai-media-history-view") || "grid",
  user: null,
  firebase: {
    ready: false,
    auth: null,
    db: null,
    analytics: null,
    providers: {},
    fns: null,
    collections: null
  }
};

const i18n = {
  en: {
    productName: "PIC Check AI",
    navScan: "Scan",
    navProfile: "Profile",
    signIn: "Sign in",
    signOut: "Sign out",
    signOutConfirmTitle: "Sign out?",
    signOutConfirmBody: "Are you sure you want to sign out of this account?",
    ok: "OK",
    cancel: "Cancel",
    eyebrow: "PIC Check image authenticity platform",
    title: "PIC Check verifies whether images are real or AI-generated",
    titlePrefix: "PIC Check",
    titleCheck: "Check",
    titleMiddle: "checks whether images are real or",
    titleAiGenerated: "AI-generated",
    subtitle: "PIC Check AI helps you identify real or AI-generated images with modern ML analysis, clear visual stamps, detailed reasons and saved scan history. Membership is completely free during the launch promo.",
    heroCta: "Scan an image",
    heroMemberCta: "Become a member",
    memberBenefitsTitle: "Member benefits",
    memberFreeBadge: "FREE during promo",
    memberBenefitUnlimited: "Unlimited scans after guest limit",
    memberBenefitBatch: "Scan 3 images at once",
    memberBenefitHistory: "Saved scan history in your profile",
    heroPanelTitle: "Evidence-based result",
    heroPanelBody: "ML signals, visual stamps, detailed explanations and scan history in one PIC Check workflow.",
    featureOneTitle: "Modern ML analysis",
    featureOneBody: "PIC Check combines optimized algorithms and modern ML model signals to detect whether an image is real or AI-generated.",
    featureTwoTitle: "Clear markers",
    featureTwoBody: "PIC Check adds a clear stamp and detailed notes explaining why an image is likely real or AI-generated, targeting a level of practical accuracy few current tools can match.",
    featureThreeTitle: "Member history",
    featureThreeBody: "Member scan history is saved so users can review previous checks anytime and avoid losing important results.",
    iconCredit: "Icon style reference: Iconfinder free AI icon pack by Eucalyp Studio.",
    faqEyebrow: "FAQ",
    faqTitle: "Questions before you trust the score",
    faqOneQuestion: "Is the result a legal or forensic conclusion?",
    faqOneAnswer: "No. The result is a probabilistic risk score based on provider signals and local visual heuristics. It should be reviewed with human judgment.",
    faqTwoQuestion: "Why can screenshots be misclassified?",
    faqTwoAnswer: "Screenshots, UI captures and compressed images can look unusually smooth or lack camera traces, so the app lowers confidence and explains the signals.",
    faqThreeQuestion: "What happens when API providers hit quota?",
    faqThreeAnswer: "The app falls back to browser-based heuristics and warns that the result is less accurate. Users can contact the admin from the warning message.",
    faqFourQuestion: "Do you save uploaded images?",
    faqFourAnswer: "Guest scans are not saved. Member scans save a compressed image, thumbnail, score and signals in that user's Firestore history.",
    legalFooterText: "By using PIC Check AI, you agree to the legal documents below.",
    termsLink: "Terms of Use",
    conditionsLink: "Conditions",
    legalLink: "Legal",
    uploadImages: "Upload images",
    uploadMore: "Upload more",
    uploadHint: "JPG, PNG, WEBP or GIF. HEIC/HEIF is not supported yet; convert it to JPG/PNG before scanning. Guests get 5 scans total; members can scan 3 images at once and continue after 5.",
    imageUrlPlaceholder: "Paste a public image URL, then press Enter or leave the field",
    loadUrlImage: "Load URL",
    urlLoading: "Loading image...",
    urlFetchProgress: "Fetching image",
    urlInvalid: "Enter a valid public http(s) image URL.",
    urlScanServerRequired: "URL scan requires the local dev server or Vercel deployment. Run npm run dev and open the localhost URL.",
    urlFetchFailed: "Could not load that image URL. The link must be public, direct to an image, and under 12MB.",
    urlNotImage: "This URL does not point to a supported image file. Paste a direct JPG, PNG, WEBP or GIF image link.",
    urlUnsupportedFormat: "This image URL uses an unsupported format. Use JPG, PNG, WEBP or GIF.",
    duplicateImageSkipped: "This image is already selected, so it was not added again.",
    heicUnsupported: "HEIC/HEIF is not supported yet because browser canvas analysis and detector providers may not decode it reliably. Please convert the image to JPG or PNG before scanning.",
    unsupportedImageFormat: "Unsupported image format. Please use JPG, PNG, WEBP or GIF.",
    dropTitle: "Drop images here",
    dropBody: "or choose files from your device",
    scanImages: "Click to Scan",
    scanning: "Scanning...",
    analyzingImage: "Analyzing image",
    analyzingImageBody: "Checking provider signals, visual texture and screenshot traits.",
    summaryTitle: "Latest result",
    emptyVerdict: "Choose an image to start.",
    confidence: "Confidence",
    dimensions: "Dimensions",
    fileSize: "File size",
    signalsTitle: "Detection signals",
    emptySignals: "Upload images to begin analysis.",
    historyTitle: "Scan history",
    historyGuest: "Sign in to save history.",
    historyEmpty: "No scans saved yet.",
    recentScans: "{count} recent",
    seeMore: "See more",
    accountDetails: "Account details",
    profileTitle: "Your scan profile",
    closeProfile: "Close",
    profileHistoryTitle: "Full scan history",
    profileHistoryBody: "Review saved images, filenames, scores and detection reasons.",
    gridView: "Grid",
    listView: "List",
    continueGoogle: "Continue with Google",
    disclaimerTitle: "Disclaimer",
    noteBody: "This tool estimates AI-generation risk from visual and provider signals. Results are probabilistic, may be wrong, and should not be used as the sole basis for legal, financial, employment, academic, or other high-impact decisions.",
    supportTitle: "Need help?",
    supportBadge: "Human support",
    supportBody: "Contact PIC Check support if you need help with scan results, account access, or quota warnings.",
    supportEmail: "Email support",
    supportTelegram: "Chat on Telegram",
    supportBotTitle: "PIC Check support",
    supportBotStatus: "Usually replies fast",
    supportBotBody: "Need help with a scan result or API quota warning? Contact us directly.",
    supportBotOpen: "Open support",
    supportBotHide: "Hide support",
    authTitle: "Become a member",
    authBody: "Membership is completely free during the launch promo. Members can scan 3 images at once, continue after the 5-image guest limit, and keep scan history.",
    firebaseMissing: "Firebase is not configured yet. Add your Firebase config to enable sign-in.",
    firebaseReady: "Firebase is ready. Continue with Google to use member features.",
    authFailed: "Sign-in failed. Check the provider setup and credentials.",
    authUnauthorizedDomain: "Google sign-in is blocked for this domain. Open the app with http://localhost:3000 or add this domain in Firebase Authentication > Settings > Authorized domains.",
    authPopupBlocked: "Google sign-in popup was blocked. Allow popups and try again.",
    authOperationNotAllowed: "Google provider is not enabled for this Firebase project.",
    authRedirecting: "Opening Google sign-in...",
    selectedCount: "{count} image(s) selected",
    memberRequired: "Members can scan 3 images at once and more than 5 images total.",
    memberLimit: "Member benefits: scan 3 images at once and scan beyond the 5-image guest limit.",
    guestLimit: "Guests can scan 1 image at a time, up to 5 images total. Members can scan 3 at once and continue after 5.",
    guestQuotaReached: "You have used 5 guest scans. Become a member to keep scanning.",
    guestQuotaRemaining: "{remaining} guest scan(s) left before membership is required.",
    queued: "Ready to scan",
    scanningImage: "Scanning image...",
    lowRisk: "Real image",
    mediumRisk: "Possible AI-assisted edit",
    highRisk: "AI-generated",
    localFallback: "API unavailable. Local heuristic fallback was used.",
    providerLimitFallback: "Trusted AI detector providers are currently rate-limited or out of quota. The built-in local result is less accurate. Please contact support at johnlahboo@gmail.com or Telegram @movewannamove to report the issue and get help.",
    provider: "Provider",
    providerScore: "{provider} returned an AI score of {score}%.",
    cacheSource: "Result loaded from {layer} cache.",
    fallbackChain: "Provider fallback chain: {chain}.",
    screenshotNote: "This image looks like a screenshot/UI graphic, so confidence should be interpreted carefully.",
    aiMarker: "AI Generated {score}%",
    aiEditedMarker: "AI Edit Warning {score}%",
    realMarker: "Real image",
    viewingResult: "Viewing result",
    selectedForScan: "Selected for scan",
    removeImage: "Remove image",
    authNeeded: "Please sign in to scan 3 images at once or continue after 5 guest scans.",
    firebaseNotReady: "Firebase is not configured yet.",
    savedToHistory: "Saved to your scan history.",
    alreadySaved: "This image is already in your scan history.",
    notSavedGuest: "Guest scan was not saved. Sign in to keep history.",
    fileModeWarning: "API is unavailable because the app is opened as a local file. Run npm run dev and open http://127.0.0.1:3000.",
    unableAnalyze: "Unable to analyze this image.",
    browserReadError: "The browser could not read this image.",
    smoothSynthetic: "Smooth color transitions may resemble synthetic texture.",
    naturalVariation: "Natural variation lowers the AI risk score.",
    lowEdges: "Low sharp-edge density suggests a soft or smoothed image.",
    clearEdges: "Clear edge detail lowers the AI risk score.",
    limitedBrightness: "Limited brightness diversity may indicate rendering or heavy processing.",
    diverseBrightness: "Diverse brightness distribution lowers the risk score.",
    highSaturation: "High color saturation can appear in generated images.",
    squareFormat: "High-resolution square format is common in image generators.",
    pngWebp: "PNG/WEBP usually has fewer camera traces than JPEG photos.",
    scoreRule: "Decision rule: scores above {threshold}% are marked AI-generated, scores from {realThreshold}% to {threshold}% are marked as possible AI-assisted edits, and scores below {realThreshold}% are marked real; this image scored {score}%.",
    smoothnessMetric: "Smoothness: {value}% of sampled transitions were very soft. Higher values can indicate generated or heavily processed textures.",
    edgeMetric: "Edge density: {value}% of sampled areas had sharp contrast. Real photos often retain more irregular edges and micro-detail.",
    entropyMetric: "Brightness diversity: {value}%. Low diversity can come from flat UI screenshots, illustrations, renderings or compressed/generated images.",
    saturationMetric: "Average color saturation: {value}%. Very even or optimized color can increase suspicion, but it is only a weak signal.",
    dimensionMetric: "Image size: {width} × {height}. Square high-resolution files are common in generation tools, while screenshots need lower confidence interpretation.",
    screenshotMetric: "Screenshot check: {result}. Screenshot-like images can look artificially smooth, so this signal reduces over-confident AI claims.",
    screenshotYes: "screenshot-like",
    screenshotNo: "not strongly screenshot-like",
    formatMetric: "Format check: {format}. PNG/WEBP often lacks camera metadata, so format alone is not proof."
  },
  vi: {
    productName: "PIC Check AI",
    navScan: "Scan",
    navProfile: "Profile",
    signIn: "Đăng nhập",
    signOut: "Đăng xuất",
    signOutConfirmTitle: "Đăng xuất?",
    signOutConfirmBody: "Bạn có chắc muốn đăng xuất khỏi tài khoản này không?",
    ok: "OK",
    cancel: "Cancel",
    eyebrow: "Nền tảng xác thực ảnh PIC Check",
    title: "PIC Check kiểm tra ảnh là thật hay AI-generated",
    titlePrefix: "PIC Check",
    titleCheck: "Check",
    titleMiddle: "kiểm tra ảnh là thật hay",
    titleAiGenerated: "AI-generated",
    subtitle: "PIC Check AI giúp kiểm tra ảnh là real hay AI-generated bằng phân tích ML hiện đại, stamp rõ ràng, ghi chú lý do chi tiết và lịch sử scan không bị mất. Member hoàn toàn FREE trong giai đoạn khuyến mãi.",
    heroCta: "Scan ảnh ngay",
    heroMemberCta: "Đăng ký member",
    memberBenefitsTitle: "Quyền lợi member",
    memberFreeBadge: "FREE trong khuyến mãi",
    memberBenefitUnlimited: "Scan không giới hạn sau mức guest",
    memberBenefitBatch: "Scan 3 ảnh cùng lúc",
    memberBenefitHistory: "Lưu lịch sử scan trong profile",
    heroPanelTitle: "Kết quả có bằng chứng",
    heroPanelBody: "Tín hiệu ML, stamp trực quan, giải thích chi tiết và lịch sử scan trong cùng một luồng PIC Check.",
    featureOneTitle: "Phân tích ML hiện đại",
    featureOneBody: "PIC Check sử dụng các thuật toán tối ưu và tín hiệu từ những ML model hiện đại để phát hiện ảnh là real hay AI-generated.",
    featureTwoTitle: "Marker rõ ràng",
    featureTwoBody: "PIC Check dùng stamp rõ ràng và ghi chú chi tiết các lý do vì sao ảnh có khả năng là real hoặc AI-generated, hướng tới độ chính xác thực tế vượt trội so với nhiều sản phẩm hiện có trên thị trường.",
    featureThreeTitle: "Lịch sử member",
    featureThreeBody: "Lịch sử scan được lưu lại để user có thể tra cứu bất cứ lúc nào và không bị mất các kết quả quan trọng.",
    iconCredit: "Tham khảo style icon: bộ AI icon free trên Iconfinder của Eucalyp Studio.",
    faqEyebrow: "FAQ",
    faqTitle: "Những điều cần biết trước khi tin vào điểm số",
    faqOneQuestion: "Kết quả có phải kết luận pháp lý hoặc forensic không?",
    faqOneAnswer: "Không. Kết quả là điểm rủi ro xác suất dựa trên tín hiệu provider và heuristic thị giác local. Cần được review bằng đánh giá của con người.",
    faqTwoQuestion: "Vì sao screenshot có thể bị phân loại sai?",
    faqTwoAnswer: "Screenshot, ảnh UI và ảnh nén có thể quá mượt hoặc thiếu dấu vết camera, nên app giảm confidence và giải thích các tín hiệu liên quan.",
    faqThreeQuestion: "Điều gì xảy ra khi provider bị hết quota?",
    faqThreeAnswer: "App fallback sang heuristic chạy trong browser và cảnh báo rằng kết quả kém chính xác hơn. User có thể liên hệ admin từ cảnh báo đó.",
    faqFourQuestion: "App có lưu ảnh upload không?",
    faqFourAnswer: "Guest scan không được lưu. Member scan lưu ảnh nén, thumbnail, điểm số và tín hiệu vào Firestore history của user đó.",
    legalFooterText: "Khi sử dụng PIC Check AI, bạn đồng ý với các tài liệu pháp lý bên dưới.",
    termsLink: "Điều khoản sử dụng",
    conditionsLink: "Điều kiện",
    legalLink: "Pháp lý",
    uploadImages: "Tải ảnh lên",
    uploadMore: "Tải thêm ảnh",
    uploadHint: "Hỗ trợ JPG, PNG, WEBP hoặc GIF. HEIC/HEIF chưa được hỗ trợ; hãy chuyển sang JPG/PNG trước khi scan. Guest có 5 lượt scan; member scan 3 ảnh/lần và tiếp tục sau 5 lượt.",
    imageUrlPlaceholder: "Dán link ảnh public, rồi bấm Enter hoặc rời khỏi ô nhập",
    loadUrlImage: "Tải từ URL",
    urlLoading: "Đang tải ảnh...",
    urlFetchProgress: "Đang fetch ảnh",
    urlInvalid: "Hãy nhập link ảnh http(s) public hợp lệ.",
    urlScanServerRequired: "Scan bằng URL cần chạy qua local dev server hoặc Vercel. Hãy chạy npm run dev và mở localhost.",
    urlFetchFailed: "Không tải được ảnh từ URL này. Link cần public, trỏ trực tiếp tới ảnh và nhỏ hơn 12MB.",
    urlNotImage: "URL này không trỏ tới file ảnh được hỗ trợ. Hãy dán link ảnh trực tiếp dạng JPG, PNG, WEBP hoặc GIF.",
    urlUnsupportedFormat: "Ảnh từ URL dùng định dạng chưa hỗ trợ. Hãy dùng JPG, PNG, WEBP hoặc GIF.",
    duplicateImageSkipped: "Ảnh này đã được chọn, nên app không thêm lại lần nữa.",
    heicUnsupported: "HEIC/HEIF hiện chưa được hỗ trợ vì browser canvas và detector provider có thể không decode ổn định. Hãy chuyển ảnh sang JPG hoặc PNG trước khi scan.",
    unsupportedImageFormat: "Định dạng ảnh chưa được hỗ trợ. Hãy dùng JPG, PNG, WEBP hoặc GIF.",
    dropTitle: "Kéo thả ảnh vào đây",
    dropBody: "hoặc chọn file từ thiết bị",
    scanImages: "Bấm để Scan",
    scanning: "Đang scan...",
    analyzingImage: "Đang phân tích ảnh",
    analyzingImageBody: "Đang kiểm tra provider, texture thị giác và dấu hiệu screenshot.",
    summaryTitle: "Kết quả mới nhất",
    emptyVerdict: "Chọn ảnh để bắt đầu.",
    confidence: "Độ tin cậy",
    dimensions: "Kích thước",
    fileSize: "Dung lượng",
    signalsTitle: "Tín hiệu phát hiện",
    emptySignals: "Upload ảnh để bắt đầu phân tích.",
    historyTitle: "Lịch sử scan",
    historyGuest: "Đăng nhập để lưu lịch sử.",
    historyEmpty: "Chưa có lịch sử scan.",
    recentScans: "{count} gần nhất",
    seeMore: "Xem thêm",
    accountDetails: "Chi tiết tài khoản",
    profileTitle: "Profile scan của bạn",
    closeProfile: "Đóng",
    profileHistoryTitle: "Toàn bộ lịch sử scan",
    profileHistoryBody: "Xem lại ảnh đã lưu, tên file, điểm số và lý do phát hiện.",
    gridView: "Grid",
    listView: "List",
    continueGoogle: "Tiếp tục với Google",
    disclaimerTitle: "Tuyên bố miễn trừ",
    noteBody: "Công cụ này ước lượng rủi ro ảnh do AI tạo dựa trên tín hiệu thị giác và kết quả từ provider. Kết quả là xác suất, có thể sai, và không nên dùng làm căn cứ duy nhất cho quyết định pháp lý, tài chính, tuyển dụng, học thuật hoặc các quyết định có tác động lớn.",
    supportTitle: "Cần hỗ trợ?",
    supportBadge: "Hỗ trợ trực tiếp",
    supportBody: "Liên hệ PIC Check nếu bạn cần hỗ trợ về kết quả scan, tài khoản hoặc cảnh báo quota API.",
    supportEmail: "Gửi email hỗ trợ",
    supportTelegram: "Chat qua Telegram",
    supportBotTitle: "PIC Check support",
    supportBotStatus: "Thường phản hồi nhanh",
    supportBotBody: "Bạn cần hỗ trợ về kết quả scan hoặc cảnh báo quota API? Liên hệ trực tiếp với chúng tôi.",
    supportBotOpen: "Mở hỗ trợ",
    supportBotHide: "Ẩn hỗ trợ",
    authTitle: "Đăng ký member",
    authBody: "Đăng ký member hiện hoàn toàn FREE trong giai đoạn khuyến mãi. Member scan 3 ảnh cùng lúc, tiếp tục sau giới hạn 5 ảnh của guest và lưu lịch sử scan.",
    firebaseMissing: "Chưa cấu hình Firebase. Hãy thêm Firebase config để bật đăng nhập.",
    firebaseReady: "Firebase đã sẵn sàng. Tiếp tục với Google để dùng tính năng member.",
    authFailed: "Đăng nhập lỗi. Kiểm tra cấu hình provider và thông tin đăng nhập.",
    authUnauthorizedDomain: "Google sign-in đang bị chặn cho domain này. Hãy mở app bằng http://localhost:3000 hoặc thêm domain này trong Firebase Authentication > Settings > Authorized domains.",
    authPopupBlocked: "Popup đăng nhập Google bị chặn. Hãy cho phép popup rồi thử lại.",
    authOperationNotAllowed: "Google provider chưa được bật cho Firebase project này.",
    authRedirecting: "Đang mở đăng nhập Google...",
    selectedCount: "Đã chọn {count} ảnh",
    memberRequired: "Member có thể scan 3 ảnh cùng lúc và scan nhiều hơn 5 ảnh.",
    memberLimit: "Lợi ích member: scan 3 ảnh cùng lúc và scan vượt giới hạn 5 ảnh của guest.",
    guestLimit: "Guest scan 1 ảnh/lần, tối đa 5 ảnh. Member scan 3 ảnh/lần và tiếp tục sau 5 ảnh.",
    guestQuotaReached: "Bạn đã dùng hết 5 lượt scan guest. Hãy đăng ký member để tiếp tục scan.",
    guestQuotaRemaining: "Còn {remaining} lượt scan guest trước khi cần đăng ký member.",
    queued: "Sẵn sàng scan",
    scanningImage: "Đang scan ảnh...",
    lowRisk: "Ảnh thật",
    mediumRisk: "Nghi vấn dùng AI để chỉnh sửa",
    highRisk: "AI-generated",
    localFallback: "Không gọi được API. Đã dùng heuristic local fallback.",
    providerLimitFallback: "Các AI detector provider uy tín hiện đang bị rate limit hoặc hết quota. Kết quả built-in local sẽ kém chính xác hơn. Vui lòng liên hệ support qua email johnlahboo@gmail.com hoặc Telegram @movewannamove để báo lỗi và được hỗ trợ.",
    provider: "Nguồn phân tích",
    providerScore: "{provider} trả về điểm AI {score}%.",
    cacheSource: "Kết quả được lấy từ cache {layer}.",
    fallbackChain: "Chuỗi fallback provider: {chain}.",
    screenshotNote: "Ảnh có đặc điểm giống screenshot/đồ họa UI, nên cần đọc confidence thận trọng hơn.",
    aiMarker: "AI Generated {score}%",
    aiEditedMarker: "Cảnh báo AI chỉnh sửa {score}%",
    realMarker: "Ảnh thật",
    viewingResult: "Đang xem kết quả",
    selectedForScan: "Đã chọn để scan",
    removeImage: "Bỏ ảnh",
    authNeeded: "Vui lòng đăng nhập để scan 3 ảnh cùng lúc hoặc tiếp tục sau 5 lượt guest.",
    firebaseNotReady: "Firebase chưa được cấu hình.",
    savedToHistory: "Đã lưu vào lịch sử scan.",
    alreadySaved: "Ảnh này đã có trong lịch sử scan của bạn.",
    notSavedGuest: "Scan của khách không được lưu. Đăng nhập để giữ lịch sử.",
    fileModeWarning: "API không khả dụng vì app đang được mở bằng file local. Hãy chạy npm run dev và mở http://127.0.0.1:3000.",
    unableAnalyze: "Không thể phân tích ảnh này.",
    browserReadError: "Trình duyệt không đọc được ảnh này.",
    smoothSynthetic: "Vùng chuyển màu mịn có thể giống texture tổng hợp.",
    naturalVariation: "Ảnh có biến thiên tự nhiên hơn, làm giảm điểm rủi ro AI.",
    lowEdges: "Mật độ cạnh sắc thấp, ảnh có xu hướng mềm hoặc bị làm mượt.",
    clearEdges: "Ảnh có nhiều cạnh rõ, làm giảm điểm rủi ro AI.",
    limitedBrightness: "Phân bố sáng tối ít đa dạng, có thể là dấu hiệu ảnh render hoặc xử lý mạnh.",
    diverseBrightness: "Phân bố sáng tối đa dạng, làm giảm điểm rủi ro.",
    highSaturation: "Độ bão hòa màu cao có thể xuất hiện trong ảnh tạo bởi AI.",
    squareFormat: "Ảnh vuông độ phân giải cao thường gặp ở ảnh từ công cụ tạo ảnh.",
    pngWebp: "PNG/WEBP thường có ít dấu vết camera hơn JPEG ảnh chụp.",
    scoreRule: "Quy tắc quyết định: trên {threshold}% là AI-generated, từ {realThreshold}% đến {threshold}% là nghi vấn có dùng AI để chỉnh sửa, dưới {realThreshold}% là ảnh thật; ảnh này đạt {score}%.",
    smoothnessMetric: "Độ mịn: {value}% vùng chuyển màu được lấy mẫu rất mềm. Giá trị cao có thể là dấu hiệu texture tổng hợp hoặc ảnh xử lý mạnh.",
    edgeMetric: "Mật độ cạnh sắc: {value}% vùng lấy mẫu có tương phản rõ. Ảnh thật thường giữ nhiều cạnh bất quy tắc và chi tiết nhỏ hơn.",
    entropyMetric: "Độ đa dạng sáng tối: {value}%. Mức thấp có thể đến từ screenshot UI, minh họa, ảnh render hoặc ảnh nén/tạo bởi AI.",
    saturationMetric: "Độ bão hòa màu trung bình: {value}%. Màu quá đều hoặc được tối ưu có thể tăng nghi vấn, nhưng đây chỉ là tín hiệu yếu.",
    dimensionMetric: "Kích thước ảnh: {width} × {height}. Ảnh vuông độ phân giải cao thường gặp ở công cụ tạo ảnh; screenshot cần đọc với confidence thấp hơn.",
    screenshotMetric: "Kiểm tra screenshot: {result}. Ảnh giống screenshot có thể trông quá mịn, nên tín hiệu này giúp tránh kết luận AI quá mạnh.",
    screenshotYes: "giống screenshot",
    screenshotNo: "không giống screenshot rõ rệt",
    formatMetric: "Kiểm tra định dạng: {format}. PNG/WEBP thường thiếu metadata camera, nhưng chỉ riêng định dạng không phải bằng chứng."
  }
};

Object.assign(i18n, {
  zh: {
    ...i18n.en,
    navScan: "扫描",
    navProfile: "个人资料",
    signIn: "登录",
    eyebrow: "PIC Check 图像真实性平台",
    title: "PIC Check 检查图片是真实还是 AI 生成",
    titlePrefix: "PIC Check",
    titleCheck: "检查",
    titleMiddle: "检查图片是真实还是",
    titleAiGenerated: "AI 生成",
    subtitle: "PIC Check AI 使用现代 ML 分析、清晰标记、详细原因和可保存历史，帮助判断图片是真实还是 AI 生成。推广期会员完全免费。",
    heroCta: "立即扫描图片",
    heroMemberCta: "成为会员",
    heroPanelTitle: "基于证据的结果",
    heroPanelBody: "在一个流程中查看供应商评分、视觉信号、截图检查和扫描历史。",
    featureOneTitle: "现代 ML 分析",
    featureOneBody: "PIC Check 结合优化算法和现代 ML 模型信号，判断图片是真实还是 AI 生成。",
    featureTwoTitle: "清晰标记",
    featureTwoBody: "PIC Check 会添加清晰标记，并解释图片为什么更可能是真实或 AI 生成，目标是在实际场景中达到领先准确度。",
    featureThreeTitle: "会员历史",
    featureThreeBody: "会员扫描历史会被保存，用户可随时回看结果，避免重要检测记录丢失。",
    uploadImages: "上传图片",
    uploadMore: "继续上传",
    uploadHint: "支持 JPG、PNG、WEBP 或 GIF。访客共 5 次扫描；会员一次 3 张且可继续。",
    dropTitle: "将图片拖到这里",
    dropBody: "或从设备选择文件",
    scanImages: "点击扫描",
    scanning: "扫描中...",
    analyzingImage: "正在分析图片",
    analyzingImageBody: "正在检查供应商信号、视觉纹理和截图特征。",
    summaryTitle: "最新结果",
    emptyVerdict: "请选择图片开始。",
    confidence: "置信度",
    dimensions: "尺寸",
    fileSize: "文件大小",
    signalsTitle: "检测信号",
    historyTitle: "扫描历史",
    historyGuest: "登录后可保存历史。",
    historyEmpty: "暂无扫描历史。",
    recentScans: "最近 {count} 条",
    seeMore: "查看更多",
    accountDetails: "账户信息",
    profileTitle: "你的扫描资料",
    closeProfile: "关闭",
    profileHistoryTitle: "完整扫描历史",
    profileHistoryBody: "查看已保存图片、文件名、分数和检测原因。",
    gridView: "网格",
    listView: "列表",
    authTitle: "成为会员",
    authBody: "推广期会员完全免费。会员可一次扫描 3 张图片、超过访客限制继续扫描，并保存扫描历史。",
    continueGoogle: "使用 Google 继续",
    selectedCount: "已选择 {count} 张图片",
    memberRequired: "会员可一次扫描 3 张图片，并扫描超过 5 张。",
    memberLimit: "会员权益：一次扫描 3 张，并超过 5 张访客限制后继续扫描。",
    guestLimit: "访客每次 1 张，总共最多 5 张。会员每次 3 张，且 5 张后可继续。",
    guestQuotaReached: "你已用完 5 次访客扫描。请成为会员继续扫描。",
    guestQuotaRemaining: "还剩 {remaining} 次访客扫描，之后需要会员。",
    queued: "准备扫描",
    scanningImage: "正在扫描图片...",
    lowRisk: "真实图片",
    mediumRisk: "可能经过 AI 辅助编辑",
    highRisk: "AI 生成",
    realMarker: "真实图片",
    removeImage: "移除图片",
    savedToHistory: "已保存到扫描历史。",
    alreadySaved: "这张图片已在你的扫描历史中。",
    notSavedGuest: "访客扫描不会保存。登录后可保存历史。",
    disclaimerTitle: "免责声明"
  },
  hi: {
    ...i18n.en,
    navScan: "स्कैन",
    navProfile: "प्रोफ़ाइल",
    signIn: "साइन इन",
    eyebrow: "PIC Check image authenticity platform",
    title: "PIC Check checks whether images are real or AI-generated",
    titlePrefix: "PIC Check",
    titleCheck: "Check",
    titleMiddle: "checks कि images real हैं या",
    titleAiGenerated: "AI-generated",
    subtitle: "PIC Check AI modern ML analysis, clear stamps, detailed reasons और saved history से image real है या AI-generated यह check करने में मदद करता है। Promo period में membership पूरी तरह FREE है।",
    heroCta: "छवि स्कैन करें",
    heroMemberCta: "सदस्य बनें",
    heroPanelTitle: "साक्ष्य-आधारित परिणाम",
    heroPanelBody: "प्रोवाइडर स्कोर, विज़ुअल संकेत, स्क्रीनशॉट जांच और इतिहास एक ही workflow में।",
    featureOneTitle: "Modern ML analysis",
    featureOneBody: "PIC Check optimized algorithms और modern ML model signals का उपयोग करके image real है या AI-generated detect करता है।",
    featureTwoTitle: "स्पष्ट मार्कर",
    featureTwoBody: "PIC Check clear stamp और detailed reasons दिखाता है कि image likely real है या AI-generated, practical accuracy को current tools से बेहतर बनाने के लक्ष्य के साथ।",
    featureThreeTitle: "सदस्य इतिहास",
    featureThreeBody: "Member scan history saved रहती है ताकि users previous checks कभी भी review कर सकें और important results न खोएं।",
    uploadImages: "छवियां अपलोड करें",
    uploadMore: "और अपलोड करें",
    uploadHint: "JPG, PNG, WEBP या GIF। Guests को 5 scans; members 3 images at once और 5 के बाद continue।",
    dropTitle: "छवियां यहां छोड़ें",
    dropBody: "या डिवाइस से फ़ाइल चुनें",
    scanImages: "Click to Scan",
    scanning: "स्कैन हो रहा है...",
    analyzingImage: "छवि का विश्लेषण हो रहा है",
    analyzingImageBody: "Provider signals, visual texture और screenshot traits जांचे जा रहे हैं।",
    summaryTitle: "नवीनतम परिणाम",
    emptyVerdict: "शुरू करने के लिए छवि चुनें।",
    confidence: "विश्वास",
    dimensions: "आकार",
    fileSize: "फ़ाइल आकार",
    signalsTitle: "डिटेक्शन संकेत",
    historyTitle: "स्कैन इतिहास",
    historyGuest: "इतिहास सेव करने के लिए साइन इन करें।",
    historyEmpty: "अभी कोई scan history नहीं।",
    recentScans: "{count} हाल के",
    seeMore: "और देखें",
    accountDetails: "खाता विवरण",
    profileTitle: "आपकी scan profile",
    closeProfile: "बंद करें",
    profileHistoryTitle: "पूरा scan history",
    profileHistoryBody: "सेव की गई छवियां, filename, score और reasons देखें।",
    gridView: "ग्रिड",
    listView: "लिस्ट",
    authTitle: "सदस्य बनें",
    authBody: "Launch promo में membership पूरी तरह FREE है। Members 3 images एक साथ scan कर सकते हैं, guest limit के बाद continue कर सकते हैं और scan history रख सकते हैं।",
    continueGoogle: "Google से जारी रखें",
    selectedCount: "{count} छवि चुनी गई",
    memberRequired: "Members 3 images एक साथ और 5 से ज्यादा total images scan कर सकते हैं।",
    memberLimit: "Member benefits: 3 images एक साथ scan करें और 5-image guest limit के बाद continue करें।",
    guestLimit: "Guests 1 image at a time, कुल 5 images. Members 3 at once और 5 के बाद continue।",
    guestQuotaReached: "आपने 5 guest scans use कर लिए हैं। Continue करने के लिए member बनें।",
    guestQuotaRemaining: "{remaining} guest scan(s) बाकी हैं, फिर membership जरूरी होगी।",
    queued: "Scan के लिए तैयार",
    scanningImage: "छवि scan हो रही है...",
    lowRisk: "Real image",
    mediumRisk: "Possible AI-assisted edit",
    highRisk: "AI-generated",
    realMarker: "वास्तविक छवि",
    removeImage: "छवि हटाएं",
    savedToHistory: "Scan history में सेव किया गया।",
    alreadySaved: "यह छवि पहले से scan history में है।",
    notSavedGuest: "Guest scan save नहीं हुआ। History रखने के लिए sign in करें।",
    disclaimerTitle: "अस्वीकरण"
  },
  es: {
    ...i18n.en,
    navScan: "Escanear",
    navProfile: "Perfil",
    signIn: "Iniciar sesión",
    eyebrow: "Plataforma de autenticidad de imágenes PIC Check",
    title: "PIC Check comprueba si una imagen es real o AI-generated",
    titlePrefix: "PIC Check",
    titleCheck: "comprueba",
    titleMiddle: "comprueba si una imagen es real o",
    titleAiGenerated: "AI-generated",
    subtitle: "PIC Check AI ayuda a comprobar si una imagen es real o AI-generated con análisis ML moderno, sellos claros, razones detalladas e historial guardado. La membresía es gratis durante la promoción.",
    heroCta: "Escanear imagen",
    heroMemberCta: "Hazte miembro",
    heroPanelTitle: "Resultado basado en evidencia",
    heroPanelBody: "Puntuación del proveedor, señales visuales, revisión de capturas e historial en un solo flujo.",
    featureOneTitle: "Análisis ML moderno",
    featureOneBody: "PIC Check combina algoritmos optimizados y señales de modelos ML modernos para detectar si una imagen es real o AI-generated.",
    featureTwoTitle: "Marcadores claros",
    featureTwoBody: "PIC Check agrega un sello claro y notas detalladas sobre por qué una imagen parece real o AI-generated, buscando una precisión práctica difícil de igualar.",
    featureThreeTitle: "Historial de miembros",
    featureThreeBody: "El historial de escaneos se guarda para que el usuario pueda consultarlo luego y no pierda resultados importantes.",
    uploadImages: "Subir imágenes",
    uploadMore: "Subir más",
    uploadHint: "JPG, PNG, WEBP o GIF. Invitados: 5 escaneos; miembros: 3 imágenes a la vez y continúan después de 5.",
    dropTitle: "Suelta imágenes aquí",
    dropBody: "o elige archivos de tu dispositivo",
    scanImages: "Click para escanear",
    scanning: "Escaneando...",
    analyzingImage: "Analizando imagen",
    analyzingImageBody: "Revisando señales del proveedor, textura visual y rasgos de captura.",
    summaryTitle: "Último resultado",
    emptyVerdict: "Elige una imagen para empezar.",
    confidence: "Confianza",
    dimensions: "Dimensiones",
    fileSize: "Tamaño",
    signalsTitle: "Señales de detección",
    historyTitle: "Historial",
    historyGuest: "Inicia sesión para guardar historial.",
    historyEmpty: "Aún no hay escaneos guardados.",
    recentScans: "{count} recientes",
    seeMore: "Ver más",
    accountDetails: "Cuenta",
    profileTitle: "Tu perfil de escaneos",
    closeProfile: "Cerrar",
    profileHistoryTitle: "Historial completo",
    profileHistoryBody: "Revisa imágenes guardadas, nombres, puntuaciones y razones.",
    gridView: "Cuadrícula",
    listView: "Lista",
    authTitle: "Hazte miembro",
    authBody: "La membresía es gratis durante la promoción. Los miembros pueden escanear 3 imágenes a la vez, continuar después del límite de invitado y guardar historial.",
    continueGoogle: "Continuar con Google",
    selectedCount: "{count} imagen(es) seleccionada(s)",
    memberRequired: "Los miembros pueden escanear 3 imágenes a la vez y más de 5 en total.",
    memberLimit: "Beneficios: escanear 3 imágenes a la vez y superar el límite de 5 para invitados.",
    guestLimit: "Invitados: 1 imagen a la vez, máximo 5. Miembros: 3 a la vez y continúan después de 5.",
    guestQuotaReached: "Ya usaste 5 escaneos de invitado. Hazte miembro para continuar.",
    guestQuotaRemaining: "Quedan {remaining} escaneo(s) de invitado antes de requerir membresía.",
    queued: "Listo para escanear",
    scanningImage: "Escaneando imagen...",
    lowRisk: "Imagen real",
    mediumRisk: "Posible edición asistida por IA",
    highRisk: "AI-generated",
    realMarker: "Imagen real",
    removeImage: "Quitar imagen",
    savedToHistory: "Guardado en tu historial.",
    alreadySaved: "Esta imagen ya está en tu historial.",
    notSavedGuest: "El escaneo de invitado no se guardó. Inicia sesión para guardar historial.",
    disclaimerTitle: "Aviso"
  },
  ar: {
    ...i18n.en,
    navScan: "فحص",
    navProfile: "الملف",
    signIn: "تسجيل الدخول",
    eyebrow: "منصة PIC Check للتحقق من الصور",
    title: "PIC Check يتحقق مما إذا كانت الصورة حقيقية أو مولدة بالذكاء الاصطناعي",
    titlePrefix: "PIC Check",
    titleCheck: "تحقق",
    titleMiddle: "يتحقق مما إذا كانت الصور حقيقية أو",
    titleAiGenerated: "مولدة بالذكاء الاصطناعي",
    subtitle: "يساعد PIC Check AI على معرفة ما إذا كانت الصورة حقيقية أو مولدة بالذكاء الاصطناعي باستخدام تحليل ML حديث، أختام واضحة، أسباب تفصيلية وسجل محفوظ. العضوية مجانية خلال فترة العرض.",
    heroCta: "افحص صورة",
    heroMemberCta: "كن عضواً",
    heroPanelTitle: "نتيجة مبنية على الأدلة",
    heroPanelBody: "درجة المزود، الإشارات البصرية، فحص لقطات الشاشة وسجل الفحص في مسار واحد.",
    featureOneTitle: "تحليل ML حديث",
    featureOneBody: "يجمع PIC Check بين خوارزميات محسنة وإشارات من نماذج ML حديثة لاكتشاف ما إذا كانت الصورة حقيقية أو مولدة بالذكاء الاصطناعي.",
    featureTwoTitle: "علامات واضحة",
    featureTwoBody: "يضيف PIC Check ختماً واضحاً وملاحظات تفصيلية تشرح لماذا تبدو الصورة حقيقية أو مولدة بالذكاء الاصطناعي، بهدف دقة عملية عالية.",
    featureThreeTitle: "سجل العضو",
    featureThreeBody: "يتم حفظ سجل الفحوصات للأعضاء حتى يمكن الرجوع إلى النتائج السابقة وعدم فقدان النتائج المهمة.",
    uploadImages: "رفع الصور",
    uploadMore: "رفع المزيد",
    uploadHint: "JPG أو PNG أو WEBP أو GIF. الضيف له 5 فحوصات؛ العضو يفحص 3 صور مرة واحدة ويستمر بعد 5.",
    dropTitle: "اسحب الصور هنا",
    dropBody: "أو اختر ملفات من جهازك",
    scanImages: "اضغط للفحص",
    scanning: "جار الفحص...",
    analyzingImage: "جار تحليل الصورة",
    analyzingImageBody: "يتم فحص إشارات المزود والملمس البصري وخصائص لقطة الشاشة.",
    summaryTitle: "آخر نتيجة",
    emptyVerdict: "اختر صورة للبدء.",
    confidence: "الثقة",
    dimensions: "الأبعاد",
    fileSize: "حجم الملف",
    signalsTitle: "إشارات الكشف",
    historyTitle: "سجل الفحص",
    historyGuest: "سجّل الدخول لحفظ السجل.",
    historyEmpty: "لا يوجد سجل فحص بعد.",
    recentScans: "{count} حديثة",
    seeMore: "عرض المزيد",
    accountDetails: "تفاصيل الحساب",
    profileTitle: "ملف الفحوصات",
    closeProfile: "إغلاق",
    profileHistoryTitle: "سجل الفحص الكامل",
    profileHistoryBody: "راجع الصور المحفوظة وأسماء الملفات والنتائج والأسباب.",
    gridView: "شبكة",
    listView: "قائمة",
    authTitle: "كن عضواً",
    authBody: "العضوية مجانية خلال فترة العرض. يمكن للأعضاء فحص 3 صور مرة واحدة، الاستمرار بعد حد الضيف وحفظ سجل الفحوصات.",
    continueGoogle: "المتابعة باستخدام Google",
    selectedCount: "تم اختيار {count} صورة",
    memberRequired: "يمكن للأعضاء فحص 3 صور مرة واحدة وأكثر من 5 صور إجمالاً.",
    memberLimit: "مزايا العضو: فحص 3 صور مرة واحدة والاستمرار بعد حد 5 صور للضيف.",
    guestLimit: "الضيف يفحص صورة واحدة كل مرة، حتى 5 صور. العضو يفحص 3 صور ويستمر بعد 5.",
    guestQuotaReached: "استخدمت 5 فحوصات كضيف. كن عضواً للمتابعة.",
    guestQuotaRemaining: "تبقى {remaining} فحص/فحوصات كضيف قبل الحاجة للعضوية.",
    queued: "جاهز للفحص",
    scanningImage: "جار فحص الصورة...",
    lowRisk: "صورة حقيقية",
    mediumRisk: "تعديل محتمل بمساعدة الذكاء الاصطناعي",
    highRisk: "مولدة بالذكاء الاصطناعي",
    realMarker: "صورة حقيقية",
    removeImage: "إزالة الصورة",
    savedToHistory: "تم الحفظ في سجل الفحص.",
    alreadySaved: "هذه الصورة موجودة مسبقاً في سجل الفحص.",
    notSavedGuest: "لم يتم حفظ فحص الضيف. سجّل الدخول لحفظ السجل.",
    disclaimerTitle: "إخلاء مسؤولية"
  }
});

Object.assign(i18n.zh, {
  faqEyebrow: "常见问题",
  faqTitle: "信任分数前需要了解的问题",
  faqOneQuestion: "结果是法律或取证结论吗？",
  faqOneAnswer: "不是。结果只是基于供应商信号和本地视觉启发式的概率风险评分，应结合人工判断。",
  faqTwoQuestion: "为什么截图可能被误判？",
  faqTwoAnswer: "截图、UI 图片和压缩图片可能过于平滑或缺少相机痕迹，因此应用会降低置信度并解释相关信号。",
  faqThreeQuestion: "API 供应商达到配额时会怎样？",
  faqThreeAnswer: "应用会回退到浏览器端启发式检测，并提示结果准确性较低。用户可通过提示中的联系方式联系管理员。",
  faqFourQuestion: "你们会保存上传的图片吗？",
  faqFourAnswer: "访客扫描不会保存。会员扫描会在该用户的 Firestore 历史中保存压缩图、缩略图、分数和信号。",
  legalFooterText: "使用 PIC Check AI 即表示你同意以下法律文件。",
  termsLink: "使用条款",
  conditionsLink: "条件",
  legalLink: "法律声明"
});

Object.assign(i18n.hi, {
  faqEyebrow: "FAQ",
  faqTitle: "Score पर भरोसा करने से पहले जरूरी बातें",
  faqOneQuestion: "क्या परिणाम कानूनी या forensic निष्कर्ष है?",
  faqOneAnswer: "नहीं। यह provider signals और local visual heuristics पर आधारित probabilistic risk score है; human judgment जरूरी है।",
  faqTwoQuestion: "Screenshots गलत classify क्यों हो सकते हैं?",
  faqTwoAnswer: "Screenshots, UI captures और compressed images बहुत smooth लग सकते हैं या camera traces नहीं रखते, इसलिए app confidence कम करता है और signals explain करता है।",
  faqThreeQuestion: "API providers quota hit करें तो क्या होगा?",
  faqThreeAnswer: "App browser-based heuristics पर fallback करता है और बताता है कि result कम accurate है। User warning message से admin contact कर सकता है।",
  faqFourQuestion: "क्या uploaded images save होती हैं?",
  faqFourAnswer: "Guest scans save नहीं होते। Member scans compressed image, thumbnail, score और signals को user's Firestore history में save करते हैं।",
  legalFooterText: "PIC Check AI का उपयोग करके आप नीचे दिए legal documents से सहमत होते हैं।",
  termsLink: "Terms of Use",
  conditionsLink: "Conditions",
  legalLink: "Legal"
});

Object.assign(i18n.es, {
  faqEyebrow: "FAQ",
  faqTitle: "Preguntas antes de confiar en la puntuación",
  faqOneQuestion: "¿El resultado es una conclusión legal o forense?",
  faqOneAnswer: "No. Es una puntuación probabilística de riesgo basada en señales de proveedores y heurísticas visuales locales. Debe revisarse con criterio humano.",
  faqTwoQuestion: "¿Por qué las capturas pueden clasificarse mal?",
  faqTwoAnswer: "Las capturas, interfaces e imágenes comprimidas pueden verse demasiado suaves o no tener rastros de cámara, por eso la app reduce la confianza y explica las señales.",
  faqThreeQuestion: "¿Qué ocurre si los proveedores llegan al límite de cuota?",
  faqThreeAnswer: "La app usa heurísticas en el navegador y advierte que el resultado es menos preciso. El usuario puede contactar al admin desde el aviso.",
  faqFourQuestion: "¿Guardan las imágenes subidas?",
  faqFourAnswer: "Los escaneos de invitados no se guardan. Los miembros guardan imagen comprimida, miniatura, puntuación y señales en su historial de Firestore.",
  legalFooterText: "Al usar PIC Check AI aceptas los documentos legales siguientes.",
  termsLink: "Términos de uso",
  conditionsLink: "Condiciones",
  legalLink: "Legal"
});

Object.assign(i18n.ar, {
  faqEyebrow: "الأسئلة الشائعة",
  faqTitle: "أسئلة قبل الاعتماد على النتيجة",
  faqOneQuestion: "هل النتيجة استنتاج قانوني أو جنائي؟",
  faqOneAnswer: "لا. النتيجة درجة مخاطر احتمالية مبنية على إشارات المزود وخوارزميات بصرية محلية، ويجب مراجعتها بحكم بشري.",
  faqTwoQuestion: "لماذا قد تُصنف لقطات الشاشة بشكل خاطئ؟",
  faqTwoAnswer: "لقطات الشاشة وواجهات المستخدم والصور المضغوطة قد تبدو ناعمة جداً أو بلا آثار كاميرا، لذلك يخفض التطبيق الثقة ويشرح الإشارات.",
  faqThreeQuestion: "ماذا يحدث عند انتهاء حصة مزودي API؟",
  faqThreeAnswer: "يعود التطبيق إلى heuristics داخل المتصفح ويعرض تحذيراً بأن النتيجة أقل دقة. يمكن للمستخدم التواصل مع المسؤول من رسالة التحذير.",
  faqFourQuestion: "هل تحفظون الصور المرفوعة؟",
  faqFourAnswer: "فحوصات الضيف لا تحفظ. فحوصات الأعضاء تحفظ صورة مضغوطة، thumbnail، النتيجة والإشارات في سجل Firestore الخاص بالمستخدم.",
  legalFooterText: "باستخدام PIC Check AI فأنت توافق على الوثائق القانونية أدناه.",
  termsLink: "شروط الاستخدام",
  conditionsLink: "الشروط",
  legalLink: "قانوني"
});

initialize();

function initialize() {
  languageSelect.value = state.locale;
  applyLocale();
  bindEvents();
  initializeFirebase();
  restoreSupportBotState();
  renderSelection();
}

function bindEvents() {
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-dragging");
  });

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    handleFiles(filesFromDataTransfer(event.dataTransfer));
  });

  fileInput.addEventListener("change", (event) => {
    handleFiles(Array.from(event.target.files || []));
    fileInput.value = "";
  });

  urlImportForm.addEventListener("submit", loadImageFromUrl);
  imageUrlInput.addEventListener("blur", () => {
    if (imageUrlInput.value.trim()) loadImageFromUrl();
  });
  analyzeButton.addEventListener("click", analyzeSelectedImages);
  scanNavButton.addEventListener("click", () => showPage("scan"));
  profileNavButton.addEventListener("click", () => showPage("profile"));
  languageSelect.addEventListener("change", () => {
    state.locale = languageSelect.value;
    localStorage.setItem("ai-media-risk-locale", state.locale);
    applyLocale();
    renderSelection();
  });

  signInButton.addEventListener("click", openAuthDialog);
  heroSignInButton.addEventListener("click", () => {
    if (state.user) {
      showPage("profile");
      return;
    }
    openAuthDialog();
  });
  memberRequirement.addEventListener("click", (event) => {
    if (event.target.closest("[data-action='inline-sign-in']")) openAuthDialog();
  });
  accountButton.addEventListener("click", toggleAccountMenu);
  profileMenuButton.addEventListener("click", () => {
    closeAccountMenu();
    showPage("profile");
  });
  signOutButton.addEventListener("click", () => {
    closeAccountMenu();
    signOutConfirmDialog.showModal();
  });
  cancelSignOutButton.addEventListener("click", () => signOutConfirmDialog.close());
  confirmSignOutButton.addEventListener("click", signOutMember);
  document.addEventListener("click", (event) => {
    if (!memberChip.contains(event.target)) closeAccountMenu();
  });
  seeMoreHistoryButton.addEventListener("click", () => showPage("profile"));
  profileCloseButton.addEventListener("click", () => showPage("scan"));
  historyGridButton.addEventListener("click", () => setHistoryView("grid"));
  historyListButton.addEventListener("click", () => setHistoryView("list"));
  googleSignInButton.addEventListener("click", () => signInWithProvider("google"));
  supportBotToggle.addEventListener("click", () => setSupportBotOpen(true));
  supportBotMinimize.addEventListener("click", () => setSupportBotOpen(false));
}

function restoreSupportBotState() {
  setSupportBotOpen(localStorage.getItem(SUPPORT_BOT_STATE_KEY) === "open", false);
}

function setSupportBotOpen(isOpen, persist = true) {
  supportBot.classList.toggle("is-open", isOpen);
  supportBot.classList.toggle("is-collapsed", !isOpen);
  supportBotToggle.setAttribute("aria-label", t("supportBotOpen"));
  supportBotMinimize.setAttribute("aria-label", t("supportBotHide"));
  supportBotToggle.setAttribute("aria-expanded", String(isOpen));
  if (persist) localStorage.setItem(SUPPORT_BOT_STATE_KEY, isOpen ? "open" : "collapsed");
}

async function initializeFirebase() {
  try {
    const { firebaseConfig, firebaseCollections } = await import("./firebase-config.js");

    if (!isFirebaseConfigReady(firebaseConfig)) {
      setFirebaseReady(false);
      return;
    }

    const [firebaseApp, firebaseAuth, firestore, analyticsModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js")
    ]);

    const app = firebaseApp.initializeApp(firebaseConfig);
    const auth = firebaseAuth.getAuth(app);
    const db = firestore.getFirestore(app);
    const analytics = firebaseConfig.measurementId ? analyticsModule.getAnalytics(app) : null;

    state.firebase = {
      ready: true,
      auth,
      db,
      analytics,
      collections: firebaseCollections,
      providers: {
        google: new firebaseAuth.GoogleAuthProvider()
      },
      fns: {
        onAuthStateChanged: firebaseAuth.onAuthStateChanged,
        signInWithPopup: firebaseAuth.signInWithPopup,
        signInWithRedirect: firebaseAuth.signInWithRedirect,
        getRedirectResult: firebaseAuth.getRedirectResult,
        signOut: firebaseAuth.signOut,
        setDoc: firestore.setDoc,
        doc: firestore.doc,
        addDoc: firestore.addDoc,
        collection: firestore.collection,
        query: firestore.query,
        where: firestore.where,
        orderBy: firestore.orderBy,
        limit: firestore.limit,
        getDocs: firestore.getDocs,
        serverTimestamp: firestore.serverTimestamp,
        logEvent: analyticsModule.logEvent
      }
    };

    state.firebase.fns.onAuthStateChanged(auth, async (user) => {
      state.user = user;
      renderMemberState();
      if (user) {
        await saveMarketingMember(user);
        await loadScanHistory();
      } else {
        state.scanHistory = [];
        renderHistory([]);
        renderProfileHistory();
      }
      renderSelection();
    });

    await completePendingRedirectSignIn();
    setFirebaseReady(true);
    trackEvent("app_loaded");
  } catch (error) {
    console.warn("Firebase unavailable:", error);
    setFirebaseReady(false);
  }
}

function isFirebaseConfigReady(config) {
  return Boolean(config?.apiKey && !String(config.apiKey).startsWith("YOUR_") && config?.projectId);
}

function setFirebaseReady(isReady) {
  state.firebase.ready = isReady;
  firebaseStatus.textContent = t(isReady ? "firebaseReady" : "firebaseMissing");
  googleSignInButton.disabled = !isReady;
}

function handleFiles(files) {
  clearUploadFormatError();
  const rejectedHeic = files.filter(isHeicFile);
  const imageFiles = files.filter(isSupportedImageFile);

  if (rejectedHeic.length) showUploadFormatError(t("heicUnsupported"));
  if (!imageFiles.length) {
    if (files.length && !rejectedHeic.length) showUploadFormatError(t("unsupportedImageFormat"));
    return;
  }

  state.historyPreviewItem = null;

  if (!state.user) {
    clearSelectedItems();
    resetLatestResult();
  }

  const remainingSlots = state.user ? Math.max(0, MAX_MEMBER_IMAGES - state.selectedItems.length) : 1;
  const selectedKeys = new Set(state.selectedItems.map((item) => item.fileKey || fileSelectionKey(item.file)));
  const uniqueImageFiles = imageFiles.filter((file) => {
    const key = fileSelectionKey(file);
    if (selectedKeys.has(key)) return false;
    selectedKeys.add(key);
    return true;
  });
  const duplicateCount = imageFiles.length - uniqueImageFiles.length;
  const accepted = uniqueImageFiles.slice(0, remainingSlots);

  accepted.forEach((file) => {
    state.selectedItems.push({
      id: crypto.randomUUID(),
      file,
      fileKey: fileSelectionKey(file),
      objectUrl: URL.createObjectURL(file),
      result: null,
      status: t("queued")
    });
  });

  if (accepted.length) {
    state.activeItemId = state.selectedItems[state.selectedItems.length - accepted.length]?.id || null;
  }

  renderSelection();
  if (accepted.length) renderActiveItemResult();
  if (duplicateCount && !accepted.length) setSignals([t("duplicateImageSkipped")]);
}

function filesFromDataTransfer(dataTransfer) {
  const files = Array.from(dataTransfer?.files || []);
  if (files.length) return files;

  return Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter(Boolean);
}

function showUploadFormatError(message) {
  uploadFormatError.textContent = message;
  uploadFormatError.classList.remove("hidden");
  dropzone.classList.add("has-error");
  setSignals([message]);
}

function clearUploadFormatError() {
  uploadFormatError.textContent = "";
  uploadFormatError.classList.add("hidden");
  dropzone.classList.remove("has-error");
}

function fileSelectionKey(file) {
  return [
    String(file.name || "").toLowerCase(),
    file.size || 0,
    String(file.type || "").toLowerCase(),
    file.lastModified || 0
  ].join(":");
}

function isHeicFile(file) {
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return HEIC_FORMATS.has(type) || /\.(heic|heif)$/.test(name);
}

function isSupportedImageFile(file) {
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  if (isHeicFile(file)) return false;
  if (SUPPORTED_IMAGE_FORMATS.has(type)) return true;
  return /\.(jpe?g|png|webp|gif)$/.test(name);
}

async function loadImageFromUrl(event) {
  event?.preventDefault();
  if (urlFetchInFlight) return;

  const url = imageUrlInput.value.trim();
  clearUrlImportError();

  if (!url) return;

  if (!isValidPublicImageUrl(url)) {
    showUrlImportError(t("urlInvalid"));
    return;
  }

  if (window.location.protocol === "file:") {
    showUrlImportError(t("urlScanServerRequired"));
    return;
  }

  urlFetchInFlight = true;
  setUrlImportLoading(true);
  startUrlFetchProgress();

  try {
    const response = await fetch("/api/fetch-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const payload = await response.json();

    if (!response.ok || !payload.image) {
      throw new Error(messageForUrlFetchFailure(payload));
    }

    const file = dataUrlToFile(payload.image, payload.filename || "remote-image", payload.mimeType || "image/jpeg");
    await completeUrlFetchProgress();
    handleFiles([file]);
    imageUrlInput.value = "";
    trackEvent("url_image_loaded", { mime_type: file.type });
  } catch (error) {
    resetUrlFetchProgress();
    showUrlImportError(error.message || t("urlFetchFailed"));
  } finally {
    urlFetchInFlight = false;
    setUrlImportLoading(false);
  }
}

function messageForUrlFetchFailure(payload = {}) {
  if (payload.reason === "non_image") return t("urlNotImage");
  if (payload.reason === "unsupported_format") return t("urlUnsupportedFormat");
  return payload.error || t("urlFetchFailed");
}

function showUrlImportError(message) {
  urlImportError.textContent = message;
  urlImportError.classList.remove("hidden");
  setSignals([message]);
}

function clearUrlImportError() {
  urlImportError.textContent = "";
  urlImportError.classList.add("hidden");
}

function isValidPublicImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function setUrlImportLoading(isLoading) {
  imageUrlInput.disabled = isLoading;
}

function startUrlFetchProgress() {
  clearUrlFetchProgressTimer();
  updateUrlFetchProgress(0);
  urlFetchProgress.classList.remove("hidden");

  urlFetchProgressTimer = window.setInterval(() => {
    const current = Number(urlFetchProgress.dataset.progress || 0);
    if (current >= 92) return;
    const next = current < 55 ? current + 8 : current < 80 ? current + 4 : current + 1;
    updateUrlFetchProgress(Math.min(92, next));
  }, 220);
}

async function completeUrlFetchProgress() {
  clearUrlFetchProgressTimer();
  updateUrlFetchProgress(100);
  await wait(260);
  urlFetchProgress.classList.add("hidden");
}

function resetUrlFetchProgress() {
  clearUrlFetchProgressTimer();
  updateUrlFetchProgress(0);
  urlFetchProgress.classList.add("hidden");
}

function updateUrlFetchProgress(value) {
  const progress = Math.max(0, Math.min(100, Math.round(value)));
  urlFetchProgress.dataset.progress = String(progress);
  urlFetchProgress.setAttribute("aria-valuenow", String(progress));
  urlFetchProgressValue.textContent = `${progress}%`;
  urlFetchProgressBar.style.width = `${progress}%`;
}

function clearUrlFetchProgressTimer() {
  if (!urlFetchProgressTimer) return;
  window.clearInterval(urlFetchProgressTimer);
  urlFetchProgressTimer = null;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dataUrlToFile(dataUrl, filename, mimeType) {
  const [header, base64] = dataUrl.split(",");
  const type = mimeType || header.match(/^data:([^;]+);base64$/)?.[1] || "image/jpeg";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type, lastModified: 0 });
}

function clearSelectedItems() {
  state.selectedItems.forEach((item) => URL.revokeObjectURL(item.objectUrl));
  state.selectedItems = [];
  state.activeItemId = null;
  state.historyPreviewItem = null;
}

function removeImage(id) {
  const item = state.selectedItems.find((entry) => entry.id === id);
  if (item) URL.revokeObjectURL(item.objectUrl);
  state.selectedItems = state.selectedItems.filter((entry) => entry.id !== id);
  if (state.activeItemId === id) {
    state.activeItemId = state.selectedItems[0]?.id || null;
  }
  if (!state.selectedItems.length) {
    resetLatestResult();
  } else {
    renderActiveItemResult();
  }
  renderSelection();
}

function resetLatestResult() {
  scoreRing.style.setProperty("--score", 0);
  scoreRing.style.setProperty("--ring-color", "var(--teal)");
  scoreValue.textContent = "--%";
  verdict.textContent = t("emptyVerdict");
  confidence.textContent = "--";
  dimensions.textContent = "--";
  fileSize.textContent = "--";
  setSignals([t("emptySignals")]);
}

function renderSelection() {
  const count = state.selectedItems.length;
  const activeItem = getActiveItem();
  const pendingCount = getPendingItems().length;
  const activePending = Boolean(activeItem && !activeItem.result);
  const hasHistoryPreview = Boolean(state.historyPreviewItem);
  dropzone.classList.toggle("hidden", count > 0 || hasHistoryPreview);
  imageGrid.classList.toggle("hidden", count === 0 && !hasHistoryPreview);
  selectionSummary.classList.toggle("hidden", count === 0);
  document.querySelector(".analysis-board").classList.toggle("has-selection", count > 0);
  document.querySelector(".analysis-board").classList.toggle("has-single-selection", count === 1);
  document.querySelector(".analysis-board").classList.toggle("has-multi-selection", count > 1);
  document.querySelector(".analysis-board").classList.toggle("has-active-result", Boolean(activeItem?.result));
  document.querySelector(".analysis-board").classList.toggle("has-active-pending", activePending);
  document.querySelector(".analysis-board").classList.toggle("has-pending-selection", pendingCount > 0);
  uploadButtonText.textContent = t(count ? "uploadMore" : "uploadImages");
  selectionCount.textContent = t("selectedCount", { count });
  const guestRemaining = Math.max(0, MAX_GUEST_SCANS - state.guestScanCount);
  const guestMessage = guestRemaining === 0
    ? t("guestQuotaReached")
    : `${t(count > 1 ? "memberRequired" : "guestLimit")} ${t("guestQuotaRemaining", { remaining: guestRemaining })}`;
  memberRequirement.innerHTML = state.user
    ? `<strong>${escapeHtml(t("memberLimit"))}</strong>`
    : `${escapeHtml(guestMessage)} <button type="button" class="inline-sign-in" data-action="inline-sign-in">${escapeHtml(t("heroMemberCta"))}</button>`;
  analyzeButton.disabled = !activePending;
  imageGrid.innerHTML = "";

  if (count && !state.selectedItems.some((item) => item.id === state.activeItemId)) {
    state.activeItemId = state.selectedItems[0].id;
  }

  if (state.historyPreviewItem) imageGrid.appendChild(renderHistoryPreviewCard(state.historyPreviewItem));
  state.selectedItems.forEach((item) => imageGrid.appendChild(renderImageCard(item)));
}

function getActiveItem() {
  return state.selectedItems.find((entry) => entry.id === state.activeItemId) || null;
}

function getPendingItems() {
  // Only unscanned uploads enter the API flow; history preview/result items stay read-only.
  return state.selectedItems.filter((entry) => !entry.result);
}

function renderImageCard(item) {
  const card = document.createElement("article");
  card.className = "image-card";
  if (item.id === state.activeItemId) card.classList.add("is-selected");
  if (item.result) card.classList.add(`is-${riskLevelForScore(item.result.score)}`);
  if (!item.result && item.status === t("scanningImage")) card.classList.add("is-scanning");
  card.dataset.id = item.id;

  const markerText = item.result ? markerTextForScore(item.result.score) : t("realMarker");
  const statusText = item.result ? labelForScore(item.result.score) : item.status;
  const activeBadge = item.id === state.activeItemId
    ? `<span class="selected-badge">${escapeHtml(item.result ? t("viewingResult") : t("selectedForScan"))}</span>`
    : "";

  card.innerHTML = `
    <div class="image-preview">
      <img src="${item.objectUrl}" alt="${escapeHtml(item.file.name)}" />
      ${activeBadge}
      <div class="scan-overlay" aria-live="polite">
        <strong>${escapeHtml(t("analyzingImage"))}</strong>
        <span>${escapeHtml(t("analyzingImageBody"))}</span>
        <span class="progress-track"><span class="progress-bar"></span></span>
      </div>
      <button class="image-scan-button" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3v4a2 2 0 0 0 2 2h4" />
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="m9 15 2 2 4-5" />
        </svg>
        <span>${escapeHtml(t("scanImages"))}</span>
      </button>
      <span class="image-marker">${markerText}</span>
      <button class="remove-image-button" type="button" aria-label="${t("removeImage")}">×</button>
    </div>
    <div class="image-meta">
        <strong title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</strong>
      <span>${item.file.type || "image"} · ${formatBytes(item.file.size)}</span>
      <span class="image-status">${escapeHtml(statusText)}</span>
    </div>
  `;

  card.addEventListener("click", () => selectActiveImage(item.id));
  card.querySelector(".image-scan-button").addEventListener("click", (event) => {
    event.stopPropagation();
    analyzeSelectedImages();
  });
  card.querySelector(".remove-image-button").addEventListener("click", (event) => {
    event.stopPropagation();
    removeImage(item.id);
  });
  return card;
}

function renderHistoryPreviewCard(item) {
  const score = Math.round(item.score || 0);
  const card = document.createElement("article");
  card.className = "image-card history-preview-card is-selected";
  card.classList.add(`is-${riskLevelForScore(score)}`);

  const markerText = markerTextForScore(score);
  card.innerHTML = `
    <div class="image-preview">
      <img src="${escapeHtml(item.imageDataUrl || item.thumbnailDataUrl || "/assets/app-icon.svg")}" alt="${escapeHtml(item.filename || "image")}" />
      <span class="selected-badge">${escapeHtml(t("viewingResult"))}</span>
      <span class="image-marker">${escapeHtml(markerText)}</span>
      <button class="remove-image-button" type="button" aria-label="${t("removeImage")}">×</button>
    </div>
    <div class="image-meta">
      <strong title="${escapeHtml(item.filename || "image")}">${escapeHtml(item.filename || "image")}</strong>
      <span>${escapeHtml(item.mimeType || "image")} · ${formatBytes(item.fileSize || 0)}</span>
      <span class="image-status">${escapeHtml(labelForScore(score))} · ${score}%</span>
    </div>
  `;

  card.querySelector(".remove-image-button").addEventListener("click", (event) => {
    event.stopPropagation();
    clearHistoryPreview();
  });
  return card;
}

function clearHistoryPreview() {
  state.historyPreviewItem = null;
  renderSelection();
  if (!state.selectedItems.length) resetLatestResult();
}

function selectActiveImage(id) {
  state.historyPreviewItem = null;
  state.activeItemId = id;
  renderSelection();
  renderActiveItemResult();
}

function renderActiveItemResult() {
  const item = getActiveItem();
  if (!item) {
    resetLatestResult();
    return;
  }

  if (item.result) {
    renderResult(item.result, item.result.features, item.file);
    return;
  }

  scoreRing.style.setProperty("--score", 0);
  scoreRing.style.setProperty("--ring-color", "var(--teal)");
  scoreValue.textContent = "--%";
  verdict.textContent = item.status || t("queued");
  confidence.textContent = "--";
  dimensions.textContent = "--";
  fileSize.textContent = formatBytes(item.file.size);
  setSignals([t("queued")]);
}

async function analyzeSelectedImages() {
  if (!state.selectedItems.length) return;
  const activeItem = getActiveItem();
  const pendingItems = getPendingItems();

  if (!pendingItems.length) {
    renderSelection();
    return;
  }

  if (!state.user && state.guestScanCount >= MAX_GUEST_SCANS) {
    openAuthDialog();
    setSignals([t("guestQuotaReached")]);
    return;
  }

  if (!state.user && state.guestScanCount + pendingItems.length > MAX_GUEST_SCANS) {
    openAuthDialog();
    setSignals([t("guestQuotaReached")]);
    return;
  }

  if (pendingItems.length > 1 && !state.user) {
    openAuthDialog();
    setSignals([t("authNeeded")]);
    return;
  }

  setAnalyzeLoading(true);
  trackEvent("scan_started", { image_count: pendingItems.length, is_member: Boolean(state.user) });

  try {
    for (const item of pendingItems) {
      state.activeItemId = item.id;
      item.status = t("scanningImage");
      renderSelection();
      renderActiveItemResult();
      const image = await loadImage(item.objectUrl);
      const features = extractImageFeatures(image);
      const localResult = scoreAiRisk(features, item.file);
      const remoteResult = await analyzeWithServerless(item.file, features);
      const result = remoteResult?.unavailable
        ? buildLocalFallbackResult(localResult, remoteResult)
        : remoteResult || buildLocalFallbackResult(localResult);
      result.notes = buildExplanationNotes(result, features, item.file);

      item.result = {
        ...result,
        features
      };
      item.status = result.label;
      renderResult(result, features, item.file);
      renderSelection();
      await saveScan(item, result, features);
      if (!state.user) incrementGuestScanCount();
      trackEvent("scan_completed", {
        score: result.score,
        confidence: result.confidence,
        is_ai_generated: riskLevelForScore(result.score) === "ai",
        is_member: Boolean(state.user)
      });
    }
  } catch (error) {
    verdict.textContent = t("unableAnalyze");
    setSignals([error.message || t("browserReadError")]);
  } finally {
    setAnalyzeLoading(false);
  }
}

function incrementGuestScanCount() {
  state.guestScanCount = Math.min(MAX_GUEST_SCANS, state.guestScanCount + 1);
  localStorage.setItem(GUEST_SCAN_COUNT_KEY, String(state.guestScanCount));
  renderSelection();
}

async function analyzeWithServerless(file, features) {
  if (window.location.protocol === "file:") return null;

  try {
    const hash = await hashFile(file);
    const cachedPayload = readCachedAnalysis(hash);

    if (cachedPayload) {
      return normalizeRemoteResult({ ...cachedPayload, cached: true, cacheLayer: "browser" }, features);
    }

    const image = await fileToDataUrl(file);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        hash,
        filename: file.name,
        mimeType: file.type,
        localFeatures: features
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      return {
        unavailable: true,
        error: payload.error || "API model did not return a result.",
        reason: payload.reason || "provider_unavailable",
        providersTried: payload.providersTried || []
      };
    }

    writeCachedAnalysis(hash, payload);
    return normalizeRemoteResult(payload, features);
  } catch (error) {
    console.warn("Serverless analysis unavailable:", error);
    return null;
  }
}

function buildLocalFallbackResult(localResult, providerFailure = {}) {
  const providersTried = providerFailure.providersTried || [];
  const limited = providerFailure.reason === "all_providers_limited" || providersTried.some((item) => {
    const reason = String(item.reason || "").toLowerCase();
    return item.status === "failed" && (reason.includes("limit") || reason.includes("quota") || reason.includes("usage"));
  });
  const fallbackNote = window.location.protocol === "file:"
    ? t("fileModeWarning")
    : limited ? t("providerLimitFallback") : t("localFallback");
  const triedNote = providersTried.length
    ? t("fallbackChain", { chain: providersTried.map((item) => `${item.provider}:${item.status}${item.reason ? `/${item.reason}` : ""}`).join(", ") })
    : null;

  return {
    ...localResult,
    label: `${localResult.label} (${t("localFallback")})`,
    providerFallback: true,
    providerLimitFallback: limited,
    notes: [
      fallbackNote,
      ...(triedNote ? [triedNote] : []),
      ...localResult.notes
    ]
  };
}

function normalizeRemoteResult(payload, features) {
  const score = Math.max(0, Math.min(100, Math.round(payload.score ?? 0)));
  const providerName = payload.provider || "unknown";
  const notes = [
    `${t("provider")}: ${providerName}.`,
    t("providerScore", { provider: providerName, score })
  ];

  if (payload.cached) {
    notes.push(t("cacheSource", { layer: payload.cacheLayer || "server" }));
  }

  if (Array.isArray(payload.providersTried) && payload.providersTried.length > 1) {
    const tried = payload.providersTried.map((item) => `${item.provider}:${item.status}`).join(", ");
    notes.push(t("fallbackChain", { chain: tried }));
  }

  if (looksLikeScreenshot(features)) notes.push(t("screenshotNote"));

  return {
    score,
    label: labelForScore(score),
    confidence: Math.max(35, Math.min(92, Math.round(payload.confidence ?? 60))),
    notes
  };
}

function buildExplanationNotes(result, features, file) {
  const baseNotes = Array.isArray(result.notes) ? result.notes : [];
  const screenshotResult = looksLikeScreenshot(features) ? t("screenshotYes") : t("screenshotNo");

  return [
    ...baseNotes,
    t("scoreRule", { threshold: AI_THRESHOLD, realThreshold: REAL_IMAGE_MAX_SCORE, score: result.score }),
    t("smoothnessMetric", { value: percent(features.smoothness) }),
    t("edgeMetric", { value: percent(features.edgeDensity) }),
    t("entropyMetric", { value: percent(features.entropy) }),
    t("saturationMetric", { value: percent(features.averageSaturation) }),
    t("dimensionMetric", { width: features.width, height: features.height }),
    t("screenshotMetric", { result: screenshotResult }),
    t("formatMetric", { format: file.type || "unknown" })
  ];
}

function renderResult(result, features, file) {
  const level = riskLevelForScore(result.score);
  const ringColor = level === "ai" ? "var(--danger)" : level === "warning" ? "var(--amber)" : "var(--teal)";
  scoreRing.style.setProperty("--score", result.score);
  scoreRing.style.setProperty("--ring-color", ringColor);
  scoreValue.textContent = `${result.score}%`;
  verdict.textContent = result.label;
  confidence.textContent = `${result.confidence}%`;
  dimensions.textContent = `${features.width} x ${features.height}`;
  fileSize.textContent = formatBytes(file.size);
  setSignals(result.notes);
}

function labelForScore(score) {
  const level = riskLevelForScore(score);
  if (level === "ai") return t("highRisk");
  if (level === "real") return t("lowRisk");
  return t("mediumRisk");
}

function riskLevelForScore(score) {
  const value = Math.round(Number(score) || 0);
  if (value > AI_THRESHOLD) return "ai";
  if (value >= REAL_IMAGE_MAX_SCORE) return "warning";
  return "real";
}

function markerTextForScore(score) {
  const value = Math.round(Number(score) || 0);
  const level = riskLevelForScore(value);
  if (level === "ai") return t("aiMarker", { score: value });
  if (level === "warning") return t("aiEditedMarker", { score: value });
  return t("realMarker");
}

async function saveMarketingMember(user) {
  if (!state.firebase.ready || !user) return;
  const { db, fns, collections } = state.firebase;

  await fns.setDoc(fns.doc(db, collections.marketingMembers, user.uid), {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || "",
    photoURL: user.photoURL || null,
    providerId: user.providerData?.[0]?.providerId || "",
    lastSeenAt: fns.serverTimestamp(),
    source: "ai-image-checker"
  }, { merge: true });
}

async function saveScan(item, result, features) {
  if (!state.user || !state.firebase.ready) {
    historyStatus.textContent = t("notSavedGuest");
    return;
  }

  const hash = await hashFile(item.file);
  const { db, fns, collections } = state.firebase;
  const scansRef = fns.collection(db, "users", state.user.uid, collections.userScans);
  const existingQuery = fns.query(scansRef, fns.where("hash", "==", hash), fns.limit(1));
  const existingSnapshot = await fns.getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    historyStatus.textContent = t("alreadySaved");
    await loadScanHistory();
    return;
  }

  const thumbnailDataUrl = await makeHistoryThumbnail(item.file);
  const imageDataUrl = await makeStoredScanImage(item.file);

  await fns.addDoc(scansRef, {
    email: state.user.email || null,
    filename: item.file.name,
    fileSize: item.file.size,
    mimeType: item.file.type,
    hash,
    score: result.score,
    confidence: result.confidence,
    label: result.label,
    width: features.width,
    height: features.height,
    signals: result.notes,
    thumbnailDataUrl,
    imageDataUrl,
    createdAtClient: new Date().toISOString(),
    createdAt: fns.serverTimestamp()
  });

  historyStatus.textContent = t("savedToHistory");
  await loadScanHistory();
}

async function loadScanHistory() {
  if (!state.user || !state.firebase.ready) return;
  const { db, fns, collections } = state.firebase;
  const scansRef = fns.collection(db, "users", state.user.uid, collections.userScans);
  const query = fns.query(scansRef, fns.orderBy("createdAt", "desc"), fns.limit(50));
  const snapshot = await fns.getDocs(query);
  state.scanHistory = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderHistory(state.scanHistory);
  renderProfileHistory();
}

function renderHistory(items) {
  historyList.innerHTML = "";
  seeMoreHistoryButton.classList.add("hidden");

  if (!state.user) {
    historyStatus.textContent = t("historyGuest");
    return;
  }

  if (!items.length) {
    historyStatus.textContent = t("historyEmpty");
    return;
  }

  historyStatus.textContent = t("recentScans", { count: items.length });
  items.slice(0, 5).forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-row";
    li.innerHTML = `
      <img src="${escapeHtml(item.thumbnailDataUrl || "/assets/app-icon.svg")}" alt="" />
      <span class="history-row-copy">
        <strong title="${escapeHtml(item.filename || "image")}">${escapeHtml(item.filename || "image")}</strong>
        <span>${escapeHtml(labelForScore(Math.round(item.score || 0)))} · ${Math.round(item.score || 0)}%</span>
      </span>
    `;
    li.addEventListener("click", () => showHistoryResult(item));
    historyList.appendChild(li);
  });
  seeMoreHistoryButton.classList.toggle("hidden", items.length <= 5);
}

function renderMemberState() {
  const signedIn = Boolean(state.user);
  signInButton.classList.toggle("hidden", signedIn);
  memberChip.classList.toggle("hidden", !signedIn);
  const email = state.user?.email || "";
  memberEmail.textContent = state.user?.displayName || email.split("@")[0] || "";
  profileEmail.textContent = email;
  const photoURL = state.user?.photoURL || "";
  memberAvatar.classList.toggle("hidden", !photoURL);
  if (photoURL) memberAvatar.src = photoURL;
  profileAvatar.src = photoURL || "/assets/app-icon.svg";
  if (!signedIn) closeAccountMenu();
}

function toggleAccountMenu(event) {
  event.stopPropagation();
  accountMenu.classList.toggle("hidden");
}

function closeAccountMenu() {
  accountMenu.classList.add("hidden");
}

function showHistoryResult(item) {
  state.historyPreviewItem = item;
  state.activeItemId = null;
  showPage("scan");
  renderSelection();
  const score = Math.round(item.score || 0);
  const features = {
    width: item.width || "--",
    height: item.height || "--"
  };
  scoreRing.style.setProperty("--score", score);
  const level = riskLevelForScore(score);
  scoreRing.style.setProperty("--ring-color", level === "ai" ? "var(--danger)" : level === "warning" ? "var(--amber)" : "var(--teal)");
  scoreValue.textContent = `${score}%`;
  verdict.textContent = labelForScore(score);
  confidence.textContent = `${Math.round(item.confidence || 0)}%`;
  dimensions.textContent = `${features.width} x ${features.height}`;
  fileSize.textContent = formatBytes(item.fileSize || 0);
  setSignals(Array.isArray(item.signals) && item.signals.length ? item.signals : [t("emptySignals")]);
}

function showPage(pageName) {
  if (pageName === "profile" && !state.user) {
    openAuthDialog();
    return;
  }

  const isProfile = pageName === "profile";
  scanPage.classList.toggle("hidden", isProfile);
  profilePage.classList.toggle("hidden", !isProfile);
  scanNavButton.classList.toggle("is-active", !isProfile);
  profileNavButton.classList.toggle("is-active", isProfile);
  document.body.dataset.page = isProfile ? "profile" : "scan";

  if (isProfile) renderProfileHistory();
}

function setHistoryView(view) {
  state.historyView = view;
  localStorage.setItem("ai-media-history-view", view);
  renderProfileHistory();
}

function renderProfileHistory() {
  if (!profileHistory) return;

  profileHistory.classList.toggle("is-grid", state.historyView === "grid");
  profileHistory.classList.toggle("is-list", state.historyView === "list");
  historyGridButton.classList.toggle("is-active", state.historyView === "grid");
  historyListButton.classList.toggle("is-active", state.historyView === "list");
  profileHistory.innerHTML = "";

  if (!state.user) return;

  if (!state.scanHistory.length) {
    const empty = document.createElement("p");
    empty.className = "profile-empty";
    empty.textContent = t("historyEmpty");
    profileHistory.appendChild(empty);
    return;
  }

  state.scanHistory.forEach((item) => {
    const card = document.createElement("article");
    card.className = "profile-history-card";
    const score = Math.round(item.score || 0);
    const markerClass = riskLevelForScore(score);
    card.innerHTML = `
      <img src="${escapeHtml(item.imageDataUrl || item.thumbnailDataUrl || "/assets/app-icon.svg")}" alt="${escapeHtml(item.filename || "image")}" />
      <div class="profile-history-copy">
        <strong title="${escapeHtml(item.filename || "image")}">${escapeHtml(item.filename || "image")}</strong>
        <span class="history-result ${markerClass}">${escapeHtml(labelForScore(score))} · ${score}%</span>
        <span>${escapeHtml(item.mimeType || "image")} · ${formatBytes(item.fileSize || 0)}</span>
        <ul>${(item.signals || []).slice(0, 4).map((signal) => `<li>${escapeHtml(signal)}</li>`).join("")}</ul>
      </div>
    `;
    card.addEventListener("click", () => showHistoryResult(item));
    profileHistory.appendChild(card);
  });
}

function openAuthDialog() {
  firebaseStatus.textContent = window.location.protocol === "file:"
    ? t("authUnauthorizedDomain")
    : t(state.firebase.ready ? "firebaseReady" : "firebaseMissing");
  authDialog.showModal();
}

async function signInWithProvider(providerName) {
  if (!state.firebase.ready) {
    firebaseStatus.textContent = t("firebaseNotReady");
    return;
  }

  try {
    const provider = state.firebase.providers[providerName];
    if (shouldUseRedirectSignIn()) {
      firebaseStatus.textContent = t("authRedirecting");
      await state.firebase.fns.signInWithRedirect(state.firebase.auth, provider);
      return;
    }

    await state.firebase.fns.signInWithPopup(state.firebase.auth, provider);
    trackEvent("login", { method: providerName });
    authDialog.close();
  } catch (error) {
    console.warn("Provider sign-in failed:", error);
    firebaseStatus.textContent = describeAuthError(error);
  }
}

async function completePendingRedirectSignIn() {
  try {
    const result = await state.firebase.fns.getRedirectResult(state.firebase.auth);
    if (!result?.user) return;
    trackEvent("login", { method: "google_redirect" });
    if (authDialog.open) authDialog.close();
  } catch (error) {
    console.warn("Redirect sign-in failed:", error);
    firebaseStatus.textContent = describeAuthError(error);
  }
}

function shouldUseRedirectSignIn() {
  return window.matchMedia("(max-width: 680px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function describeAuthError(error) {
  const code = String(error?.code || "");
  if (code.includes("unauthorized-domain")) return t("authUnauthorizedDomain");
  if (code.includes("popup-blocked") || code.includes("popup-closed")) return t("authPopupBlocked");
  if (code.includes("operation-not-allowed")) return t("authOperationNotAllowed");
  return `${t("authFailed")}${code ? ` (${code})` : ""}`;
}

async function signOutMember() {
  if (signOutConfirmDialog.open) signOutConfirmDialog.close();
  if (state.firebase.ready) {
    await state.firebase.fns.signOut(state.firebase.auth);
  }
  state.user = null;
  renderMemberState();
  state.scanHistory = [];
  renderHistory([]);
  renderProfileHistory();
  showPage("scan");
  renderSelection();
}

function trackEvent(name, params = {}) {
  if (!state.firebase.analytics || !state.firebase.fns?.logEvent) return;

  try {
    state.firebase.fns.logEvent(state.firebase.analytics, name, params);
  } catch (error) {
    console.warn("Analytics event failed:", error);
  }
}

function applyLocale() {
  document.documentElement.lang = state.locale;
  document.documentElement.dir = state.locale === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  updateLegalLinks();
  syncSupportBotLabels();
  firebaseStatus.textContent = t(state.firebase.ready ? "firebaseReady" : "firebaseMissing");
  renderMemberState();
  renderHistory(state.scanHistory);
  renderProfileHistory();
}

function syncSupportBotLabels() {
  supportBotToggle.setAttribute("aria-label", t("supportBotOpen"));
  supportBotMinimize.setAttribute("aria-label", t("supportBotHide"));
}

function updateLegalLinks() {
  document.querySelectorAll(".legal-footer a").forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    url.searchParams.set("lang", state.locale);
    link.href = `${url.pathname}${url.search}`;
  });
}

function setAnalyzeLoading(isLoading) {
  const activeItem = getActiveItem();
  analyzeButton.disabled = isLoading || !activeItem || Boolean(activeItem.result);
  analyzeButton.querySelector("span").textContent = t(isLoading ? "scanning" : "scanImages");
}

function setSignals(items) {
  signals.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    signals.appendChild(li);
  });
}

function t(key, vars = {}) {
  let value = i18n[state.locale]?.[key] || i18n.en[key] || key;
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, replacement);
  });
  return value;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image is invalid or damaged."));
    image.src = src;
  });
}

function extractImageFeatures(image) {
  const maxSide = 420;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  let sumLum = 0;
  let sumLumSq = 0;
  let saturationSum = 0;
  let smoothTransitions = 0;
  let sharpEdges = 0;
  let samples = 0;
  const histogram = new Array(16).fill(0);

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      sumLum += lum;
      sumLumSq += lum * lum;
      saturationSum += sat;
      histogram[Math.min(15, Math.floor(lum / 16))] += 1;
      samples += 1;

      if (x + 2 < width && y + 2 < height) {
        const right = (y * width + x + 2) * 4;
        const down = ((y + 2) * width + x) * 4;
        const rightLum = 0.2126 * data[right] + 0.7152 * data[right + 1] + 0.0722 * data[right + 2];
        const downLum = 0.2126 * data[down] + 0.7152 * data[down + 1] + 0.0722 * data[down + 2];
        const delta = Math.abs(lum - rightLum) + Math.abs(lum - downLum);
        if (delta < 10) smoothTransitions += 1;
        if (delta > 82) sharpEdges += 1;
      }
    }
  }

  const meanLum = sumLum / samples;
  const variance = sumLumSq / samples - meanLum * meanLum;
  const entropy = histogram.reduce((total, count) => {
    if (!count) return total;
    const probability = count / samples;
    return total - probability * Math.log2(probability);
  }, 0) / 4;

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    sampledWidth: width,
    sampledHeight: height,
    entropy,
    normalizedVariance: Math.min(1, Math.max(0, variance / 5200)),
    averageSaturation: saturationSum / samples,
    smoothness: Math.min(1, smoothTransitions / Math.max(1, samples)),
    edgeDensity: Math.min(1, sharpEdges / Math.max(1, samples))
  };
}

function scoreAiRisk(features, file) {
  let score = 38;
  const notes = [];

  if (features.smoothness > 0.42) {
    score += 18;
    notes.push(t("smoothSynthetic"));
  } else {
    score -= 8;
    notes.push(t("naturalVariation"));
  }

  if (features.edgeDensity < 0.025) {
    score += 14;
    notes.push(t("lowEdges"));
  } else if (features.edgeDensity > 0.09) {
    score -= 8;
    notes.push(t("clearEdges"));
  }

  if (features.entropy < 0.58) {
    score += 10;
    notes.push(t("limitedBrightness"));
  } else if (features.entropy > 0.78) {
    score -= 6;
    notes.push(t("diverseBrightness"));
  }

  if (features.averageSaturation > 0.34) {
    score += 7;
    notes.push(t("highSaturation"));
  }

  if (features.width >= 1024 && features.height >= 1024 && features.width === features.height) {
    score += 8;
    notes.push(t("squareFormat"));
  }

  if (file.type === "image/png" || file.type === "image/webp") {
    score += 5;
    notes.push(t("pngWebp"));
  }

  if (looksLikeScreenshot(features)) {
    score -= 20;
    notes.push(t("screenshotNote"));
  }

  score = Math.round(Math.max(0, Math.min(96, score)));
  const confidenceScore = Math.round(
    42 +
      Math.abs(score - 50) * 0.42 +
      Math.min(18, file.size / 650000) +
      Math.min(10, (features.sampledWidth * features.sampledHeight) / 12000)
  );

  return {
    score,
    label: labelForScore(score),
    confidence: Math.max(35, Math.min(88, confidenceScore)),
    notes
  };
}

function looksLikeScreenshot(features) {
  const isFlatOrStructured = features.smoothness > 0.32 && features.entropy < 0.74;
  const hasLowPhotoNoise = features.normalizedVariance < 0.42;
  const hasUiLikeEdges = features.edgeDensity < 0.075;
  const hasControlledColor = features.averageSaturation < 0.38;

  return isFlatOrStructured && hasLowPhotoNoise && hasUiLikeEdges && hasControlledColor;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

async function makeHistoryThumbnail(file) {
  return makeCompressedImageDataUrl(file, {
    maxSide: 360,
    quality: 0.72,
    maxLength: 220000
  });
}

async function makeStoredScanImage(file) {
  return makeCompressedImageDataUrl(file, {
    maxSide: 1100,
    quality: 0.78,
    maxLength: 780000
  });
}

async function makeCompressedImageDataUrl(file, options) {
  try {
    const dataUrl = await fileToDataUrl(file);
    const image = await loadImage(dataUrl);
    const maxSide = options.maxSide;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    const compressed = canvas.toDataURL("image/jpeg", options.quality);
    return compressed.length <= options.maxLength ? compressed : "";
  } catch (error) {
    console.warn("Could not create stored scan image:", error);
    return "";
  }
}

async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readCachedAnalysis(hash) {
  try {
    const raw = localStorage.getItem(`${ANALYSIS_CACHE_PREFIX}${hash}`);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached.createdAt || Date.now() - cached.createdAt > ANALYSIS_CACHE_TTL) {
      localStorage.removeItem(`${ANALYSIS_CACHE_PREFIX}${hash}`);
      return null;
    }

    return cached.payload;
  } catch {
    return null;
  }
}

function writeCachedAnalysis(hash, payload) {
  try {
    localStorage.setItem(`${ANALYSIS_CACHE_PREFIX}${hash}`, JSON.stringify({
      createdAt: Date.now(),
      payload
    }));
  } catch {
    // Browser storage can be full or disabled; analysis should still work.
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function percent(value) {
  return Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
