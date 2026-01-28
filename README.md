# AWS Bedrock Chat Web Application

A modern, production-ready web application for chatting with Claude AI models via AWS Bedrock REST API. Built with FastAPI backend and vanilla JavaScript frontend, fully containerized with Docker.

![AWS Bedrock Chat](https://img.shields.io/badge/AWS-Bedrock-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## Features

✨ **Core Functionality**
- 💬 Clean, modern chat interface with Claude AI models
- 🔐 Secure credential management via `.credentials` file
- 💾 Persistent user settings across sessions
- 🎛️ Configurable AI parameters (temperature, tokens, etc.)
- 📊 Token usage tracking
- ⚡ Real-time streaming responses
- 🐳 Single-command Docker deployment

🎨 **User Experience**
- Modern, minimalist UI design
- Responsive layout (desktop & mobile)
- Loading indicators
- Error handling with user-friendly messages
- Settings modal for easy configuration

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Service**: AWS Bedrock (Claude models)
- **Deployment**: Docker & Docker Compose
- **Authentication**: AWS IAM credentials

## Prerequisites

- Docker and Docker Compose installed
- AWS Account with Bedrock access
- AWS IAM credentials with Bedrock permissions

### Required AWS Permissions

Your IAM user/role needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude*"
    }
  ]
}
```

## Quick Start

### 1. Clone and Setup

```bash
cd c:\Users\Rabehz31181\source\Bedrock
```

### 2. Configure AWS Credentials

Create a `.credentials` file in the project root:

```bash
# Copy the example file
copy .credentials.example .credentials
```

Edit `.credentials` with your AWS credentials:

```ini
[aws]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

**⚠️ Important**: Never commit this file to version control!

### 3. Launch the Application

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container
- Mount your credentials securely
- Expose the app on port 8000

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

## Configuration

### Default Settings

The application comes with sensible defaults:

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| Region | `us-east-1` | AWS region for Bedrock |
| Model | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude 3.5 Sonnet v2 |
| Temperature | `1.0` | Randomness (0-1) |
| Max Tokens | `4096` | Maximum response length |
| Top P | `0.999` | Nucleus sampling |
| Top K | `250` | Vocabulary limit |

### Changing Settings

Click the ⚙️ settings button in the top-right corner to:
- Switch AWS regions
- Select different Claude models
- Adjust AI parameters
- Reset to defaults

All settings are automatically persisted to `data/settings.json`.

## Available Models

| Model ID | Name | Best For |
|----------|------|----------|
| `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude 3.5 Sonnet v2 | Most tasks (recommended) |
| `anthropic.claude-3-5-sonnet-20240620-v1:0` | Claude 3.5 Sonnet v1 | Previous version |
| `anthropic.claude-3-opus-20240229-v1:0` | Claude 3 Opus | Complex reasoning |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Claude 3 Sonnet | Balanced tasks |
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku | Fast responses |

## API Endpoints

### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, Claude!",
  "conversation_history": []
}
```

### Settings
```http
GET /api/settings
POST /api/settings
```

### Models
```http
GET /api/models
```

### Health Check
```http
GET /health
```

## Project Structure

```
bedrock-chat/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── bedrock_client.py    # AWS Bedrock integration
│   └── config.py            # Settings & credentials management
├── frontend/
│   ├── index.html           # Main HTML
│   ├── style.css            # Styles
│   └── app.js               # JavaScript logic
├── data/
│   ├── .gitkeep             # Ensures directory exists
│   └── settings.json        # User settings (auto-generated)
├── .credentials             # AWS credentials (git-ignored)
├── .credentials.example     # Template for credentials
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## Development

### Running Locally (without Docker)

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up credentials**:
   ```bash
   # Create .credentials file as described above
   ```

3. **Run the server**:
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the app**:
   ```
   http://localhost:8000
   ```

### Environment Variables (Alternative to .credentials)

Instead of using `.credentials`, you can set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild after changes
```bash
docker-compose up -d --build
```

### Check health
```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Issue: "AWS credentials not configured"

**Solution**: Ensure `.credentials` file exists and contains valid AWS credentials.

```bash
# Check if file exists
dir .credentials

# Verify format
type .credentials
```

### Issue: Docker container won't start

**Solution**: Check logs for errors:

```bash
docker-compose logs bedrock-chat
```

### Issue: "Access Denied" from AWS

**Solution**: Verify your IAM user has Bedrock permissions and model access is enabled in your AWS region.

### Issue: Model not available

**Solution**: Some Claude models require requesting access in AWS Bedrock console first.

1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Request access to Anthropic models

### Issue: Port 8000 already in use

**Solution**: Change the port in `docker-compose.yml`:

```yaml
ports:
  - "8080:8000"  # Change 8000 to 8080
```

## Security Best Practices

1. **Never commit credentials**: The `.credentials` file is git-ignored by default
2. **Use IAM roles**: In production, use IAM roles instead of access keys when possible
3. **Rotate credentials**: Regularly rotate your AWS access keys
4. **Restrict permissions**: Only grant minimum required Bedrock permissions
5. **Use HTTPS**: In production, deploy behind a reverse proxy with SSL

## Performance Tips

1. **Adjust max_tokens**: Lower values = faster responses
2. **Use Haiku model**: For speed-critical applications
3. **Enable caching**: Implement conversation caching for frequently asked questions
4. **Monitor costs**: Track token usage in AWS Cost Explorer

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions:
- Check the Troubleshooting section
- Review AWS Bedrock documentation
- Open an issue on GitHub

## Roadmap

Future enhancements:
- [ ] Conversation history persistence
- [ ] Multi-user support with authentication
- [ ] Streaming responses
- [ ] File upload capability
- [ ] Export conversation feature
- [ ] Dark mode toggle
- [ ] System prompts configuration
- [ ] Cost tracking dashboard

## Acknowledgments

- AWS Bedrock for providing Claude AI access
- Anthropic for the Claude models
- FastAPI for the excellent web framework

---

Built with ❤️ using AWS Bedrock and FastAPI
