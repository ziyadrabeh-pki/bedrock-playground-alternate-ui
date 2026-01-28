# Claude Code Prompt: AWS Bedrock Chat Web App

Create a web application for communicating with the AWS Bedrock REST API with the following requirements:

## Core Functionality
- Build a chat interface to communicate with AWS Bedrock's Claude models
- Store AWS credentials (Access Key ID and Secret Access Key) in a secure credentials file
- Persist user-configurable parameters across sessions
- Default region: `us-east-1` (configurable)
- Default model: Claude Sonnet 3.7 (`anthropic.claude-3-5-sonnet-20241022-v2:0`) (configurable)

## Technical Stack
- **Backend**: FastAPI
- **Frontend**: Simple, modern HTML/CSS/JavaScript (or React if you prefer)
- **Deployment**: Single `docker-compose.yml` file that runs everything
- **Credentials**: Store in a `.credentials` or `config.ini` file (should be git-ignored)

## Configurable Parameters
The app should allow users to adjust and remember:
- AWS Region
- Model ID
- Temperature
- Max tokens
- Top P
- Top K

## UI Requirements
- Clean, modern, minimalist design
- Chat interface with message history
- Settings panel/modal for adjusting parameters
- Visual indication when API is processing
- Error handling with user-friendly messages

## Security
- Credentials file should be outside the Docker container (mounted as volume)
- Don't commit credentials to git (include `.gitignore`)
- Use environment variables where appropriate

## Deliverables
- Complete FastAPI backend with Bedrock API integration
- Frontend with chat UI and settings
- `docker-compose.yml` for easy deployment
- `README.md` with setup instructions
- Example credentials file template
- `.gitignore` file

Please create a production-ready application with proper error handling, logging, and documentation.