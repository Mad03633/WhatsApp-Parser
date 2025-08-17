from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from queries.orm import insert_data, select_chats, select_chat_info
from endpoints import router as api_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, port=8003)
