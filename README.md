# WhatsApp - Parser

**Web App** with fetching, analyzing and storing WhatsApp chat data. It connects to **Green API** calculates message statistics, risk levels, and frequencies for both group chats and individuals.

## Features

- Integration with **Green API** (`getChats`, `getGroupData`, `getChatHistory`, `getContactInfo`)
- Filter group chats by `@g.us` chats only
- Risk scoring based on message volume
- Pagination and sorting support

## Registration

Green API credentials can be obtained by registering at [**green-api.com**](https://green-api.com/) and creating a new instance for WhatsApp.

## API Endpoints

| Method   | Endpoint                    | Description                    |
| -------- | ----------------------------| -------------------------------|
| GET      | /api/chats                  | List group chats with analytics|
| GET      | /api/summary                | Summary statistics for account |
| GET      | /api/chat_info/{chat_id}    | Detailed info about one chat   |
| GET      | /api/chat_messages/{chat_id}| Retrieve message history       |
| GET      | /api/contact_info/{user_id} | Detailed info about one contact|


