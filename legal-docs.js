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

Object.assign(docs.terms, {
  zh: {
    title: "使用条款",
    intro: "这些使用条款管理你对 PIC Check AI 的访问和使用。使用本服务即表示你同意这些条款。",
    sections: [
      ["仅作为信息工具", "PIC Check AI 提供概率性风险分数和辅助信号。结果不是法律、取证、学术、就业、财务或专业建议，也不能证明图片一定是或不是 AI 生成。"],
      ["用户责任", "在做出高影响决策前，你负责审查结果、使用人工判断，并在需要时获取合格专业意见。"],
      ["上传内容", "你必须拥有上传图片所需的权利或许可。除非你有权限，否则不要上传违法、私人、机密或敏感内容。"],
      ["账户和历史", "会员可以保存扫描历史，包括压缩图片预览、缩略图、分数、元数据和检测信号。访客扫描不会有意保存到用户历史。"],
      ["无保证", "服务按现状和可用状态提供，不保证准确性、可用性、特定用途适用性或不侵权。"]
    ]
  },
  hi: {
    title: "उपयोग की शर्तें",
    intro: "ये Terms of Use PIC Check AI के access और use को govern करते हैं। Service use करके आप इन terms से सहमत होते हैं।",
    sections: [
      ["केवल जानकारी के लिए tool", "PIC Check AI probabilistic risk scores और supporting signals देता है। Results legal, forensic, academic, employment, financial या professional advice नहीं हैं और यह proof नहीं हैं कि image AI-generated है या नहीं।"],
      ["User responsibility", "High-impact decisions लेने से पहले results review करना, human judgment use करना और qualified professional advice लेना आपकी जिम्मेदारी है।"],
      ["Uploaded content", "Images upload करने के लिए आपके पास necessary rights या permission होना चाहिए। Authority न होने पर unlawful, private, confidential या sensitive content upload न करें।"],
      ["Accounts और history", "Members scan history save कर सकते हैं, जिसमें compressed image previews, thumbnails, scores, metadata और detection signals शामिल हो सकते हैं। Guest scans user history में intentionally save नहीं होते।"],
      ["No warranty", "Service as is और as available provide की जाती है, accuracy, availability, specific purpose fitness या non-infringement की warranty के बिना।"]
    ]
  },
  es: {
    title: "Términos de uso",
    intro: "Estos Términos de uso regulan el acceso y uso de PIC Check AI. Al usar el servicio, aceptas estos términos.",
    sections: [
      ["Solo herramienta informativa", "PIC Check AI proporciona puntuaciones probabilísticas de riesgo y señales de apoyo. Los resultados no son asesoría legal, forense, académica, laboral, financiera o profesional, ni prueba de que una imagen sea o no AI-generated."],
      ["Responsabilidad del usuario", "Eres responsable de revisar los resultados, usar criterio humano y obtener asesoría profesional cualificada antes de tomar decisiones de alto impacto."],
      ["Contenido subido", "Debes tener los derechos o permisos necesarios para subir imágenes. No subas contenido ilegal, privado, confidencial o sensible salvo que tengas autorización."],
      ["Cuentas e historial", "Los miembros pueden guardar historial de escaneos, incluidas vistas comprimidas, miniaturas, puntuaciones, metadatos y señales de detección. Los escaneos de invitados no se guardan intencionalmente en el historial de usuario."],
      ["Sin garantía", "El servicio se proporciona tal cual y según disponibilidad, sin garantías de precisión, disponibilidad, idoneidad para un propósito particular o no infracción."]
    ]
  },
  ar: {
    title: "شروط الاستخدام",
    intro: "تنظم شروط الاستخدام هذه الوصول إلى PIC Check AI واستخدامه. باستخدام الخدمة، فإنك توافق على هذه الشروط.",
    sections: [
      ["أداة معلومات فقط", "يوفر PIC Check AI درجات مخاطر احتمالية وإشارات مساعدة. النتائج ليست نصيحة قانونية أو جنائية أو أكاديمية أو توظيفية أو مالية أو مهنية، وليست دليلاً قاطعاً على أن الصورة مولدة بالذكاء الاصطناعي أو غير ذلك."],
      ["مسؤولية المستخدم", "أنت مسؤول عن مراجعة النتائج واستخدام الحكم البشري والحصول على مشورة مهنية مؤهلة قبل اتخاذ قرارات عالية التأثير."],
      ["المحتوى المرفوع", "يجب أن تملك الحقوق أو الإذن اللازم لرفع الصور. لا ترفع محتوى غير قانوني أو خاص أو سري أو حساس إلا إذا كنت مخولاً بذلك."],
      ["الحسابات والسجل", "يمكن للأعضاء حفظ سجل الفحص، بما في ذلك معاينات الصور المضغوطة والصور المصغرة والنتائج والبيانات الوصفية وإشارات الكشف. لا يتم حفظ فحوصات الضيوف عمداً في سجل المستخدم."],
      ["عدم الضمان", "تقدم الخدمة كما هي وحسب توفرها، دون ضمانات للدقة أو التوفر أو الملاءمة لغرض معين أو عدم الانتهاك."]
    ]
  }
});

