# For backend
```
cd backend
```

## Build Dockerfile
```
docker build -t myapp .
```

## Run to save database through devices:
```
docker run --rm -it -p 8000:8000 -v path-to-your-root-directory\backend:/app myapp
```

## Run with API Key of Gemini:
Send me an email or sth like that to get the real key for testing purpose:
```
docker run --rm -it -p 8000:8000 -v path-to-your-root-directory\backend:/app -e GEMINI_API_KEY=real_key myapp
```

# For frontend
```
cd frontend
```

## Install Vite plugin
```
npm install tailwindcss @tailwindcss/vite
```

## Install dependencies (if needed)
```
npm install 
```

## If your install ever breaks:
```
rm -rf node_modules package-lock.json
npm install 
```

## Install leaflet and react-leaflet for OpenStreetMap API:
```
npm install react-leaflet@4.0.0
npm install --save-dev @types/leaflet
```

## Install Polyline to draw optimal route using OSRM:
```
npm install @mapbox/polyline
```

## Run
```
npm run dev
```

## For testing purposes
Access the following link: http://localhost:5173/
