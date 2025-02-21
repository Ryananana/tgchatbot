// -----------------------
// Global constants & commands
// -----------------------
const TOKEN = ENV_BOT_TOKEN;
const WEBHOOK = '/endpoint';
const SECRET = ENV_BOT_SECRET;
const ADMIN_UID = ENV_ADMIN_UID;
// KV namespace for state storage
const KV_NAMESPACE = tgchatbot;

// Key prefixes for KV storage
const LAST_USER_KEY = 'last_user';
const USER_MESSAGES_KEY_PREFIX = 'user_message_';
const ADMIN_RESPONSES_KEY_PREFIX = 'admin_response_';

// Define commands for admin and guest users.
const commands = {
  admin: [
    { command: 'help', description: '显示帮助信息' },
    { command: 'block', description: '屏蔽用户 (回复消息或输入用户ID)' },
    { command: 'unblock', description: '解除屏蔽 (回复消息或输入用户ID)' },
    { command: 'info', description: '查看用户信息' },
    { command: 'list', description: '列出所有用户' },
    { command: 'clean', description: '清理无效用户数据' },
    { command: 'status', description: '显示统计信息' }
  ],
  guest: [
    { command: 'start', description: '开始使用机器人' },
    { command: 'help', description: '显示帮助信息' },
    { command: 'uid', description: '获取你的用户ID' }
  ]
};

// -----------------------
// Utility functions
// -----------------------
function apiUrl(methodName) {
  return `https://api.telegram.org/bot${TOKEN}/${methodName}`;
}

async function sendMessage(chatId, text, options = {}) {
  // Send message with optional parameters.
  const params = { chat_id: chatId, text, parse_mode: 'HTML', ...options };
  const response = await fetch(apiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

async function sendPlainText(chatId, text) {
  // Send plain text message.
  const response = await fetch(apiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  return response.json();
}

async function sendSticker(chatId, fileId) {
  // Send sticker.
  const response = await fetch(apiUrl('sendSticker'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, sticker: fileId })
  });
  return response.json();
}

async function sendPhoto(chatId, fileId, caption = '') {
  // Send photo with optional caption.
  const response = await fetch(apiUrl('sendPhoto'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: fileId, caption })
  });
  return response.json();
}

async function sendVoice(chatId, fileId) {
  // Send voice message.
  const response = await fetch(apiUrl('sendVoice'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, voice: fileId })
  });
  return response.json();
}

async function sendDocument(chatId, fileId) {
  // Send document.
  const response = await fetch(apiUrl('sendDocument'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, document: fileId })
  });
  return response.json();
}

async function sendVideo(chatId, fileId) {
  // Send video.
  const response = await fetch(apiUrl('sendVideo'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, video: fileId })
  });
  return response.json();
}

async function sendLocation(chatId, latitude, longitude) {
  // Send location message.
  const response = await fetch(apiUrl('sendLocation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, latitude, longitude })
  });
  return response.json();
}

