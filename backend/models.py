from pydantic import BaseModel
from sqlalchemy import Table, Column, MetaData, Integer, String
from database import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import MetaData
from datetime import datetime

class ChatSchema(BaseModel):
    id: int
    name: str
    photo: str
    participants_count: int
    messages_count: int
    message_frequency: int
    last_activity: datetime
    risk_level: float

    class Config:
        orm_mode = True
        from_attributes = True

class ChatInfoSchema(BaseModel):
    id: int
    chat_id: int
    phone_number: str
    profile_name: str
    contact_name: str
    permissions: str
    messages_count: int
    message_frequency: int
    last_activity: datetime
    risk_level: float

    class Config:
        orm_mode = True
        from_attributes = True

class Chats(Base):
    __tablename__ = 'chats'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    photo: Mapped[str]
    participants_count: Mapped[int]
    messages_count: Mapped[int]
    message_frequency: Mapped[int]
    last_activity: Mapped[datetime]
    risk_level: Mapped[float]

class ChatInfo(Base):
    __tablename__ = 'chat_info'

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int]  
    phone_number: Mapped[str]  
    profile_name: Mapped[str]  
    contact_name: Mapped[str]  
    permissions: Mapped[str]  
    messages_count: Mapped[int]  
    message_frequency: Mapped[int]  
    last_activity: Mapped[datetime]  
    risk_level: Mapped[float]  




metadata_obj = MetaData()

