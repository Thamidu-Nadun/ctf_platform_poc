# CTF Platform - Setup Guide 🚀

This guide will help you get the CTF Platform up and running on your computer. Follow the steps for your operating system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Verification](#verification)
4. [Quick Start](#quick-start)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have these programs installed:

### For Everyone (Required)

#### 1. Docker 🐋

Docker is like a magic box that runs programs in isolated environments so they don't mess with each other.

- **Download**: https://www.docker.com/products/docker-desktop
- **Windows/Mac**: Download Docker Desktop
- **Linux**: Install via package manager

  ```bash
  # Ubuntu/Debian
  sudo apt-get install docker.io docker-compose

  # Fedora
  sudo dnf install docker docker-compose
  ```

- **Check if installed**:
  ```bash
  docker --version
  docker-compose --version
  ```

#### 2. Git (Optional but Recommended)

Git helps you manage code versions and download the project.

- **Download**: https://git-scm.com/
- **Check if installed**:
  ```bash
  git --version
  ```

### For Development (Optional)

If you want to create new challenges:

#### 3. Node.js 18+ (for the Gateway)

- **Download**: https://nodejs.org/
- **Check if installed**:
  ```bash
  node --version
  npm --version
  ```

#### 4. Python 3.x (for Challenges)

- **Download**: https://www.python.org/
- **Check if installed**:
  ```bash
  python --version
  ```

---

## Installation

### Step 1: Get the Project

**Option A: Using Git (Recommended)**

```bash
git clone <repository-url>
cd ctf_box_poc
```

**Option B: Download Manually**

1. Download the project folder
2. Open a terminal/command prompt
3. Navigate to the folder:
   ```bash
   cd path/to/ctf_box_poc
   ```

### Step 2: Build the Docker Images

This step prepares the Docker containers. Think of it like gathering all the ingredients before cooking.

```bash
docker-compose build
```

**What this does:**

- Reads `docker-compose.yml` file
- Downloads necessary base images
- Sets up the Gateway service
- Sets up the Challenge services
- This may take 2-5 minutes depending on your internet speed

**You should see:**

```
Building gateway
Building ping_me
Building the_endpoint
...
Successfully built ...
```

### Step 3: Start the Platform

Now we'll start all the services (like turning on the game).

**Option A: Using Docker Compose (Recommended)**

```bash
docker-compose up -d
```

The `-d` flag means "run in the background" so you can use your terminal for other things.

**Option B: Windows Users - Using Deploy Script**

```bash
deploy.bat
```

**Option C: See What's Happening (Don't Use -d)**

```bash
docker-compose up
```

Without `-d`, you'll see all the logs in real-time. Press `Ctrl+C` to stop.

### Step 4: Check if Everything is Running

```bash
docker-compose ps
```

**Expected output** (all showing "Up"):

```
NAME            COMMAND                 STATUS
gateway         "docker-entrypoint..."  Up X seconds
```

---

## Verification

### Test 1: Access the Gateway

Open your web browser and go to:

```
http://localhost:3000
```

You should see the gateway home page.

### Test 2: Check All Services

```bash
# View running containers
docker ps

# View container logs
docker logs gateway
docker logs ping_me
docker logs the_endpoint
```

### Test 3: Test an API Endpoint

Using PowerShell (Windows), bash (Linux/Mac), or any API tool:

```bash
curl -X GET http://localhost:3000/api/instances
```

Or use Postman/Insomnia to make a GET request to the URL above.

---

## Quick Start

### 1. Start the Platform

```bash
docker-compose up -d
```

### 2. Access the Gateway

```
http://localhost:3000
```

### 3. Create a Challenge Instance

**Using curl/PowerShell:**

```bash
$body = @{
    challenge = "ping_me"
    user_id = "user123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/instance/create `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Using the API:**

```
POST http://localhost:3000/api/instance/create
Content-Type: application/json

{
  "challenge": "ping_me",
  "user_id": "user123"
}
```

### 4. Access the Challenge

Once created, access your challenge at:

```
http://localhost:<challenge_port>
```

Usually `http://localhost:5000` for the first instance.

### 5. Stop the Platform

When you're done:

```bash
docker-compose down
```

This stops all services gracefully.

---

## Configuration

### Changing Ports

Edit `docker-compose.yml`:

```yaml
services:
  gateway:
    ports:
      - "3000:3000" # Change first 3000 to your desired port
```

Then rebuild:

```bash
docker-compose down
docker-compose up -d
```

### Changing Challenge Flags

Edit the flag file for each challenge:

- For `ping_me`: `challenges/ping_me/flag.txt`
- For `the_endpoint`: Modify the return value in `challenges/the_endpoint/app.py`

### Environment Variables

Set environment variables in `docker-compose.yml`:

```yaml
services:
  ping_me:
    environment:
      - MY_VARIABLE=value
      - DEBUG=true
```

### Gateway Configuration

Edit `gateway/config/config.js` to modify:

- Gateway port
- Docker socket path
- Network name
- Resource limits

---

## Troubleshooting

### Problem: Docker is not found

**Solution**:

1. Ensure Docker is installed: https://docker.com
2. Restart your terminal/command prompt
3. On Mac/Linux, you might need to add Docker to PATH

```bash
# Check if Docker is installed
docker --version
```

### Problem: Port already in use

**Windows:**

```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace XXXX with PID)
taskkill /PID XXXX /F
```

**Linux/Mac:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace XXXX with PID)
kill -9 XXXX
```

Or simply change the port in `docker-compose.yml`.

### Problem: Containers won't start

**Check logs:**

```bash
docker-compose logs
docker-compose logs gateway
docker-compose logs ping_me
```

**Common causes:**

- Port already in use (see above)
- Docker daemon not running
- Not enough disk space
- Corrupted image

**Solution:**

```bash
# Clean and rebuild everything
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Problem: Docker daemon not running

