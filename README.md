# For backend
```
cd backend
```

## Build Dockerfile
```
docker build -t myapp .
```

## Run
```
docker run --rm -it -p 8000:8000 myapp
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

## Run
```
npm run dev
```

## For testing purposes
Access the following link: http://localhost:5173/