Object.assign(docs.conditions, {
  zh: {
    title: "服务条件",
    intro: "这些条件说明使用 PIC Check AI 时的运行限制和预期行为。",
    sections: [
      ["准确性条件", "分数可能受到截图、压缩、裁剪、滤镜、重新上传、用相机拍摄屏幕、插画、水印、低分辨率和提供商配额限制的影响。"],
      ["提供商备用", "服务可能在已配置的提供商之间切换。如果可信提供商不可用或被限流，可能会使用浏览器端启发式检测，准确性会较低。"],
      ["存储条件", "会员历史可能保存压缩图片和缩略图，而不是原始全分辨率文件。重复扫描可能根据文件 hash 被跳过。"],
      ["账户条件", "会员功能需要 Google 登录。你负责保护自己的 Google 账户安全。"],
      ["可用性", "服务可能随时被更改、暂停、限流或停止。"]
    ]
  },
  hi: {
    title: "Service conditions",
    intro: "ये conditions PIC Check AI use करते समय operational limits और expected behavior बताती हैं।",
    sections: [
      ["Accuracy conditions", "Scores screenshots, compression, cropping, filters, re-uploads, screen camera captures, illustrations, watermarks, low resolution और provider quota limits से प्रभावित हो सकते हैं।"],
      ["Provider fallback", "Service configured providers के बीच switch कर सकती है। Trusted providers unavailable या rate-limited होने पर browser-based heuristics use हो सकते हैं और accuracy कम होगी।"],
      ["Storage conditions", "Member history original full-resolution files के बजाय compressed images और thumbnails store कर सकती है। Duplicate scans file hash के आधार पर skip हो सकते हैं।"],
      ["Account conditions", "Member features के लिए Google sign-in जरूरी है। अपने Google account access को secure रखना आपकी जिम्मेदारी है।"],
      ["Availability", "Service किसी भी समय changed, suspended, rate-limited या discontinued हो सकती है।"]
    ]
  },
  es: {
    title: "Condiciones del servicio",
    intro: "Estas condiciones describen límites operativos y comportamiento esperado al usar PIC Check AI.",
    sections: [
      ["Condiciones de precisión", "Las puntuaciones pueden verse afectadas por capturas, compresión, recortes, filtros, resubidas, fotos de pantallas, ilustraciones, marcas de agua, baja resolución y límites de cuota de proveedores."],
      ["Respaldo de proveedor", "El servicio puede cambiar entre proveedores configurados. Si proveedores confiables no están disponibles o tienen límite de tasa, se pueden usar heurísticas del navegador con menor precisión."],
      ["Condiciones de almacenamiento", "El historial de miembros puede guardar imágenes comprimidas y miniaturas en lugar de archivos originales de resolución completa. Escaneos duplicados pueden omitirse por hash."],
      ["Condiciones de cuenta", "Las funciones de miembro requieren inicio de sesión con Google. Eres responsable de mantener seguro el acceso a tu cuenta Google."],
      ["Disponibilidad", "El servicio puede cambiarse, suspenderse, limitarse o discontinuarse en cualquier momento."]
    ]
  },
  ar: {
    title: "شروط الخدمة",
    intro: "توضح هذه الشروط الحدود التشغيلية والسلوك المتوقع عند استخدام PIC Check AI.",
    sections: [
      ["شروط الدقة", "قد تتأثر الدرجات بلقطات الشاشة والضغط والقص والفلاتر وإعادة الرفع وتصوير الشاشات بالكاميرا والرسوم والعلامات المائية والدقة المنخفضة وحدود حصة المزودين."],
      ["الرجوع إلى مزود بديل", "قد تنتقل الخدمة بين المزودين المهيئين. إذا كان المزودون الموثوقون غير متاحين أو مقيدين، فقد تستخدم heuristics في المتصفح بدقة أقل."],
      ["شروط التخزين", "قد يحفظ سجل الأعضاء صوراً مضغوطة وصوراً مصغرة بدلاً من الملفات الأصلية كاملة الدقة. قد يتم تخطي الفحوصات المكررة بناءً على hash الملف."],
      ["شروط الحساب", "تتطلب مزايا العضو تسجيل الدخول عبر Google. أنت مسؤول عن تأمين الوصول إلى حساب Google الخاص بك."],
      ["التوفر", "قد يتم تغيير الخدمة أو تعليقها أو تقييدها أو إيقافها في أي وقت."]
    ]
  }
});

