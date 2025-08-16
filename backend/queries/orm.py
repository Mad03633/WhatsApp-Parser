from sqlalchemy import select, update, desc, asc
from database import session_factory, sync_engine, async_engine
from models import Chats, ChatSchema, ChatInfo, ChatInfoSchema

def insert_data():
    worker_bobr = Chats(worker_name='Bobr', worker_year='24')
    with session_factory() as session:
        session.add(worker_bobr)
        session.commit()

def select_chats(field: str, order: str):
    with session_factory() as session:
        sorting = desc(getattr(Chats, field)) if order == 'desc' else asc(getattr(Chats, field))
        query = select(Chats).order_by(sorting)
        result = session.execute(query)
        chats = result.scalars().all()

        return [ChatSchema.model_validate(chat).dict() for chat in chats]
    
def select_chat_info(value: int):
    with session_factory() as session:
        query = select(ChatInfo).where(ChatInfo.chat_id == value)
        result = session.execute(query)
        chats = result.scalars().all()

        return [ChatInfoSchema.model_validate(chat).dict() for chat in chats]

def update_data(worker_id: int, username: str):
    with session_factory() as session:
        query = session.get(Chats, worker_id)
        query.worker_name = username
        session.commit()