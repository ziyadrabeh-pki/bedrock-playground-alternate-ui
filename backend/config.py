import json
import os
from pathlib import Path
from typing import Optional

class SettingsManager:
    """Manages user settings persistence"""
    
    def __init__(self, settings_file: str = "../data/settings.json"):
        self.settings_file = Path(settings_file)
        self.default_settings = {
            "region": "us-east-1",
            "model_id": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
            "temperature": 1.0,
            "max_tokens": 4096,
            "top_p": 0.999,
            "top_k": 250,
            "system_prompt": "You are a helpful AI assistant."
        }
        
    def load_settings(self) -> dict:
        """Load settings from file or return defaults"""
        if self.settings_file.exists():
            try:
                with open(self.settings_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading settings: {e}")
                return self.default_settings.copy()
        return self.default_settings.copy()
    
    def save_settings(self, settings: dict) -> bool:
        """Save settings to file"""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving settings: {e}")
            return False

class CredentialsManager:
    """Manages AWS credentials from .credentials file"""
    
    def __init__(self, credentials_file: str = "../.credentials"):
        self.credentials_file = Path(credentials_file)
        
    def load_credentials(self) -> tuple[Optional[str], Optional[str]]:
        """Load AWS credentials from .credentials file"""
        if not self.credentials_file.exists():
            return None, None
            
        try:
            credentials = {}
            with open(self.credentials_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        credentials[key.strip()] = value.strip()
            
            access_key = credentials.get('aws_access_key_id')
            secret_key = credentials.get('aws_secret_access_key')
            
            return access_key, secret_key
        except Exception as e:
            print(f"Error loading credentials: {e}")
            return None, None
