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
GROQ_API_KEY=real_key
```
Then run this command to copy that file to your docker image:
```
docker cp path-to-your-root-folder\backend\.env mycontainer:/app/.env     
```

# For frontend
```
cd frontend
```

## Installation
Run the following command to install Vite plugin:
```
npm install tailwindcss @tailwindcss/vite
```
Run the following command to install dependencies (if needed)
```
npm install 
```
If your install ever breaks:
```
rm -rf node_modules package-lock.json
npm install 
```
Run the following commands to install leaflet and react-leaflet for OpenStreetMap API:
```
npm install react-leaflet@4.0.0
npm install --save-dev @types/leaflet
```
Run the following commands to install Polyline to draw optimal route using OSRM:
```
npm install @mapbox/polyline
```
## Download images
Download images in the following [link](https://drive.google.com/file/d/1xxUfasr8J5LGjvUezsKU1snX9a4FTarp/view?usp=sharing) and put them in ```frontend/src/assets/```

## Run
```
npm run dev
```

## For testing purposes
Access the following link: http://localhost:5173/

# AI models
In this project we using AI models for returning structured output from Groq. Access [website](https://console.groq.com/home) to create an API key and let your journey begins:
```
openai/gpt-oss-20b
openai/gpt-oss-120b
openai/gpt-oss-safeguard-20b
moonshotai/kimi-k2-instruct-0905
meta-llama/llama-4-maverick-17b-128e-instruct
meta-llama/llama-4-scout-17b-16e-instruct
```