async function deleteMessage(chatId, messageId) {
  // Delete a specified message.
  const response = await fetch(apiUrl('deleteMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  });
  return response.json();
}

// -----------------------
// Message processing functions
// -----------------------
async function handleUid(message) {
  await deleteMessage(message.chat.id, message.message_id);
  // Reply with the user's ID.
  const userId = message.from.id;
  const responseText = `Your user ID is: ${userId}`;
  await sendPlainText(message.chat.id, responseText);
}

async function handleUserMessage(message, userName) {
  let userMessageText = '';
  let response = null;
  
  if (message.photo) {
    const photo = message.photo[message.photo.length - 1];
    userMessageText = `Photo received: ${photo.file_id}`;
    response = await sendPhoto(ADMIN_UID, photo.file_id, `Photo from ${userName}`);
  } else if (message.sticker) {
    userMessageText = `Sticker received: ${message.sticker.file_id}`;
    response = await sendSticker(ADMIN_UID, message.sticker.file_id);
  } else if (message.voice) {
    userMessageText = `Voice message received: ${message.voice.file_id}`;
    response = await sendVoice(ADMIN_UID, message.voice.file_id);
  } else if (message.document) {
    userMessageText = `Document received: ${message.document.file_id}`;
    response = await sendDocument(ADMIN_UID, message.document.file_id);
  } else if (message.video) {
    userMessageText = `Video received: ${message.video.file_id}`;
    response = await sendVideo(ADMIN_UID, message.video.file_id);
  } else if (message.location) {
    userMessageText = `Location received: lat ${message.location.latitude}, lon ${message.location.longitude}`;
    response = await sendLocation(ADMIN_UID, message.location.latitude, message.location.longitude);
  } else {
    const text = message.text || 'Non-text message';
    userMessageText = text;
    response = await sendPlainText(ADMIN_UID, `Message from ${userName}:\n${text}`);
  }
  
  if (response && response.result && response.result.message_id) {
    await KV_NAMESPACE.put(`admin_message_${response.result.message_id}`, message.chat.id.toString());
  }
  await KV_NAMESPACE.put(`${USER_MESSAGES_KEY_PREFIX}${message.chat.id}`, userMessageText);
  await KV_NAMESPACE.put(LAST_USER_KEY, message.chat.id.toString());
}

async function handleAdminCommand(message, threadId = null) {
  try {
    const text = message.text || "";
    const args = text.split(' ').slice(1);
    const command = text.split(' ')[0].toLowerCase();

    try {
      await deleteMessage(message.chat.id, message.message_id);
    } catch (error) {
      console.error('Failed to delete admin command message:', error);
    }
    
    switch (command) {
      case '/help': {
        const helpText = "Admin commands:\n" + commands.admin.map(cmd => `/${cmd.command} - ${cmd.description}`).join('\n');
        await sendMessage(message.chat.id, helpText, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/block': {
          let userId = args[0];
          if (!userId && message.reply_to_message) {
            userId = await KV_NAMESPACE.get(`admin_message_${message.reply_to_message.message_id}`);
          }
          if (!userId) {
            await sendMessage(message.chat.id, 'Specify user ID or reply to a user message', threadId ? { message_thread_id: threadId } : {});
            break;
          }
          if (await KV_NAMESPACE.get(`block:${userId}`)) {
            await sendMessage(message.chat.id, `User ${userId} is already blocked`, threadId ? { message_thread_id: threadId } : {});
            break;
          }
          await KV_NAMESPACE.put(`block:${userId}`, 'true');
          await sendMessage(message.chat.id, `User ${userId} blocked`, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/unblock': {
          let userId = args[0];
          if (!userId && message.reply_to_message) {
            userId = await KV_NAMESPACE.get(`admin_message_${message.reply_to_message.message_id}`);
          }
          if (!userId) {
            await sendMessage(message.chat.id, 'Specify user ID or reply to a user message', threadId ? { message_thread_id: threadId } : {});
            break;
          }
          if (!await KV_NAMESPACE.get(`block:${userId}`)) {
            await sendMessage(message.chat.id, `User ${userId} is not blocked`, threadId ? { message_thread_id: threadId } : {});
            break;
          }
          await KV_NAMESPACE.delete(`block:${userId}`);
          await sendMessage(message.chat.id, `User ${userId} unblocked`, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/info': {
          let targetId = args[0];
          if (!targetId && message.reply_to_message) {
            targetId = await KV_NAMESPACE.get(`admin_message_${message.reply_to_message.message_id}`);
          }
          if (!targetId) {
            await sendMessage(message.chat.id, 'Specify user ID or reply to a user message', threadId ? { message_thread_id: threadId } : {});
            break;
          }
          const isBlocked = await KV_NAMESPACE.get(`block:${targetId}`);
          const infoText = `User Info:\nID: ${targetId}\nStatus: ${isBlocked ? 'Blocked' : 'Active'}`;
          await sendMessage(message.chat.id, infoText, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/list': {
          const listData = await KV_NAMESPACE.list();
          let userText = 'User List:\n';
          let count = 0;
          for (const key of listData.keys) {
            if (!key.name.includes(':')) {
              const status = await KV_NAMESPACE.get(`block:${key.name}`) ? 'Blocked' : 'Active';
              userText += `ID: ${key.name} - ${status}\n`;
              count++;
            }
          }
          userText += `\nTotal: ${count} users`;
          await sendMessage(message.chat.id, userText, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/clean': {
          const listData = await KV_NAMESPACE.list();
          let cleanCount = 0;
          for (const key of listData.keys) {
            if (!key.name.includes(':')) {
              try {
                const testMsg = await sendMessage(ADMIN_UID, 'Test message');
                if (!testMsg.ok) {
                  await KV_NAMESPACE.delete(key.name);
                  cleanCount++;
                }
              } catch (error) {
                await KV_NAMESPACE.delete(key.name);
                cleanCount++;
              }
            }
          }
          await sendMessage(message.chat.id, `Cleaned: ${cleanCount} invalid user entries`, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/status': {
          const listData = await KV_NAMESPACE.list();
          let total = 0, blockedCount = 0;
          for (const key of listData.keys) {
            if (!key.name.includes(':')) {
              total++;
              if (await KV_NAMESPACE.get(`block:${key.name}`)) blockedCount++;
            }
          }
          await sendMessage(message.chat.id, `Stats:\nTotal: ${total}\nBlocked: ${blockedCount}\nActive: ${total - blockedCount}`, threadId ? { message_thread_id: threadId } : {});
      } break;
      case '/start': // Fallback for guest command.
          await sendMessage(message.chat.id, 'Welcome! Send a message to contact the admin.', threadId ? { message_thread_id: threadId } : {});
          break;
      default:
          await sendMessage(message.chat.id, `Unknown command: ${command}`, threadId ? { message_thread_id: threadId } : {});
          break;
    }
  } catch (error) {
    console.error('Admin command error:', error);
    await sendMessage(message.chat.id, `Command failed: ${error.message}`, threadId ? { message_thread_id: threadId } : {});
  }
}

async function handleAdminReply(message) {
  // Forward admin's reply back to the originating user.
  try {
    const threadId = message.message_thread_id;
    if (!threadId) return;
    const listData = await KV_NAMESPACE.list();
    let userId = null;
    for (const key of listData.keys) {
      if (!key.name.includes(':')) {
        const value = await KV_NAMESPACE.get(key.name);
        if (value === threadId.toString()) {
          userId = key.name;
          break;
        }
      }
    }
    if (!userId) {
      await sendMessage(ADMIN_UID, 'Unable to determine reply target');
      return;
    }
    let result;
    if (message.text) {
      result = await sendPlainText(userId, message.text);
    } else if (message.photo) {
      const photo = message.photo[message.photo.length - 1].file_id;
      result = await sendPhoto(userId, photo, message.caption || '');
    } else if (message.document) {
      result = await sendDocument(userId, message.document.file_id);
    } else if (message.video) {
      result = await sendVideo(userId, message.video.file_id);
    } else if (message.voice) {
      result = await sendVoice(userId, message.voice.file_id);
    } else if (message.sticker) {
      result = await sendSticker(userId, message.sticker.file_id);
    } else {
      result = await sendPlainText(userId, 'Non-text reply received');
    }
    if (!result || !result.ok) {
      throw new Error(result?.description || 'Failed to send reply');
    }
  } catch (error) {
    console.error('Admin reply error:', error);
    await sendMessage(ADMIN_UID, `Reply failed: ${error.message}`);
  }
}

async function handleGuestCommand(message) {
  const command = message.text.trim().split(' ')[0].toLowerCase();
  switch (command) {
    case '/help': {
        const helpText = "Guest commands:\n" + commands.guest.map(cmd => `/${cmd.command} - ${cmd.description}`).join('\n');
        await sendMessage(message.chat.id, helpText);
    } break;
    case '/start':
        await sendMessage(message.chat.id, 'Welcome! Send a message to contact the admin.');
        break;
    default:
        await sendMessage(message.chat.id, `Unknown guest command: ${command}`);
        break;
  }
}

async function onMessage(message) {
  const chatId = message.chat.id;
  const userName = message.from.username ? `@${message.from.username}` : message.from.first_name;
  
  if (message.text) {
    const trimmed = message.text.trim();
    if (trimmed === '/uid') {
      await handleUid(message);
      return;
    }
    if (trimmed === '/help' || trimmed === '/start') {
      if (chatId == ADMIN_UID) {
        await handleAdminCommand(message);
      } else {
        await handleGuestCommand(message);
      }
      return;
    }
  }
  
  if (chatId == ADMIN_UID) {
    if (message.text && message.text.startsWith('/')) {
      await handleAdminCommand(message);
    } else if (message.reply_to_message) {
      await handleAdminReply(message);
    }
  } else {
    await handleUserMessage(message, userName);
  }
}

async function onUpdate(update) {
  // Process update if it is a message.
  if ('message' in update) {
    await onMessage(update.message);
  }
}

// -----------------------
// Webhook registration functions
// -----------------------
async function registerWebhook(event, requestUrl, suffix, secret) {
  // Register webhook with Telegram.
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`;
  const response = await fetch(apiUrl('setWebhook'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, secret_token: secret })
  });
  const result = await response.json();
  return new Response(result.ok ? 'Ok' : JSON.stringify(result, null, 2));
}

async function unRegisterWebhook(event) {
  // Unregister webhook.
  const response = await fetch(apiUrl('setWebhook'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '' })
  });
  const result = await response.json();
  return new Response(result.ok ? 'Ok' : JSON.stringify(result, null, 2));
}

// -----------------------
// Main event listener & webhook handler
// -----------------------
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event));
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET));
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event));
  } else {
    event.respondWith(new Response('No handler for this request'));
  }
});

async function handleWebhook(event) {
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 });
  }
  const update = await event.request.json();
  event.waitUntil(onUpdate(update));
  return new Response('Ok');
}