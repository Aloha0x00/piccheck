const locale = new URLSearchParams(window.location.search).get("lang") || localStorage.getItem("ai-media-risk-locale") || "en";
const docType = document.documentElement.dataset.legalDoc || "legal";

const shared = {
  en: {
    back: "Back to PIC Check AI",
    updated: "Last updated: June 3, 2026",
    contact: "Contact",
    contactBody: "For support or legal questions, contact johnlahboo@gmail.com or Telegram @movewannamove."
  },
  vi: {
    back: "Quay lại PIC Check AI",
    updated: "Cập nhật lần cuối: 03/06/2026",
    contact: "Liên hệ",
    contactBody: "Để được hỗ trợ hoặc gửi thông báo pháp lý, liên hệ johnlahboo@gmail.com hoặc Telegram @movewannamove."
  },
  zh: {
    back: "返回 PIC Check AI",
    updated: "最后更新：2026年6月3日",
    contact: "联系",
    contactBody: "如需支持或法律咨询，请联系 johnlahboo@gmail.com 或 Telegram @movewannamove。"
  },
  hi: {
    back: "PIC Check AI पर वापस जाएं",
    updated: "अंतिम अपडेट: 3 जून 2026",
    contact: "संपर्क",
    contactBody: "Support या legal questions के लिए johnlahboo@gmail.com या Telegram @movewannamove पर संपर्क करें।"
  },
  es: {
    back: "Volver a PIC Check AI",
    updated: "Última actualización: 3 de junio de 2026",
    contact: "Contacto",
    contactBody: "Para soporte o consultas legales, contacta a johnlahboo@gmail.com o Telegram @movewannamove."
  },
  ar: {
    back: "العودة إلى PIC Check AI",
    updated: "آخر تحديث: 3 يونيو 2026",
    contact: "التواصل",
    contactBody: "للدعم أو الأسئلة القانونية، تواصل عبر johnlahboo@gmail.com أو Telegram @movewannamove."
  }
};

const docs = {
  terms: {
    en: {
      title: "Terms of Use",
      intro: "These Terms of Use govern access to and use of PIC Check AI. By using the service, you agree to these terms.",
      sections: [
        ["Informational Tool Only", "PIC Check AI provides probabilistic risk scores and supporting signals. Results are not legal, forensic, academic, employment, financial, or professional advice and are not proof that an image is or is not AI-generated."],
        ["User Responsibility", "You are responsible for reviewing results, using human judgment, and obtaining qualified professional advice before making high-impact decisions."],
        ["Uploaded Content", "You must have the necessary rights or permission to upload images. Do not upload unlawful, private, confidential, or sensitive content unless you have authority to do so."],
        ["Accounts and History", "Members may save scan history, including compressed image previews, thumbnails, scores, metadata, and detection signals. Guest scans are not intentionally saved to user history."],
        ["No Warranty", "The service is provided as is and as available without warranties of accuracy, availability, fitness for a particular purpose, or non-infringement."]
      ]
    },
    vi: {
      title: "Điều khoản sử dụng",
      intro: "Các điều khoản này điều chỉnh việc truy cập và sử dụng PIC Check AI. Khi sử dụng dịch vụ, bạn đồng ý với các điều khoản này.",
      sections: [
        ["Chỉ là công cụ tham khảo", "PIC Check AI cung cấp điểm rủi ro xác suất và tín hiệu hỗ trợ. Kết quả không phải tư vấn pháp lý, forensic, học thuật, tuyển dụng, tài chính hoặc chuyên môn."],
        ["Trách nhiệm của người dùng", "Bạn chịu trách nhiệm review kết quả, dùng đánh giá của con người và xin tư vấn chuyên môn trước khi đưa ra quyết định có tác động lớn."],
        ["Nội dung upload", "Bạn cần có quyền hoặc sự cho phép cần thiết để upload ảnh. Không upload nội dung bất hợp pháp, riêng tư, bí mật hoặc nhạy cảm nếu bạn không có thẩm quyền."],
        ["Tài khoản và lịch sử", "Member có thể lưu lịch sử scan gồm ảnh nén, thumbnail, điểm số, metadata và tín hiệu phát hiện. Guest scan không chủ đích lưu vào lịch sử user."],
        ["Không bảo đảm", "Dịch vụ được cung cấp như hiện trạng và khi sẵn có, không bảo đảm về độ chính xác, khả dụng hoặc phù hợp với mục đích cụ thể."]
      ]
    }
  },
  conditions: {
    en: {
      title: "Service Conditions",
      intro: "These conditions describe operational limits and expected behavior when using PIC Check AI.",
      sections: [
        ["Accuracy Conditions", "Scores can be affected by screenshots, compression, cropping, filters, re-uploads, camera captures of screens, illustrations, watermarks, low resolution, and provider quota limits."],
        ["Provider Fallback", "The service may switch between configured providers. If trusted providers are unavailable or rate-limited, browser-based heuristics may be used and will be less accurate."],
        ["Storage Conditions", "Member history may store compressed images and thumbnails rather than original full-resolution files. Duplicate scans may be skipped based on file hash."],
        ["Account Conditions", "Member features require Google sign-in. You are responsible for keeping access to your Google account secure."],
        ["Availability", "The service may be changed, suspended, rate-limited, or discontinued at any time."]
      ]
    },
    vi: {
      title: "Điều kiện dịch vụ",
      intro: "Tài liệu này mô tả giới hạn vận hành và hành vi kỳ vọng khi sử dụng PIC Check AI.",
      sections: [
        ["Điều kiện về độ chính xác", "Điểm số có thể bị ảnh hưởng bởi screenshot, nén ảnh, crop, filter, upload lại, ảnh chụp màn hình bằng camera, minh họa, watermark, độ phân giải thấp và quota provider."],
        ["Fallback provider", "Dịch vụ có thể chuyển giữa các provider đã cấu hình. Nếu provider uy tín không khả dụng hoặc bị rate-limit, heuristic trong browser có thể được dùng và kém chính xác hơn."],
        ["Điều kiện lưu trữ", "Lịch sử member có thể lưu ảnh nén và thumbnail thay vì file gốc full-resolution. Scan trùng có thể bị bỏ qua dựa trên hash file."],
        ["Điều kiện tài khoản", "Tính năng member yêu cầu Google sign-in. Bạn chịu trách nhiệm bảo mật tài khoản Google của mình."],
        ["Tính khả dụng", "Dịch vụ có thể được thay đổi, tạm ngưng, rate-limit hoặc dừng bất kỳ lúc nào."]
      ]
    }
  },
  legal: {
    en: {
      title: "Legal Notice",
      intro: "This legal notice explains important limitations for PIC Check AI.",
      sections: [
        ["Not a Determinative Tool", "PIC Check AI is a screening and triage tool. It does not determine truth, authenticity, authorship, fraud, ownership, or legal liability."],
        ["No Professional Relationship", "Use of the service does not create an attorney-client, forensic expert, auditor, consultant, employment, or agency relationship."],
        ["Human Review Required", "Any significant decision should include human review, context, additional evidence, and qualified expert analysis where appropriate."],
        ["Privacy and Data", "Google sign-in may provide name, email, avatar, and authentication identifiers. Member scan history may include compressed images, thumbnails, metadata, scores, and detection signals."],
        ["Intellectual Property", "You retain responsibility for rights in uploaded images and grant the permission necessary to process them for scan functionality."]
      ]
    },
    vi: {
      title: "Thông báo pháp lý",
      intro: "Thông báo này giải thích các giới hạn quan trọng của PIC Check AI.",
      sections: [
        ["Không phải công cụ kết luận tuyệt đối", "PIC Check AI là công cụ screening và triage. Công cụ không xác định sự thật, tính xác thực, tác giả, gian lận, quyền sở hữu hoặc trách nhiệm pháp lý."],
        ["Không tạo quan hệ chuyên môn", "Việc dùng dịch vụ không tạo quan hệ luật sư-khách hàng, chuyên gia forensic, kiểm toán, tư vấn, tuyển dụng hoặc đại diện."],
        ["Cần review bởi con người", "Mọi quyết định quan trọng cần có review của con người, bối cảnh, bằng chứng bổ sung và phân tích chuyên gia khi phù hợp."],
        ["Quyền riêng tư và dữ liệu", "Google sign-in có thể cung cấp tên, email, avatar và định danh xác thực. Lịch sử member có thể gồm ảnh nén, thumbnail, metadata, điểm số và tín hiệu phát hiện."],
        ["Sở hữu trí tuệ", "Bạn chịu trách nhiệm về quyền đối với ảnh upload và cấp quyền cần thiết để xử lý ảnh cho chức năng scan."]
      ]
    }
  }
};

