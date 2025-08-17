import asyncio
import httpx
import logging
from datetime import datetime
from typing import Dict, Any, List
from config import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO) 

API_CONFIG = {
    "endpoints": {
        "chats": "/getChats",
        "group_data": "/getGroupData",
        "chat_messages": "/getChatHistory",
        "contact_info": "/getContactInfo"
    }
}

def get_api_url(endpoint: str) -> str:
    return f"{settings.BASE_URL}/waInstance{settings.INSTANCE_ID}{endpoint}/{settings.TOKEN}"

def convert_timestamp(timestamp) -> str:
    if not timestamp:
        return "No data"
    try:
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime("%d.%m.%Y %H:%M")
    except Exception:
        return "Date error"

def calculate_risk_level(messages_count: int) -> str:
    if messages_count > 1000:
        return "High"
    elif messages_count > 500:
        return "Medium"
    return "Low"

def calculate_frequency_per_day(chat_info: Dict[str, Any]) -> str:
    try:
        messages_count = int(chat_info.get("messagesCount", 0))
        creation_ts = chat_info.get("creation", 0)
        if not creation_ts:
            return "N/A"
        creation_dt = datetime.fromtimestamp(creation_ts)
        now = datetime.now()
        diff_days = (now - creation_dt).days
        if diff_days < 1:
            return "N/A"
        freq = round(messages_count / diff_days, 2)
        return str(freq)
    except Exception:
        return "N/A"

async def post_with_retry(
    client: httpx.AsyncClient,
    url: str,
    payload: dict,
    retries: int = 5,
    delay: int = 5
) -> httpx.Response:
    for attempt in range(retries):
        response = await client.post(url, json=payload)
        if response.status_code == 429:
            logger.info(
                f"Received 429 for {url}. "
                f"Attempt {attempt+1} of {retries}. Retrying after {delay} sec."
            )
            await asyncio.sleep(delay)
            continue
        return response
    return response

async def count_all_messages(client: httpx.AsyncClient, chat_id: str) -> int:
    url = get_api_url(API_CONFIG["endpoints"]["chat_messages"])
    payload = {
        "chatId": chat_id,
        "count": 2000 
    }

    response = await post_with_retry(client, url, payload)
    if response.status_code != 200:
        logger.error(
            f"[count_all_messages] chat_id={chat_id}, "
            f"status={response.status_code}, text={response.text}"
        )
        return 0

    messages = response.json()
    if not isinstance(messages, list):
        logger.error(f"[count_all_messages] Unexpected response format: {messages}")
        return 0

    return len(messages)

async def fetch_group_data(client: httpx.AsyncClient, group_id: str) -> Dict[str, Any]:
    try:
        await asyncio.sleep(1.5)
        url = get_api_url(API_CONFIG["endpoints"]["group_data"])
        response = await post_with_retry(client, url, {"groupId": group_id})
        if response.status_code != 200:
            logger.error(f"[fetch_group_data] group_id={group_id}, status={response.status_code}, text={response.text}")
            return {"participantsCount": 0, "messagesCount": 0, "participants": []}

        data = response.json()
        logger.info(f"[fetch_group_data] group data for {group_id}: {data}")

        participants_list = data.get("participants") or data.get("members") or data.get("users") or []
        if not isinstance(participants_list, list):
            participants_list = []

        data["participantsCount"] = len(participants_list)
        data["participants"] = participants_list


        if not data.get("messagesCount"):
            data["messagesCount"] = await count_all_messages(client, group_id)
        return data
    except Exception as e:
        logger.error(f"[fetch_group_data] Error for {group_id}: {type(e)} {str(e)}")
        return {
            "participantsCount": 0,
            "messagesCount": 0,
            "participants": []
        }

async def fetch_chat_messages(client: httpx.AsyncClient, chat_id: str) -> List[Any]:
    try:
        url = get_api_url(API_CONFIG["endpoints"]["chat_messages"])
        payload = {"chatId": chat_id, "count": 2000}

        resp = await post_with_retry(client, url, payload)
        if resp.status_code == 466:
            logger.error("[fetch_chat_messages] Monthly quota exceeded for getChatHistory")
            return []
        if resp.status_code != 200:
            logger.error(f"[fetch_chat_messages] Error: {resp.status_code} - {resp.text}")
            return []

        data = resp.json()
        for msg in data:
            if "timestamp" in msg:
                msg["time"] = convert_timestamp(msg["timestamp"])
            if "senderId" in msg:
                msg["sender"] = msg["senderId"].replace("@c.us", "")
            if "textMessage" in msg:
                msg["text"] = msg["textMessage"]
        return data
    except Exception as e:
        logger.error(f"[fetch_chat_messages] Error for {chat_id}: {e}")
        return []

async def fetch_contact_info(client: httpx.AsyncClient, chat_id: str) -> Dict[str, Any]:
    try:
        if "@g.us" in chat_id:
            return {}
        url = get_api_url(API_CONFIG["endpoints"]["contact_info"])
        payload = {"chatId": chat_id}

        resp = await post_with_retry(client, url, payload)
        if resp.status_code != 200:
            logger.error(f"[fetch_contact_info] chat_id={chat_id}, status={resp.status_code}, text={resp.text}")
            return {}

        return resp.json()

    except Exception as e:
        logger.error(f"[fetch_contact_info] Error for {chat_id}: {type(e)} {str(e)}")
        return {}