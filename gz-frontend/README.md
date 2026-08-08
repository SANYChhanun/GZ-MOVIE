# GZ Web Movie — Frontend (React + Vite + Tailwind)

## Phase 0 — របៀបដំណើរការគម្រោងនេះនៅលើម៉ាស៊ីនរបស់អ្នក

### ១. តម្លើង Dependencies
```bash
npm install
```

### ២. ចម្លង .env
```bash
cp .env.example .env
```

### ៣. ដំណើរការ Dev Server
```bash
npm run dev
```

បើកម៉ាស៊ីនស្វែងរកទៅ `http://localhost:5173` — អ្នកគួរឃើញទំព័រ
"GZ Web Movie — Frontend Setup ✅" ព្រមទាំងសារបញ្ជាក់ថាតើវាភ្ជាប់ជាមួយ Backend
(`http://localhost:8000`) បានឬអត់។

> ⚠️ ត្រូវប្រាកដថា Backend (Django) កំពុងរត់នៅ `python manage.py runserver` ជាមុន
> មិនដូច្នេះទេ Frontend នឹងបង្ហាញ "មិនអាចភ្ជាប់ទៅ Backend បានទេ"។

---

## ជំហានបន្ទាប់ (Phase 1)
1. តម្លើង state management បន្ថែម បើត្រូវការ (Zustand ជាដើម)
2. បង្កើត `src/router.jsx` + `react-router-dom` routes (Login/SignUp/Home)
3. បង្កើត `src/api/axiosClient.js` សម្រាប់ហៅ Backend API ជា Pattern រួម
4. សាងសង់ `LoginPage`, `SignUpPage` ភ្ជាប់ជាមួយ `/api/auth/` ពី Backend

## រចនាសម្ព័ន្ធ Folder បច្ចុប្បន្ន (Phase 0)
```
gz-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx
    └── index.css
```
