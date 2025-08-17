from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import httpx
from typing import Any

from parsing import (
    get_api_url,
    convert_timestamp,
    calculate_risk_level,
    calculate_frequency_per_day,
    post_with_retry,
    fetch_group_data,
    fetch_chat_messages,
    fetch_contact_info,
    count_all_messages
)
from config import settings

router = APIRouter()

@router.get("/api/chats", response_class=JSONResponse)
async def api_chats(field: str = None, order: str = None):
    try:
        async with httpx.AsyncClient() as client:
            chats_url = get_api_url("/getChats")
            resp = await post_with_retry(client, chats_url, {
                "page": 0, "count": 20, "sortOrder": "desc"
            })
            if resp.status_code != 200:
                raise HTTPException(500, "Error fetching chats")

            raw_chats = resp.json()
            group_chats = []
            for chat in raw_chats:
                if (isinstance(chat, dict)
                    and "id" in chat
                    and "@g.us" in chat["id"]
                    and chat.get("notSpam", False)):
                    group_chats.append(chat)

            processed = []
            for raw_c in group_chats:
                chat_id = raw_c["id"]
                info = await fetch_group_data(client, chat_id)

                participants_count = info.get("participantsCount", 0)
                messages_count = info.get("messagesCount", 0)
                freq = calculate_frequency_per_day(info)

                last_ts = raw_c.get("lastMessageTime")
                last_activity = convert_timestamp(last_ts)
                risk_level = calculate_risk_level(messages_count)

                chat_name = (info.get("subject")
                             or raw_c.get("subject")
                             or info.get("name")
                             or raw_c.get("name")
                             or f"Chat {chat_id}")

                processed.append({
                    "id": chat_id,
                    "name": chat_name,
                    "participants_count": participants_count,
                    "messages_count": messages_count,
                    "message_frequency": freq,
                    "last_activity": last_activity,
                    "risk_level": risk_level
                })

            if field and field in ["participants_count", "risk_level"]:
                reverse = (order == "desc")
                processed.sort(key=lambda x: x.get(field, 0), reverse=reverse)

            return JSONResponse(processed)

    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/api/summary", response_class=JSONResponse)
async def api_summary():
    try:
        async with httpx.AsyncClient() as client:
            chats_url = get_api_url("/getChats")
            response = await post_with_retry(client, chats_url, {
                "page": 0,
                "count": 20,
                "sortOrder": "desc"
            })
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Error fetching summary")

            raw_chats = response.json()
            group_chats = []
            for chat in raw_chats:
                if (isinstance(chat, dict)
                    and "id" in chat
                    and "@g.us" in chat["id"]
                    and chat.get("notSpam", False)):
                    group_chats.append(chat)

            total_chats = len(group_chats)
            total_messages = 0
            high_risk = 0

            tasks = [fetch_group_data(client, c["id"]) for c in group_chats]
            chats_info = await asyncio.gather(*tasks)
            for info in chats_info:
                msgs = int(info.get("messagesCount", 0)) if isinstance(info, dict) else 0
                total_messages += msgs
                if calculate_risk_level(msgs) == "High":
                    high_risk += 1
            return JSONResponse(content={
                "accountNumber": settings.INSTANCE_ID,
                "total_chats": total_chats,
                "total_messages": total_messages,
                "high_risk": high_risk
            })
    except Exception as e:
        return JSONResponse(content={
            "accountNumber": "Error",
            "total_chats": 0,
            "total_messages": 0,
            "high_risk": 0
        })


@router.get("/api/chat_info/{chat_id}", response_class=JSONResponse)
async def api_chat_info(chat_id: str):
    try:
        async with httpx.AsyncClient() as client:
            if "@g.us" in chat_id:
                info = await fetch_group_data(client, chat_id)
                contact_data = {}
            else:
                info = {"lastMessageTime": 0, "messagesCount": 0}
                contact_data = await fetch_contact_info(client, chat_id)

        try:
            messages_count = int(info.get("messagesCount", 0))
        except:
            messages_count = 0

        frequency = calculate_frequency_per_day(info)
        risk_level = calculate_risk_level(messages_count)
        last_message_time = info.get("lastMessageTime", info.get("creation", 0))

        if "@g.us" in chat_id:
            processed_chat = {
                "id": chat_id,
                "chat_name": info.get("subject", "N/A"),
                "messages": messages_count,
                "frequency": frequency,
                "last_activity": convert_timestamp(last_message_time),
                "risk_level": risk_level,
                "participants": info.get("participants", []),
                "admin_rights": "N/A"
            }
        else:
            processed_chat = {
                "id": chat_id,
                "phone": contact_data.get("phone", "N/A"),
                "profile_name": contact_data.get("name", "N/A"),
                "contact_name": contact_data.get("contactName", "N/A"),
                "admin_rights": "Да" if contact_data.get("isAdmin") else "Нет",
                "messages": messages_count,
                "frequency": frequency,
                "last_activity": convert_timestamp(last_message_time),
                "risk_level": risk_level,
            }

        return JSONResponse(content=processed_chat)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/chat_messages/{chat_id}", response_class=JSONResponse)
async def api_chat_messages(chat_id: str):
    try:
        async with httpx.AsyncClient() as client:
            messages = await fetch_chat_messages(client, chat_id)
        return JSONResponse(content=messages)
    except Exception as e:
        return JSONResponse(content=[])


@router.get("/api/contact_info/{participant_id}", response_class=JSONResponse)
async def api_contact_info(participant_id: str):
    try:
        async with httpx.AsyncClient() as client:
            contact_data = await fetch_contact_info(client, participant_id)
        
            if "@g.us" not in participant_id:
                total_messages = await count_all_messages(client, participant_id)
                contact_data["messagesCount"] = total_messages

                chat_history = await fetch_chat_messages(client, participant_id)
                if chat_history:
                    last_ts = max(msg.get("timestamp", 0) for msg in chat_history)
                else:
                    last_ts = 0
                contact_data["lastActivity"] = convert_timestamp(last_ts)

                risk_level = calculate_risk_level(total_messages)
                contact_data["riskLevel"] = risk_level
            else:
                contact_data["messagesCount"] = 0
                contact_data["lastActivity"] = "N/A"
                contact_data["riskLevel"] = "N/A"

        return JSONResponse(contact_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))