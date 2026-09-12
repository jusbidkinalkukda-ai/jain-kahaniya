# जैन कहानियाँ वाचनालय — Admin Portal UI/UX Specification

> **Version:** 1.0  
> **Aesthetic Theme:** Ivory Manuscript Palette with Sacred Gold & Vermilion Illumination  
> **Target Platforms:** Desktop & Tablet / Mobile Responsive Web  
> **Design Compatibility:** 100% matched with `jain-knowledge-quest-main` (`src/styles.css`, Radix UI, Tailwind CSS v4)

---

## विषय सूची (Table of Contents)
1. [डिज़ाइन दर्शन व विजुअल आइडेंटिटी (Design Philosophy)](#1-डिज़ाइन-दर्शन-व-विजुअल-आइडेंटिटी-design-philosophy)
2. [कलर टोकन्स व वेरिएबल मैपिंग (Color Tokens & Variables)](#2-कलर-टोकन्स-व-वेरिएबल-मैपिंग-color-tokens--variables)
3. [टाइपोग्राफी सिस्टम (Typography System)](#3-टाइपोग्राफी-सिस्टम-typography-system)
4. [सिग्नेचर विजुअल एलिमेंट्स (Signature CSS Utilities)](#4-सिग्नेचर-विजुअल-एलिमेंट्स-signature-css-utilities)
5. [एडमिन पोर्टल लेआउट स्ट्रक्चर (Shell Layout Architecture)](#5-एडमिन-पोर्टल-लेआउट-स्ट्रक्चर-shell-layout-architecture)
6. [स्क्रीन-दर-स्क्रीन विस्तृत UI विवरण (Screen-by-Screen Specifications)](#6-स्क्रीन-दर-स्क्रीन-विस्तृत-ui-विवरण-screen-by-screen-specifications)
   - 6.1 [एडमिन लॉगिन (`/admin/login`)](#61-एडमिन-लॉगिन-adminlogin)
   - 6.2 [डैशबोर्ड व विश्लेषण (`/admin/dashboard`)](#62-डैशबोर्ड-व-विश्लेषण-admindashboard)
   - 6.3 [कथा व आलेख प्रबंधन (`/admin/blogs`)](#63-कथा-व-आलेख-प्रबंधन-adminblogs)
   - 6.4 [कथा संपादक व अध्याय निर्माता (`/admin/blogs/editor`)](#64-कथा-संपादक-व-अध्याय-निर्माता-adminblogseditor)
   - 6.5 [श्रेणी व दर्शन प्रबंधन (`/admin/categories`)](#65-श्रेणी-व-दर्शन-प्रबंधन-admincategories)
   - 6.6 [उपयोगकर्ता व भूमिका प्रबंधन (`/admin/users`)](#66-उपयोगकर्ता-व-भूमिका-प्रबंधन-adminusers)
   - 6.7 [एपीआई डायग्नोस्टिक्स व सेटिंग्स (`/admin/settings`)](#67-एपीआई-डायग्नोस्टिक्स-व-सेटिंग्स-adminsettings)
7. [पुनः प्रयोज्य कॉम्पोनेन्ट लाइब्रेरी (Reusable Component Specifications)](#7-पुनः-प्रयोज्य-कॉम्पोनेन्ट-लाइब्रेरी-reusable-component-specifications)
8. [पूर्ण CSS स्टाइल्स (`admin-theme.css`)](#8-पूर्ण-css-स्टाइल्स-admin-themecss)

---

## 1. डिज़ाइन दर्शन व विजुअल आइडेंटिटी (Design Philosophy)

**जैन कहानियाँ वाचनालय (Jain Knowledge Quest)** का डिज़ाइन आम कॉर्पोरेट एडमिन डैशबोर्ड (जो आमतौर पर ग्रे या नियॉन ब्लू होते हैं) से एकदम भिन्न और अद्वितीय है। 

### मूल सिद्धांत:
- **पांडुलिपि शांति (Manuscript Serenity):** पृष्ठभूमियों में हल्की धूप, प्राचीन भोजपत्र (parchment) और गर्म हाथीदांत (ivory) की आभा है।
- **पवित्र प्रकाश (Sacred Illumination):** प्राथमिक क्रियाओं और हाइलाइट्स के लिए स्वर्ण (`gold`) और पवित्र सिंदूरी लाल (`vermilion`) का उपयोग।
- **सुपाठ्यता व गंभीरता (Scriptural Readability):** शीर्षकों में क्लासिकल देवनागरी सेरिफ़ फॉन्ट (`Tiro Devanagari Hindi`) तथा डेटा ग्रिड में स्पष्ट sans-serif (`Mukta` / `Inter`)।
- **सटीक आधुनिकता (Modern Precision):** 20px के कोमल घुमावदार कार्ड्स (`radius-xl`), सूक्ष्म पारभासी ग्लास प्रभाव (`backdrop-blur`), और सुस्पष्ट बॉर्डर।

---

## 2. कलर टोकन्स व वेरिएबल मैपिंग (Color Tokens & Variables)

एडमिन पोर्टल में किसी भी रंग को मनमाने ढंग से हार्डकोड नहीं किया जाएगा; सभी रंग प्रोजेक्ट के OKLCH सिमेंटिक टोकन्स पर आधारित हैं:

| टोकन नाम | OKLCH परिभाषा | हेक्स सन्निकट | भूमिका / उपयोग |
|---|---|---|---|
| `--background` | `oklch(0.972 0.017 88)` | `#FAF7F2` | संपूर्ण पृष्ठ पृष्ठभूमि (Ivory Paper) |
| `--card` / Surface | `oklch(0.985 0.012 89)` | `#FCFBF9` | डेटा टेबल, फ़ॉर्म्स, मोडल डायलॉग्स |
| `--parchment` | `oklch(0.941 0.028 87)` | `#F2EDE4` | इनपुट फील्ड्स, साइडबार एक्टिव बैकग्राउंड |
| `--foreground` (Ink) | `oklch(0.26 0.032 60)` | `#342D26` | प्राथमिक हेडिंग्स, मुख्य पाठ्य |
| `--ink-soft` | `oklch(0.51 0.031 66)` | `#7A7067` | सबटाइटल्स, टेबल हेडर, टाइमस्टैम्प |
| `--gold` (स्वर्ण) | `oklch(0.72 0.12 79)` | `#C8973A` | जाली डिवाइडर, रेटिंग्स, फोकस रिंग |
| `--vermilion` (सिंदूर)| `oklch(0.53 0.17 33)` | `#BD3A2B` | प्राथमिक CTA बटन, एक्टिव मेनू टेक्स्ट |
| `--leaf` (तुलसी दल) | `oklch(0.50 0.07 145)` | `#4A7C59` | 'Published' स्थिति, सफलता टोस्ट, पिल्स |
| `--night` | `oklch(0.25 0.03 58)` | `#2B2520` | प्रोफ़ाइल मेनू, मुख्य बटन बैकग्राउंड |
| `--border` | `oklch(0.29 0.035 58 / 12%)`| `rgba(52,45,38,0.12)`| कार्ड व टेबल सीमाओं के लिए बॉर्डर |
| `--input` | `oklch(0.29 0.035 58 / 16%)`| `rgba(52,45,38,0.16)`| इनपुट बॉर्डर्स |

---

## 3. टाइपोग्राफी सिस्टम (Typography System)

```css
--font-display: "Tiro Devanagari Hindi", "Georgia", serif;
--font-sans: "Mukta", "Inter", ui-sans-serif, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, monospace;
```

### उपयोग नियम:
1. **हेडिंग्स (h1, h2, h3, Page Titles, Stat Numbers):**
   - हमेशा `font-display` का उपयोग करें।
   - वजन: 400 (रेगुलर) या 600 (सेमी-बोल्ड)। 
   - लेटर स्पेसिंग: `0.005em`।
2. **बॉडी टेक्स्ट, लेबल्स, टेबल सेल्स:**
   - हमेशा `font-sans` का उपयोग करें।
   - वजन: 400 (रेगुलर) विवरण के लिए, 500 (मीडियम) बटन्स व लिंक्स के लिए।
3. **आइब्रो, स्टेटस कोड, तकनीकी डेटा, आईडी:**
   - हमेशा `font-mono` का उपयोग करें।
   - लेटर स्पेसिंग: `0.2em` (ट्रैक्ड आउट), अपरकेस।

---

## 4. सिग्नेचर विजुअल एलिमेंट्स (Signature CSS Utilities)

```css
/* पांडुलिपि बैकग्राउंड प्रभाव */
.manuscript {
  background-image:
    radial-gradient(120% 90% at 50% -20%, oklch(0.72 0.12 79 / 0.14), transparent 60%),
    linear-gradient(180deg, var(--background), var(--parchment));
}

/* स्वर्ण जाली डिवाइडर */
.jali {
  background-image: repeating-linear-gradient(
    90deg,
    var(--gold) 0,
    var(--gold) 2px,
    transparent 2px,
    transparent 12px
  );
}

/* कोमल छांव युक्त लीफ कार्ड */
.card-leaf {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow: 0 24px 48px -36px oklch(0.26 0.032 60 / 0.25);
}

/* मोनोस्पेस आइब्रो लेबल */
.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

---

## 5. एडमिन पोर्टल लेआउट स्ट्रक्चर (Shell Layout Architecture)

एडमिन का समग्र ढांचा एक दो-कॉलम आधुनिक व्यवस्था का पालन करता है:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [⎈] जैन कहानियाँ | Vachanalaya Admin   [⌕ खोजें Ctrl+K]  ● LIVE API  [👤 सुपरएडमिन]│ ← शीर्ष हेडर
├──────────────────┬───────────────────────────────────────────────────────────┤
│ ❖ डैशबोर्ड       │ 🏠 / कथाएँ / सूची                                         │
│ 📖 कथा प्रबंधन   ├───────────────────────────────────────────────────────────┤
│ 🏷️ श्रेणियाँ      │ [Page Content Area]                                       │
│ 👥 यूज़र्स व रोल्स │  • Stat Cards (ग्रिड)                                     │
│ ⚙️ सेटिंग्स       │  • Data Tables (फ़िल्टर, सर्च, पेजिनेशन)                    │
│ ───────────────  │  • Action Buttons (+ नयी कथा)                             │
│ 🚪 लॉग आउट       │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
```

### A. बायाँ साइडबार (Admin Sidebar):
- **चौड़ाई:** `260px` (डेस्कटॉप), मोबाइल पर स्लाइड-आउट ड्रॉअर।
- **बैकग्राउंड:** `var(--card)` एक दाएं बॉर्डर (`1px solid var(--border)`) के साथ।
- **शीर्ष ब्रांडिंग:**
  - लोगो टेक्स्ट: "जैन कहानियाँ" (`font-display`, 22px)।
  - आइब्रो बैज: `ADMIN VACHANALAYA`।
  - नीचे 1px की `.jali` स्वर्ण रेखा।
- **नेविगेशन आइटम्स:**
  - आइकन: `lucide-react` (18px)।
  - पैडिंग: `10px 14px`, रेडियस: `12px`।
  - डिफॉल्ट स्टेट: `text-ink-soft hover:bg-parchment/60 hover:text-foreground`।
  - एक्टिव स्टेट: `bg-parchment text-vermilion font-medium border-l-4 border-gold shadow-xs`।
- **निचला खंड:** वर्तमान यूज़र की ईमेल चिप और `लॉग आउट` बटन।

### B. शीर्ष टॉपबार (Sticky Topbar):
- **ऊंचाई:** `64px`।
- **स्टाइल:** `bg-background/85 backdrop-blur-md border-b border-border`।
- **ब्रेडक्रम्ब्स (Breadcrumbs):** साफ़ और स्पष्ट नेविगेशन पाथ (`प्रबंधन > कथाएँ > संपादन`)।
- **लाइव सर्वर इंडिकेटर:**
  - अगर बैकएंड चालू है: हरा पल्सिंग बिंदु + `Live API (3000)`।
  - अगर डेमो मोड है: एम्बर बिंदु + `Demo Simulator`।
- **त्वरित क्रिया बटन:** `+ नयी कथा लिखें` (गोल Vermilion पिल बटन)।

---

## 6. स्क्रीन-दर-स्क्रीन विस्तृत UI विवरण (Screen-by-Screen Specifications)

### 6.1 एडमिन लॉगिन (`/admin/login`)
- **कंटेनर:** पूरी स्क्रीन पर `.manuscript` बैकग्राउंड, मध्य में स्थित कार्ड।
- **लॉगिन कार्ड:**
  - चौड़ाई: `440px` (अधिकतम 95vw)।
  - कार्ड के शीर्ष पर `h-1.5 w-full jali` स्वर्ण बॉर्डर।
  - शीर्षक: "जैन कहानियाँ" (`font-display text-3xl`)।
  - उपशीर्षक: "प्रबंधन वाचनालय — अधिकृत प्रवेश"।
- **फ़ील्ड्स:**
  - ईमेल इनपुट (`Mail` आइकन के साथ, गोल 12px इनपुट)।
  - पासवर्ड इनपुट (`Lock` आइकन + शो/हाइड पासवर्ड बटन)।
- **डेमो ऑटो-फिल बटन:** 
  - एक क्लिक में `superadmin1@gmail.com` और `123456` भरने का बटन ताकि टेस्टिंग बिना झंझट तुरंत हो सके।
- **प्रवेश बटन:**
  - पूर्ण चौड़ाई, Vermilion रंग, होवर पर हल्का उत्थान (`hover:-translate-y-0.5`).

---

### 6.2 डैशबोर्ड व विश्लेषण (`/admin/dashboard`)

#### A. स्वागत हेडर
- तारीख (हिन्दी व अंग्रेजी में), "जय जिनेंद्र, [एडमिन नाम]"।
- सर्वर लेटेंसी इंडिकेटर (उदा. `● 34ms - सामान्य`)।

#### B. मैट्रिक कार्ड्स ग्रिड (4-Col Grid)
1. **कुल कथाएँ:** संख्या (38), आइकन `BookOpen`, ट्रेंड `+3 इस सप्ताह`।
2. **प्रकाशित कथाएँ:** संख्या (34), आइकन `CheckCircle`, स्टेटस पिल `90% लाइव`।
3. **विषय व श्रेणियाँ:** संख्या (8), आइकन `FolderTree`, सबटाइटल `तीर्थंकर, दर्शन, व्रत`।
4. **सक्रिय पाठक व एडमिन:** संख्या (142), आइकन `Users`, सबटाइटल `3 सुपरएडमिन`।

#### C. हालिया कथाएँ टेबल (Recent Stories Data Table)
- **हेडर:** शीर्षक, श्रेणी, स्थिति, दृश्य (Views), संशोधित दिनांक, क्रियाएँ।
- **पंक्ति (Row):**
  - कथा कवर थंबनेल (48x36px, गोल 6px)।
  - शीर्षक देवनागरी में, नीचे अंग्रेजी स्लग।
  - स्थिति बैज (`Published` = हरा, `Draft` = एम्बर)।
  - क्विक एक्शन: `Edit (पेन्सिल)`, `Preview (आँख)`, `Delete (कचरा-पेटी)`.

---

### 6.3 कथा व आलेख प्रबंधन (`/admin/blogs`)

#### A. टूलबार व फ़िल्टर
- **खोज बार:** "शीर्षक, लेखक या सारांश से खोजें..." (ऑटो-डिबाउंस 300ms)।
- **श्रेणी ड्रॉपडाउन:** सभी श्रेणियाँ, तीर्थंकर चरित्र, जैन दर्शन, प्रेरक प्रसंग, व्रत-पर्व।
- **स्थिति टैब्स:** `सभी (All)` | `प्रकाशित (Published)` | `प्रारूप (Draft)`।
- **सॉर्टिंग:** नवीनतम प्रथम, सर्वाधिक देखे गए, वर्णमाला क्रम।

#### B. दृश्य मोड टॉगल (View Mode Toggle)
- **टेबल व्यू:** विस्तृत डेटा देखने हेतु।
- **ग्रिड व्यू:** वेबसाइट के `StoryCard` जैसा दिखने वाला कार्ड ग्रिड (कवर इमेज, श्रेणी पिल, 4:3 रेश्यो)।

#### C. मल्टी-सिलेक्ट व बल्क एक्शन बार
- एकाधिक कथाओं का चयन कर एक साथ स्थिति बदलना (`Bulk Publish`, `Bulk Draft`) या `Bulk Delete` करना।

---

### 6.4 कथा संपादक व अध्याय निर्माता (`/admin/blogs/editor`)

यह एडमिन का सबसे सशक्त घटक है। इसमें 3 मुख्य टैब्स दिए गए हैं:

```
[ टैब १: मुख्य विवरण ]  [ टैब २: अध्याय व सामग्री ]  [ टैब ३: लाइव प्रिव्यू ]
```

#### टैब १: मुख्य विवरण (Metadata)
- **कथा शीर्षक (Title):** बड़ा इनपुट (`text-2xl font-display`)।
- **स्लग (Slug):** शीर्षक से स्वतः जनरेट होने वाला URL स्लग (उदा. `bhagwan-mahavir-ke-upadesh`)।
- **श्रेणी चयनकर्ता (Category Select):** पॉपओवर या सिलेक्ट ड्रॉपडाउन।
- **लेखक / स्रोत (Author / Source):** (उदा. "आचार्य पूज्यपाद", "परंपरागत जैन कथा")।
- **प्रकाशन स्थिति (Status Switch):** `Draft` ⟷ `Published` स्विच।
- **कवर इमेज अपलोडर:** 
  - 4:3 आस्पेक्ट रेश्यो वाला ड्रैग-एंड-ड्रॉप क्षेत्र।
  - इमेज ड्रॉप करते ही तात्कालिक प्रिव्यू।
  - Cloudinary PDF होने पर ऑटोमैटिक JPG रूपांतरण का समर्थन।
- **टैग चिप्स (Sacred Tags):**
  - त्वरित सुझाव बटन: `[+ अहिंसा]`, `[+ तीर्थंकर]`, `[+ मोक्ष]`, `[+ ध्यान]`, `[+ आगम]`।

#### टैब २: अध्याय व सामग्री (Multi-Chapter Builder)
जैन कहानियाँ बहुधा अध्यायों (Chapters / Sections) में विभाजित होती हैं।
- प्रत्येक सेक्शन के लिए:
  1. अध्याय संख्या (Chapter 1, 2, 3...)
  2. अध्याय शीर्षक (उदा. "दीक्षा कल्याणक एवं तप साधना")
  3. अध्याय विशिष्ट चित्र (वैकल्पिक)
  4. अध्याय विवरण / सामग्री (Markdown युक्त टेक्स्ट एरिया)
- **`+ नया अध्याय जोड़ें` बटन:** डैश बॉर्डर वाला बड़ा कार्ड बटन।
- अध्यायों को ऊपर-नीचे करने हेतु ड्रैग-हैंडल या री-ऑर्डर बटन्स (`↑` / `↓`)।

#### टैब ३: लाइव वाचनालय प्रिव्यू (Live Reader Preview)
- एडमिन कथा लिखते समय तुरंत देख सकता है कि मुख्य वेबसाइट के `ChapterDocumentViewer` में यह पाठकों को कैसी दिखेगी (Ivory Paper, ड्रॉप-कैप्स, फोंट साइज़ स्लाइडर)।

---

### 6.5 श्रेणी व दर्शन प्रबंधन (`/admin/categories`)
- **कार्ड्स ग्रिड:** प्रत्येक श्रेणी का नाम, स्लग, उससे जुड़ी कथाओं की संख्या।
- **पैरेंट श्रेणी मैपिंग:** मुख्य श्रेणी (उदा. "दर्शन") के अधीन उप-श्रेणी (उदा. "नव तत्व")।
- **हेडर व फुटर बैनर अपलोड:** श्रेणी पृष्ठ के लिए सुरुचिपूर्ण बैनर इमेजेस।
- **मोडल फ़ॉर्म:** श्रेणी निर्माण व संपादन हेतु सुगम पॉपअप।

---

### 6.6 उपयोगकर्ता व भूमिका प्रबंधन (`/admin/users`)
- **भूमिकाएँ (Roles):**
  - `super_admin`: पूर्ण अधिकार।
  - `editor`: कथाएँ लिखना, संपादित करना।
  - `reviewer`: समीक्षा करना, प्रकाशित करना।
  - `reader`: सामान्य पाठक (केवल वाचनालय का उपयोग)।
- **टेबल:** नाम, ईमेल, रोल बैज, साइनअप दिनांक, अंतिम सक्रियता।
- **सुरक्षा क्रियाएँ:** पासवर्ड रीसेट लिंक भेजना, रोल बदलना, खाता निष्क्रिय करना।

---

### 6.7 एपीआई डायग्नोस्टिक्स व सेटिंग्स (`/admin/settings`)
- **बैकएंड बेस URL:** `http://localhost:3000` (या प्रोडक्शन URL) बदलने का फ़ील्ड।
- **लाइव सर्वर पिंग (Ping Backend):** एक क्लिक पर सर्वर स्टेटस, लेटेंसी, और हेल्थ चेक।
- **टोकन दर्शक (Token Inspector):** एक्टिव `Bearer admin_token` देखने व कॉपी करने की सुविधा।
- **लाइव / डेमो मोड स्विच:** बैकएंड ऑफलाइन होने पर भी तुरंत सभी फ़ीचर्स टेस्ट करने की क्षमता।

---

## 7. पुनः प्रयोज्य कॉम्पोनेन्ट लाइब्रेरी (Reusable Component Specifications)

### 7.1 मीट्रिक स्टैटिस्टिक कार्ड (Admin Stat Card)

```tsx
// src/components/admin/AdminStatCard.tsx
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: AdminStatCardProps) {
  return (
    <div className="card-leaf p-5 transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-ink-soft">{title}</span>
        <div className="flex size-9 items-center justify-center rounded-full bg-parchment text-vermilion">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl text-foreground">{value}</div>
      <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
        <span>{subtitle}</span>
        {trend && <span className="font-mono text-leaf">{trend}</span>}
      </div>
      <div className="jali mt-4 h-0.5 w-full opacity-40" />
    </div>
  );
}
```

---

### 7.2 स्थिति बैज (Manuscript Status Badge)

```tsx
// src/components/admin/StatusBadge.tsx
export function StatusBadge({ status }: { status: "published" | "draft" | string }) {
  const isPublished = status.toLowerCase() === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium ${
        isPublished
          ? "bg-leaf/10 text-leaf border border-leaf/25"
          : "bg-gold/15 text-foreground border border-gold/30"
      }`}
    >
      <span className={`size-1.5 rounded-full ${isPublished ? "bg-leaf" : "bg-gold"}`} />
      {isPublished ? "प्रकाशित (Live)" : "प्रारूप (Draft)"}
    </span>
  );
}
```

---

### 7.3 इमेज ड्रॉपज़ोन (Manuscript Image Dropzone)

```tsx
// src/components/admin/ImageDropzone.tsx
import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageDropzoneProps {
  label: string;
  value?: string;
  onChange: (file: File | string | null) => void;
  aspectRatio?: "4/3" | "16/9" | "square";
}

export function ImageDropzone({ label, value, onChange, aspectRatio = "4/3" }: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {preview ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-parchment">
          <img src={preview} alt={label} className="size-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-md hover:bg-background"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/60 transition-colors hover:border-gold hover:bg-parchment/50">
          <Upload className="size-8 text-ink-soft" />
          <span className="mt-2 text-xs font-medium text-foreground">छवि अपलोड करें</span>
          <span className="text-[11px] text-ink-soft">PNG, JPG, WebP (ड्रैग या क्लिक करें)</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
        </label>
      )}
    </div>
  );
}
```

---

## 8. पूर्ण CSS स्टाइल्स (`admin-theme.css`)

यदि आप एडमिन पोर्टल को अलग ऐप के रूप में चला रहे हैं, तो नीचे दी गई पूरी स्टाइलशीट (`src/admin-theme.css`) उपयोग करें:

```css
@import url('https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --radius: 1rem;

  /* वाचनालय पांडुलिपि पैलेट */
  --background: oklch(0.972 0.017 88);
  --foreground: oklch(0.26 0.032 60);
  --parchment: oklch(0.941 0.028 87);
  --ink-soft: oklch(0.51 0.031 66);

  --card: oklch(0.985 0.012 89);
  --card-foreground: oklch(0.26 0.032 60);

  --primary: oklch(0.29 0.035 58);
  --primary-foreground: oklch(0.972 0.017 88);

  --secondary: oklch(0.925 0.032 86);
  --secondary-foreground: oklch(0.3 0.035 58);

  --muted: oklch(0.93 0.024 86);
  --muted-foreground: oklch(0.53 0.03 68);

  --accent: oklch(0.9 0.055 82);
  --accent-foreground: oklch(0.29 0.035 58);

  --destructive: oklch(0.55 0.19 30);
  --destructive-foreground: oklch(0.98 0.012 89);

  --border: oklch(0.29 0.035 58 / 12%);
  --input: oklch(0.29 0.035 58 / 16%);
  --ring: oklch(0.71 0.12 78);

  /* पवित्र और सूक्ष्म रंग */
  --gold: oklch(0.72 0.12 79);
  --gold-foreground: oklch(0.24 0.03 60);
  --vermilion: oklch(0.53 0.17 33);
  --vermilion-foreground: oklch(0.98 0.012 89);
  --leaf: oklch(0.5 0.07 145);
  --night: oklch(0.25 0.03 58);

  /* टाइपोग्राफी */
  --font-display: "Tiro Devanagari Hindi", "Georgia", serif;
  --font-sans: "Mukta", "Inter", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: 0.005em;
}

.manuscript {
  background-image:
    radial-gradient(120% 90% at 50% -20%, oklch(0.72 0.12 79 / 0.14), transparent 60%),
    linear-gradient(180deg, var(--background), var(--parchment));
}

.jali {
  background-image: repeating-linear-gradient(
    90deg,
    var(--gold) 0,
    var(--gold) 2px,
    transparent 2px,
    transparent 12px
  );
}

.card-leaf {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px -28px oklch(0.26 0.032 60 / 0.25);
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

---

## 9. सारांश व क्रियान्वयन चेकलिस्ट (Implementation Checklist)

- [x] **कलर पैलेट संगति:** Ivory, Parchment, Deep Ink, Gold, Vermilion का सटीक OKLCH विनिर्देश।
- [x] **टाइपोग्राफी संरेखण:** Tiro Devanagari Hindi (हेडिंग्स), Mukta (बॉडी), IBM Plex Mono (कोड व आइब्रो)।
- [x] **लेआउट ढांचा:** Sticky Topbar (सर्वर पिंग, ब्रेडक्रम्ब्स) + Collapsible Manuscript Sidebar।
- [x] **मुख्य स्क्रीन डिज़ाइन्स:** लॉगिन, डैशबोर्ड, कथा सूची, मल्टी-चैप्टर एडिटर, श्रेणी प्रबंधन, यूज़र्स व एपीआई सेटिंग्स।
- [x] **पुनः प्रयोज्य कॉम्पोनेंट्स:** Stat Card, Status Badge, Image Dropzone, और परिष्कृत CSS।