const aliases = {
  zh: {
    terms: ["使用条款", "这些条款管理你对 PIC Check AI 的访问和使用。使用本服务即表示你同意这些条款。"],
    conditions: ["服务条件", "本文件说明使用 PIC Check AI 时的运行限制和预期行为。"],
    legal: ["法律声明", "本声明说明 PIC Check AI 的重要限制。"]
  },
  hi: {
    terms: ["Terms of Use", "ये terms PIC Check AI के access और use को govern करते हैं। Service use करके आप इन terms से सहमत होते हैं।"],
    conditions: ["Service Conditions", "ये conditions PIC Check AI use करते समय operational limits और expected behavior बताती हैं।"],
    legal: ["Legal Notice", "यह notice PIC Check AI की important limitations समझाता है।"]
  },
  es: {
    terms: ["Términos de uso", "Estos términos regulan el acceso y uso de PIC Check AI. Al usar el servicio, aceptas estos términos."],
    conditions: ["Condiciones del servicio", "Estas condiciones describen límites operativos y comportamiento esperado al usar PIC Check AI."],
    legal: ["Aviso legal", "Este aviso explica limitaciones importantes de PIC Check AI."]
  },
  ar: {
    terms: ["شروط الاستخدام", "تنظم هذه الشروط الوصول إلى PIC Check AI واستخدامه. باستخدام الخدمة، فإنك توافق على هذه الشروط."],
    conditions: ["شروط الخدمة", "توضح هذه الشروط الحدود التشغيلية والسلوك المتوقع عند استخدام PIC Check AI."],
    legal: ["إشعار قانوني", "يوضح هذا الإشعار القيود المهمة في PIC Check AI."]
  }
};

function buildDoc() {
  const lang = shared[locale] ? locale : "en";
  const base = docs[docType][lang] || docs[docType].en;
  const alias = aliases[lang]?.[docType];
  const content = alias ? { ...base, title: alias[0], intro: alias[1] } : base;
  const common = shared[lang] || shared.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = `${content.title} - PIC Check AI`;
  document.querySelector("[data-back-link]").textContent = common.back;
  const article = document.querySelector("article");
  article.innerHTML = `
    <h1>${content.title}</h1>
    <p class="updated">${common.updated}</p>
    <p>${content.intro}</p>
    ${content.sections.map(([title, body]) => `<h2>${title}</h2><p>${body}</p>`).join("")}
    <h2>${common.contact}</h2>
    <p>${common.contactBody}</p>
  `;
}

buildDoc();
