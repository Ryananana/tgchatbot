# Telegram 聊天转发机器人 / Telegram Chat Forwarding Bot

该项目使用 Cloudflare Worker 实现了一个 Telegram 聊天转发机器人，将用户消息转发给管理员，并支持管理员通过命令处理用户消息。  
This project uses Cloudflare Workers to implement a Telegram bot that forwards user messages to an administrator and allows command-based handling by the admin.

## 功能 / Features

- 用户消息转发：支持文本、图片、视频、语音、文件、地理位置等多种消息转发；  
  User message forwarding: supports forwarding texts, photos, videos, voice, documents, location, etc.
- 管理员命令：支持 /help、/block、/unblock、/info、/list、/clean、/status 命令；  
  Admin commands: supports /help, /block, /unblock, /info, /list, /clean, /status.
- 用户指令：支持 /start、/help、/uid 等指令供普通用户使用；  
  Guest commands: supports /start, /help, /uid for regular users.
- Webhook 注册：支持注册和注销 Telegram Webhook；  
  Webhook registration: allows setting and clearing the Telegram webhook.
- KV 存储：使用 Cloudflare Workers KV 储存用户状态和消息映射。  
  KV storage: uses Cloudflare Workers KV to store user statuses and message mappings.

## 环境变量 / Environment Variables

- ENV_BOT_TOKEN：Telegram Bot Token  
- ENV_BOT_SECRET：Webhook secret token  
- ENV_ADMIN_UID：管理员 Telegram 用户 ID / Admin Telegram User ID  
- tgchatbot：Cloudflare Workers KV 命名空间 / Cloudflare Workers KV namespace

## 部署 / Deployment

1. 配置上述环境变量。 / Configure the above environment variables.  
2. 部署代码到 Cloudflare Workers。 / Deploy the code to Cloudflare Workers.  
3. 访问 `/registerWebhook` 路径注册 Webhook。 / Visit the `/registerWebhook` endpoint to register the webhook.

## 使用方法 / Usage

- 普通用户 / Guest:
  - 使用 `/start` 开始对话 / Use `/start` to initiate a chat.
  - 使用 `/help` 获取帮助信息 / Use `/help` for assistance.
  - 使用 `/uid` 获取个人用户 ID / Use `/uid` to get your user ID.

- 管理员 / Administrator:
  - 使用 `/help` 获取管理员命令列表 / Use `/help` to view admin commands.
  - 可回复用户消息以将回复内容发送给对应用户 / Reply to a user message to send a response.
  - 使用 `/block` 和 `/unblock` 命令管理用户状态 / Use `/block` and `/unblock` to manage user status.

## 注意事项 / Notes

请确保 Webhook secret token 配置正确，以防止未授权请求。  
Ensure the Webhook secret token is correctly configured to prevent unauthorized requests.

## furthur questions / 进一步问题

**English:** Further questions: tg @chatwithmor_bot  
**中文:** 进一步问题请联系: tg @chatwithmor_bot
