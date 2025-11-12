# For backend
```
cd backend
```

## Build docker file
```
docker build -t myapp .
```

## Run
```
docker run --rm -it -p 8000:8000 myapp
```

# For frontend
```
cd backend
```

## Install Vite plugin
```
npm install tailwindcss @tailwindcss/vite
```

## Run
```
npm run dev
```

## For testing purpose
Access this follow link: http://localhost:5173/