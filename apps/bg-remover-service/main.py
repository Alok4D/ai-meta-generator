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

# Initialize a stronger model session (IS-Net is much better than the default u2net for general use)
# Other good options: "birefnet-general", "u2net_human_seg"
model_session = new_session("isnet-general-use")

@app.get("/")
def read_root():
    return {"status": "Service is running", "message": "Send a POST request with an image to /api/remove-bg"}

@app.post("/api/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    alpha_matting: bool = Form(True) # Enabled by default for better edges
):
    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Process the image with the stronger model and alpha matting
        output_image = remove(
            input_image, 
            session=model_session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10
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
