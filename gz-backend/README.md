# GZ Web Movie — Backend (Django)

## Phase 0 — របៀបដំណើរការគម្រោងនេះនៅលើម៉ាស៊ីនរបស់អ្នក

### ១. បង្កើត Virtual Environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### ២. តម្លើង Package (ដូចអ្នកបានរាយខាងលើ)
```bash
pip install django djangorestframework django-cors-headers django-filter pillow python-dotenv
```
ឬប្រើ requirements.txt ដែលមានស្រាប់:
```bash
pip install -r requirements.txt
```

### ៣. ចម្លង .env
```bash
cp .env.example .env
```
រួចបើក `.env` ហើយប្តូរ `SECRET_KEY` ទៅជាតម្លៃចៃដន្យផ្សេង (អាចប្រើ
`python -c "import secrets; print(secrets.token_urlsafe(50))"` ដើម្បីបង្កើត)។

### ៤. Migrate Database (SQLite សម្រាប់ Phase 0)
```bash
python manage.py migrate
```

### ៥. បង្កើត Superuser (សម្រាប់ចូល /admin/)
```bash
python manage.py createsuperuser
```

### ៦. ដំណើរការ Server
```bash
python manage.py runserver
```

បើកម៉ាស៊ីនស្វែងរកទៅ:
- `http://127.0.0.1:8000/api/health/` → គួរឃើញ `{"status": "ok", ...}`
- `http://127.0.0.1:8000/admin/` → Login ដោយ Superuser

---

## ជំហានបន្ទាប់ (Phase 1)
1. បង្កើត App ដំបូង: `python manage.py startapp accounts apps/accounts`
2. ក្នុង `apps/accounts/apps.py` ប្តូរ `name = "apps.accounts"`
3. បន្ថែម `"apps.accounts"` ចូល `INSTALLED_APPS` ក្នុង `config/settings.py`
4. តម្លើង `djangorestframework-simplejwt` សម្រាប់ JWT Auth
5. សរសេរ `User` model + register/login/verify endpoints

## រចនាសម្ព័ន្ធ Folder បច្ចុប្បន្ន (Phase 0)
```
gz-backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── apps/               ← App នីមួយៗ (accounts, movies...) នឹងបង្កើតនៅទីនេះ
```
