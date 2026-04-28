# Deploying Car Images to the Backend Server

The car model images are served as static files from the backend server at:
```
http://91.107.161.67:3000/static/cars/{brand}/{model}.webp
```

## Directory Structure

Images must be placed in `C:\QarajGM\Backend\car-images\` on the server:

```
C:\QarajGM\Backend\car-images\
├── byd\
│   ├── atto-3.webp
│   ├── denza-d9.webp
│   └── ...
├── ford\
│   ├── bronco.webp
│   └── ...
├── honda\
│   ├── accord.webp
│   ├── civic.webp
│   └── ...
├── mazda\
├── mitsubishi\
├── subaru\
└── toyota\
```

## First-Time Setup

From the server (RDP or command prompt):

```bash
cd C:\QarajGM\repo
git pull origin main

# Copy images from repo to backend working directory
xcopy /E /Y expo\assets\car-images\* C:\QarajGM\Backend\car-images\

# Also copy updated backend code
xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\

# Restart the API
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

## Updating Images

To update a specific car image:

1. Replace the `.webp` file in `C:\QarajGM\Backend\car-images\{brand}\{model}.webp`
2. No server restart needed — images are served directly from the filesystem
3. Client apps will refresh the image after their 30-day cache expires (or on app reinstall)

## Image Specifications

- **Format**: WebP
- **Width**: 800px
- **Average size**: ~80 KB per image
- **Total**: 109 images across 7 brands (~8.5 MB)
- **Cache-Control**: `public, max-age=2592000` (30 days)

## Adding New Models

1. Save the new image as `{model-slug}.webp` (lowercase, hyphens for spaces) in the appropriate brand folder
2. Update `expo/constants/carImages.ts` to include the new entry
3. Rebuild the mobile app
4. Copy the image to the server's `car-images` directory

## Troubleshooting

- **404 on image**: Check that the filename matches exactly (case-sensitive on Linux, case-insensitive on Windows)
- **Images not loading in app**: Verify the server is running and `http://91.107.161.67:3000/static/cars/toyota/corolla.webp` returns an image
- **Stale images on device**: Clear app cache or wait for the 30-day cache to expire
