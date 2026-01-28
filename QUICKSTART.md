# Quick Start Guide

## Setup in 3 Steps

### Step 1: Create AWS Credentials File
```bash
# Copy the example
copy .credentials.example .credentials

# Edit with your AWS credentials
notepad .credentials
```

Add your credentials:
```ini
[aws]
aws_access_key_id = YOUR_ACTUAL_ACCESS_KEY_ID
aws_secret_access_key = YOUR_ACTUAL_SECRET_ACCESS_KEY
```

### Step 2: Launch with Docker
```bash
docker-compose up -d
```

### Step 3: Open in Browser
```
http://localhost:8000
```

## That's it! 🎉

You should now see the chat interface. Try sending a message to Claude!

## First Time Setup Checklist

- [ ] AWS account with Bedrock access
- [ ] Docker Desktop installed and running
- [ ] Requested access to Claude models in AWS Bedrock console
- [ ] Created `.credentials` file with valid AWS credentials
- [ ] Ran `docker-compose up -d`
- [ ] Opened http://localhost:8000

## Common First-Time Issues

**Q: Getting "credentials not configured" error?**
A: Make sure `.credentials` file exists in the project root and contains valid AWS credentials.

**Q: Getting "Access Denied" from AWS?**
A: Request access to Anthropic models in AWS Bedrock console (Model access section).

**Q: Docker command not found?**
A: Install Docker Desktop from https://www.docker.com/products/docker-desktop/

**Q: Port 8000 already in use?**
A: Edit `docker-compose.yml` and change `"8000:8000"` to `"8080:8000"`, then use http://localhost:8080

## Need Help?

See the full [README.md](README.md) for detailed documentation.
