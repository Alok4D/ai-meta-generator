# Use Python 3.10 as base image
FROM python:3.10-slim

# Create a non-root user (HuggingFace Spaces requirement for security)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY --chown=user main.py .

# Expose port 7860 (HuggingFace Spaces default port)
EXPOSE 7860

# Run the FastAPI server on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