Object.assign(docs.legal, {
  zh: {
    title: "法律声明",
    intro: "本法律声明说明 PIC Check AI 的重要限制。",
    sections: [
      ["不是决定性工具", "PIC Check AI 是筛查和分流工具。它不判定事实、真实性、作者身份、欺诈、所有权或法律责任。"],
      ["不建立专业关系", "使用本服务不会建立律师-客户、取证专家、审计师、顾问、雇佣或代理关系。"],
      ["需要人工审查", "任何重大决策都应包含人工审查、背景信息、额外证据，并在适当时加入合格专家分析。"],
      ["隐私和数据", "Google 登录可能提供姓名、邮箱、头像和认证标识。会员扫描历史可能包括压缩图片、缩略图、元数据、分数和检测信号。"],
      ["知识产权", "你仍然负责上传图片的权利，并授予为实现扫描功能所需的处理许可。"]
    ]
  },
  hi: {
    title: "Legal notice",
    intro: "यह legal notice PIC Check AI की important limitations समझाता है।",
    sections: [
      ["Determinative tool नहीं", "PIC Check AI screening और triage tool है। यह truth, authenticity, authorship, fraud, ownership या legal liability determine नहीं करता।"],
      ["Professional relationship नहीं", "Service का use attorney-client, forensic expert, auditor, consultant, employment या agency relationship create नहीं करता।"],
      ["Human review required", "किसी भी significant decision में human review, context, additional evidence और जहां appropriate हो qualified expert analysis शामिल होना चाहिए।"],
      ["Privacy और data", "Google sign-in name, email, avatar और authentication identifiers provide कर सकता है। Member scan history में compressed images, thumbnails, metadata, scores और detection signals शामिल हो सकते हैं।"],
      ["Intellectual property", "Uploaded images के rights की जिम्मेदारी आपकी रहती है और scan functionality के लिए उन्हें process करने की आवश्यक permission देते हैं।"]
    ]
  },
  es: {
    title: "Aviso legal",
    intro: "Este aviso legal explica limitaciones importantes de PIC Check AI.",
    sections: [
      ["No es una herramienta determinante", "PIC Check AI es una herramienta de filtrado y triaje. No determina verdad, autenticidad, autoría, fraude, propiedad o responsabilidad legal."],
      ["Sin relación profesional", "El uso del servicio no crea una relación abogado-cliente, experto forense, auditor, consultor, laboral o de agencia."],
      ["Revisión humana requerida", "Cualquier decisión significativa debe incluir revisión humana, contexto, evidencia adicional y análisis experto cualificado cuando corresponda."],
      ["Privacidad y datos", "Google sign-in puede proporcionar nombre, email, avatar e identificadores de autenticación. El historial de miembros puede incluir imágenes comprimidas, miniaturas, metadatos, puntuaciones y señales."],
      ["Propiedad intelectual", "Conservas la responsabilidad sobre los derechos de las imágenes subidas y concedes el permiso necesario para procesarlas para la función de escaneo."]
    ]
  },
  ar: {
    title: "إشعار قانوني",
    intro: "يوضح هذا الإشعار القانوني القيود المهمة في PIC Check AI.",
    sections: [
      ["ليست أداة حاسمة", "PIC Check AI أداة فحص وفرز. لا تحدد الحقيقة أو الأصالة أو المؤلف أو الاحتيال أو الملكية أو المسؤولية القانونية."],
      ["لا تنشئ علاقة مهنية", "استخدام الخدمة لا ينشئ علاقة محامٍ وعميل أو خبير جنائي أو مدقق أو مستشار أو توظيف أو وكالة."],
      ["المراجعة البشرية مطلوبة", "أي قرار مهم يجب أن يتضمن مراجعة بشرية وسياقاً وأدلة إضافية وتحليلاً خبيراً مؤهلاً عند الحاجة."],
      ["الخصوصية والبيانات", "قد يوفر تسجيل الدخول عبر Google الاسم والبريد والصورة والمعرفات. قد يشمل سجل الأعضاء صوراً مضغوطة وصوراً مصغرة وبيانات وصفية ودرجات وإشارات كشف."],
      ["الملكية الفكرية", "تظل مسؤولاً عن حقوق الصور المرفوعة وتمنح الإذن اللازم لمعالجتها من أجل وظيفة الفحص."]
    ]
  }
});

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
