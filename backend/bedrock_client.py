import json
import boto3
from typing import Optional, Dict, Any
from datetime import datetime

class BedrockClient:
    """AWS Bedrock API client for Claude models"""
    
    def __init__(self, access_key: str, secret_key: str, region: str = "us-east-1"):
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )
        self.region = region
        
    def update_region(self, region: str):
        """Update the AWS region"""
        self.region = region
        # Recreate client with new region
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name=region,
            aws_access_key_id=self.client._request_signer._credentials.access_key,
            aws_secret_access_key=self.client._request_signer._credentials.secret_key
        )
    
    def send_message(
        self,
        message: str,
        model_id: str,
        temperature: float = 1.0,
        max_tokens: int = 4096,
        top_p: float = 0.999,
        top_k: int = 250,
        system_prompt: str = None,
        conversation_history: list = None
    ) -> Dict[str, Any]:
        """
        Send a message to Claude via Bedrock API
        
        Args:
            message: User message to send
            model_id: Bedrock model ID
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling threshold
            top_k: Top-k sampling parameter
            system_prompt: System prompt to guide model behavior
            conversation_history: Previous messages in the conversation
            
        Returns:
            Dict containing response and metadata
        """
        try:
            # Build messages array
            messages = []
            if conversation_history:
                messages.extend(conversation_history)
            messages.append({
                "role": "user",
                "content": message
            })
            
            # Prepare request body
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
                "messages": messages
            }
            
            # Add system prompt if provided
            if system_prompt:
                request_body["system"] = system_prompt
            
            # Invoke model
            response = self.client.invoke_model(
                modelId=model_id,
                body=json.dumps(request_body)
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            return {
                "success": True,
                "response": response_body.get('content', [{}])[0].get('text', ''),
                "model": model_id,
                "usage": response_body.get('usage', {}),
                "stop_reason": response_body.get('stop_reason', ''),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
