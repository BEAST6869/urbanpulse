# AI System Testing Guide

This guide will help you verify that the AI system is working correctly.

## 🧪 Test Levels

### Level 1: Structure Test (✅ Should Pass Now)
### Level 2: Backend Integration Test (⚠️ Partial - Needs MongoDB)  
### Level 3: Model Loading Test (❌ Needs Real Model)
### Level 4: Classification Test (❌ Needs Real Model)

---

## 📋 **Level 1: Structure Test**

Check if all required files and folders exist:

```powershell
# Check AI folder structure
tree C:\Users\mitta\urbanpulse\ai /f

# Verify key files exist
Test-Path "C:\Users\mitta\urbanpulse\ai\model\model.json"
Test-Path "C:\Users\mitta\urbanpulse\ai\model\model.bin"
Test-Path "C:\Users\mitta\urbanpulse\ai\README.md"
```

**Expected Result**: All should return `True` ✅

---

## 🚀 **Level 2: Backend Integration Test**

### Step 2.1: Start MongoDB (Required)
```powershell
# Option 1: Start MongoDB service
net start MongoDB

# Option 2: If MongoDB not installed, install it first:
# https://www.mongodb.com/try/download/community
```

### Step 2.2: Start Backend Server
```powershell
cd C:\Users\mitta\urbanpulse\backend
npm start
```

### Step 2.3: Test Health Endpoint
```powershell
# In a new terminal window:
curl http://localhost:5000/health
```

**Expected Result**: 
```json
{
  "status": "Server running",
  "model": "Model loading failed (placeholder files)",
  "database": "Connected"
}
```

---

## 🤖 **Level 3: Model Loading Test**

This requires a real trained model. The current placeholder files will fail.

### Quick Test with Placeholder:
```powershell
curl http://localhost:5000/model-info
```

**Expected Result**: Error message about model loading failure ⚠️

### For Real Model Testing:
1. Train a model using `ai/scripts/train.py`
2. Convert it using `ai/scripts/convert.py`
3. Replace placeholder files in `ai/model/`

---

## 📸 **Level 4: Classification Test**

Test image classification (requires real model):

### Test with curl:
```powershell
# Test with an image file
curl -X POST -F "image=@path/to/test-image.jpg" http://localhost:5000/classify
```

### Test with PowerShell:
```powershell
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = "C:\path\to\test-image.jpg"
$uri = "http://localhost:5000/classify"

$headers = @{
    'Content-Type' = "multipart/form-data; boundary=$boundary"
}

# This is a more complex test - use curl instead
```

**Expected Result (with real model)**:
```json
{
  "category": "pothole", 
  "confidence": "0.8534",
  "allPredictions": [
    {"category": "pothole", "confidence": "0.8534"},
    {"category": "garbage", "confidence": "0.1466"}
  ]
}
```

---

## 🔧 **Current Status Check**

Run this quick diagnostic:

```powershell
# 1. Check structure
Write-Host "=== Structure Check ===" -ForegroundColor Green
Test-Path "C:\Users\mitta\urbanpulse\ai\model\model.json"
Test-Path "C:\Users\mitta\urbanpulse\ai\model\model.bin"

# 2. Check backend dependencies
Write-Host "=== Backend Dependencies ===" -ForegroundColor Green
cd C:\Users\mitta\urbanpulse\backend
npm list --depth=0

# 3. Try to start server (will show detailed errors)
Write-Host "=== Server Test ===" -ForegroundColor Green
npm start
```

---

## 🎯 **What Should Work Now vs Later**

### ✅ **Works Now:**
- AI folder structure exists
- Backend can find model files
- Server starts (with warnings about placeholder model)
- Health endpoint responds
- File upload endpoint exists

### ⚠️ **Needs Setup:**
- MongoDB installation and connection
- Real model training and conversion

### ❌ **Won't Work Yet:**
- Actual image classification (needs real model)
- Model loading (placeholder files are invalid)

---

## 🚨 **Common Issues & Solutions**

### "MongoDB connection error"
```bash
# Install MongoDB Community Server
# https://www.mongodb.com/try/download/community

# Or start existing MongoDB service
net start MongoDB
```

### "Model loading failed"
```bash
# Expected with placeholder files
# Need to train real model or download pre-trained one
```

### "Port 5000 already in use"
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

---

## 🎉 **Success Criteria**

Your AI system setup is **working correctly** if:

1. ✅ All files exist in correct structure
2. ✅ Backend server starts without crashing  
3. ✅ `/health` endpoint responds
4. ✅ Server detects model files (even if invalid)
5. ⚠️ MongoDB connects (after installation)

The classification won't work until you have real trained models, but the **infrastructure is complete and functional**! 🎯
