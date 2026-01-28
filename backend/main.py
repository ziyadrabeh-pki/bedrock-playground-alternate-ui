from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from pathlib import Path

from config import SettingsManager, CredentialsManager
from bedrock_client import BedrockClient

app = FastAPI(title="AWS Bedrock Chat API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
settings_manager = SettingsManager()
credentials_manager = CredentialsManager()

# Load credentials and initialize Bedrock client
access_key, secret_key = credentials_manager.load_credentials()
if not access_key or not secret_key:
    print("WARNING: AWS credentials not found in .credentials file!")
    bedrock_client = None
else:
    settings = settings_manager.load_settings()
    bedrock_client = BedrockClient(access_key, secret_key, settings['region'])

# Pydantic models
class Message(BaseModel):
    role: str = Field(..., description="Message role (user or assistant)")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversation_history: Optional[List[Message]] = Field(default=None, description="Previous messages")

class ChatResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None
    model: Optional[str] = None
    timestamp: str

class SettingsModel(BaseModel):
    region: str = Field(default="us-east-1", description="AWS region")
    model_id: str = Field(default="us.anthropic.claude-3-7-sonnet-20250219-v1:0", description="Model ID")
    temperature: float = Field(default=1.0, ge=0.0, le=1.0, description="Temperature")
    max_tokens: int = Field(default=4096, ge=1, le=200000, description="Max tokens")
    top_p: float = Field(default=0.999, ge=0.0, le=1.0, description="Top P")
    top_k: int = Field(default=250, ge=0, le=500, description="Top K")
    system_prompt: str = Field(default="You are a helpful AI assistant.", description="System prompt")

# API Routes
@app.get("/")
async def read_root():
    """Serve the frontend"""
    return FileResponse("../frontend/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "credentials_loaded": bedrock_client is not None
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to Claude via Bedrock"""
    if not bedrock_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS credentials not configured. Please add them to .credentials file"
        )
    
    # Load current settings
    settings = settings_manager.load_settings()
    
    # Convert conversation history to dict format
    history = None
    if request.conversation_history:
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
    
    # Send message
    result = bedrock_client.send_message(
        message=request.message,
        model_id=settings['model_id'],
        temperature=settings['temperature'],
        max_tokens=settings['max_tokens'],
        top_p=settings['top_p'],
        top_k=settings['top_k'],
        system_prompt=settings.get('system_prompt'),
        conversation_history=history
    )
    
    return ChatResponse(**result)

@app.get("/api/settings", response_model=SettingsModel)
async def get_settings():
    """Get current settings"""
    settings = settings_manager.load_settings()
    return SettingsModel(**settings)

@app.post("/api/settings", response_model=SettingsModel)
async def update_settings(new_settings: SettingsModel):
    """Update settings"""
    settings_dict = new_settings.model_dump()
    
    # Update region in Bedrock client if it changed
    if bedrock_client:
        current_settings = settings_manager.load_settings()
        if settings_dict['region'] != current_settings['region']:
            bedrock_client.update_region(settings_dict['region'])
    
    # Save settings
    if settings_manager.save_settings(settings_dict):
        return new_settings
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save settings"
        )

@app.get("/api/models")
async def list_models():
    """Return available Claude models"""
    return {
        "models": [
            {
                "id": "anthropic.claude-opus-4-5-20251101-v1:0",
                "name": "Claude Opus 4.5",
                "description": "Most powerful and intelligent model"
            },
            {
                "id": "anthropic.claude-sonnet-4-5-20250929-v1:0",
                "name": "Claude Sonnet 4.5",
                "description": "Advanced balanced model"
            },
            {
                "id": "anthropic.claude-opus-4-1-20250805-v1:0",
                "name": "Claude Opus 4.1",
                "description": "Powerful reasoning model"
            },
            {
                "id": "anthropic.claude-opus-4-20250514-v1:0",
                "name": "Claude Opus 4",
                "description": "Strong performance model"
            },
            {
                "id": "anthropic.claude-sonnet-4-20250514-v1:0",
                "name": "Claude Sonnet 4",
                "description": "Balanced performance and speed"
            },
            {
                "id": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                "name": "Claude 3.7 Sonnet",
                "description": "Latest generation 3 model (default)"
            },
            {
                "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
                "name": "Claude 3.5 Sonnet v2",
                "description": "Previous generation model"
            }
        ]
    }

# Mount static files
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
