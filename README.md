# Telegram Chat Forwarding Bot / Telegram 聊天转发机器人

This project uses Cloudflare Workers to implement a Telegram bot that forwards user messages to an administrator and allows command-based handling.  
该项目使用 Cloudflare Workers 实现 Telegram 聊天转发机器人，支持用户消息转发给管理员并允许管理员通过命令处理用户消息。

---

## Features / 功能

- **User Message Forwarding / 用户消息转发**  
  Supports forwarding texts, photos, videos, voice messages, documents, locations, etc.  
  支持文本、图片、视频、语音、文件、地理位置等多种消息转发。

- **Admin Commands / 管理员命令**  
  Supports `/help`, `/block`, `/unblock`, `/info`, `/list`, `/clean`, `/status`.  
  支持 `/help`、`/block`、`/unblock`、`/info`、`/list`、`/clean`、`/status`。

- **Guest Commands / 用户指令**  
  Supports `/start`, `/help`, `/uid`, etc.  
  支持 `/start`、`/help`、`/uid` 等指令。

- **Webhook Registration / Webhook 注册**  
  Allows setting and clearing the Telegram webhook.  
  支持注册和注销 Telegram Webhook。

- **KV Storage / KV 存储**  
  Uses Cloudflare Workers KV to store user statuses and message mappings.  
  使用 Cloudflare Workers KV 储存用户状态和消息映射。

---

## Environment Variables / 环境变量

- **ENV_BOT_TOKEN**: Telegram Bot Token  
  Telegram Bot Token: Telegram Bot Token
- **ENV_BOT_SECRET**: Webhook Secret Token  
  Webhook Secret Token: Webhook secret token
- **ENV_ADMIN_UID**: Admin Telegram User ID  
  Admin Telegram User ID: 管理员 Telegram 用户 ID
- **tgchatbot**: Cloudflare Workers KV Namespace  
  Cloudflare Workers KV Namespace: Cloudflare Workers KV 命名空间

---

## Deployment / 部署

1. Configure the above environment variables.  
   配置上述环境变量。
2. Deploy the code to Cloudflare Workers.  
   部署代码到 Cloudflare Workers。
3. Visit the `/registerWebhook` endpoint to register the webhook.  
   访问 `/registerWebhook` 路径注册 Webhook。

---

## Usage / 使用方法

### Guest (普通用户)
- Use `/start` to initiate a chat.  
  使用 `/start` 开始对话。
- Use `/help` for assistance.  
  使用 `/help` 获取帮助信息。
- Use `/uid` to get your user ID.  
  使用 `/uid` 获取个人用户 ID。

### Administrator (管理员)
- Use `/help` to view admin commands.  
  使用 `/help` 查看管理员命令列表。
- Reply to a user message to send a response.  
  回复用户消息将回复发送给对应用户。
- Use `/block` and `/unblock` to manage user statuses.  
  使用 `/block` 与 `/unblock` 管理用户状态。

---

## Notes / 注意事项

Ensure the Webhook secret token is correctly configured to prevent unauthorized requests.  
请确保 Webhook secret token 配置正确，以防止未授权请求。

---

## Further Questions / 进一步问题

- **English:** Further questions: tg @chatwithmor_bot  
  **中文:** 更多问题请联系: tg @chatwithmor_bot
