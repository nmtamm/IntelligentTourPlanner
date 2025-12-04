# For backend
```
cd backend
```

## Build Dockerfile
```
docker build -t myapp .
```

## Run with a container name:
```
docker run --rm -it --name mycontainer -p 8000:8000 -v path-to-your-root-folder\backend:/app myapp
```

## Copy an environment file to docker image:
Create an ```.env``` file whose path is path-to-your-root-folder\backend\.env path to store the API key following this format:
```
SERP_API_KEY=real_key
GEMINI_API_KEY=real_key
FOURSQUARE_API_KEY=real_key
```
Then run this command to copy that file to your docker image:
```
docker cp path-to-your-root-folder\backend\.env mycontainer:/app/.env     
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
