# Summerify

Summerify is a React frontend with a Spring Boot API for summarizing pasted text and extracting text from PDFs.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20+

## Configure the Hugging Face token

The token is intentionally not stored in this repository. Set it in the terminal used to start the backend:

```powershell
$env:HUGGINGFACE_API_KEY = "your-token"
```

`backend/src/main/resources/application.properties` reads that value via `huggingface.api-key=${HUGGINGFACE_API_KEY:}`. For a deployed service, define this as a secret/environment variable in the hosting platform instead.

## Run locally

In one terminal:

```powershell
cd C:\Users\91935\Desktop\Summerify\backend
mvn spring-boot:run
```

In another terminal:

```powershell
cd C:\Users\91935\Desktop\Summerify\frontend
npm install
npm run dev
```

Open the address printed by Vite (normally `http://localhost:5173`). The Vite development server forwards `/api` calls to Spring Boot on port 8080.

## API

- `POST /api/summaries` — JSON body: `{ "text": "…", "ratio": 0.6 }`
- `POST /api/documents/extract` — multipart form field: `file` (PDF, max 10 MB)

PDFs are processed in memory and are not saved to disk.