**Windows:**

- Open Docker Desktop application

**Linux:**

```bash
sudo systemctl start docker
```

**Mac:**

- Docker Desktop should start automatically

### Problem: Permission denied (Linux)

**Solution:**

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply new group (then log out and back in)
newgrp docker

# Verify
docker ps
```

### Problem: Out of disk space

**Solution:**

```bash
# Remove unused Docker objects
docker system prune -a

# Check space
docker system df
```

### Problem: Can't access http://localhost:3000

**Checklist:**

1. ✅ Is Docker running? (`docker ps` should show containers)
2. ✅ Is the gateway container up? (`docker ps | grep gateway`)
3. ✅ Are you using the right port? (Check `docker-compose.yml`)
4. ✅ Did you wait for the service to start? (Takes 5-10 seconds)

**Try these:**

```bash
# View logs
docker logs gateway

# Check if service is ready
docker exec gateway curl http://localhost:3000

# Restart the service
docker-compose restart gateway
```

### Problem: API returns errors

**Check the logs:**

```bash
docker logs gateway
```

**Common issues:**

- Docker socket not accessible
- Network configuration wrong
- Missing environment variables

**Solution:**

```bash
# Inspect the network
docker network ls
docker network inspect ctf_network

# Restart all services
docker-compose down
docker-compose up -d
```

---

## Next Steps

Once everything is set up:

1. **Read the README.md** - Understand what the challenges are
2. **Try the Challenges** - Solve ping_me and the_endpoint
3. **Create a Challenge** - Follow the Development section in README.md
4. **Customize** - Modify flags, ports, and settings for your needs

---

## Getting Help

**If you get stuck:**

1. Check the [Troubleshooting](#troubleshooting) section above
2. View the logs: `docker-compose logs`
3. Try rebuilding: `docker-compose build --no-cache`
4. Restart Docker and try again

**Common Commands Reference:**

```bash
# Start the platform
docker-compose up -d

# Stop the platform
docker-compose down

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Rebuild
docker-compose build

# Clean rebuild
docker-compose build --no-cache

# Full reset
docker-compose down
docker system prune -a
docker-compose build
docker-compose up -d
```

---

## System Requirements

- **Minimum RAM**: 2GB free
- **Minimum Disk**: 1GB free for Docker images
- **Internet**: Required for initial setup (downloading images)
- **OS**: Windows 10+, macOS 10.15+, or modern Linux

---

**Happy hacking! 🚩**
