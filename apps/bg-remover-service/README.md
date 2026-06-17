# Background Remover Service

This is a Python microservice that uses the `rembg` library to remove backgrounds from images. It exposes a single FastAPI endpoint that is consumed by the Next.js frontend.

## Local Setup Instructions

> Note: You need Python 3.10 or higher installed on your system.

1. **Open a terminal** and navigate to this directory:
   ```bash
   cd apps/bg-remover-service
   ```

2. **Create a virtual environment** (recommended to keep dependencies isolated):
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```

The server will start at `http://localhost:8000`.

## API Endpoint

**`POST /api/remove-bg`**
- **Content-Type**: `multipart/form-data`
- **Body**: Needs a field named `file` containing the image.
- **Returns**: A transparent `image/png` binary.

> **Important**: The very first time you upload an image, the `rembg` library will download the `u2net` model (~176MB). This process may take a few seconds to a few minutes depending on your internet connection. Once downloaded, it is cached locally and subsequent requests will be much faster.
