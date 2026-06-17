from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove, new_session
from PIL import Image
import io

app = FastAPI(title="Background Remover API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session cache to store loaded models
sessions = {}

def get_session(model_name: str):
    if model_name not in sessions:
        # Load and cache the model if it hasn't been loaded yet
        sessions[model_name] = new_session(model_name)
    return sessions[model_name]

# Pre-load the default model to save time on the first request
get_session("isnet-general-use")

@app.get("/")
def read_root():
    return {"status": "Service is running", "message": "Send a POST request with an image to /api/remove-bg"}

@app.post("/api/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    model_name: str = Form("isnet-general-use"),
    alpha_matting: bool = Form(True),
    foreground_threshold: int = Form(240),
    background_threshold: int = Form(10),
    erode_size: int = Form(10)
):
    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Get the requested model session
        current_session = get_session(model_name)
        
        # Process the image dynamically based on frontend parameters
        output_image = remove(
            input_image, 
            session=current_session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=foreground_threshold,
            alpha_matting_background_threshold=background_threshold,
            alpha_matting_erode_size=erode_size
        )
        
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return Response(content=img_byte_arr, media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
