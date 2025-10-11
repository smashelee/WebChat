from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import random
import glob
from datetime import datetime
from typing import Dict, List
import uuid
import asyncio
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="WebChat API", version="0.0.63")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/public", StaticFiles(directory="public"), name="public")

users: Dict[str, dict] = {}
users_by_name: Dict[str, dict] = {}
messages: List[dict] = []
group_name = "Группа"

ADMIN_USERNAMES = ['yurii_fisting', 'lovely', 'yogurt', 'valleriiaq', 'smashelee']
MODERATOR_USERNAMES = ['feka']
PREMIUM_USERNAMES = ['proz', 'Fedya_47']

ADMIN_PASSWORD = 'cul6768adm'
MODERATOR_PASSWORD = 'cul7686mod'

USER_UNLOCKED_SPECIAL_AVATARS = {
    'PROZ': ['Images/Avatars/Special/1.png', 'Images/Avatars/Special/10.png', 'Images/Avatars/Special/11.png'],
    'Fedya_47': ['Images/Avatars/Special/27.png', 'Images/Avatars/Special/42.png', 'Images/Avatars/Special/37.png'],
}

user_last_message_time: Dict[str, float] = {}
SPAM_PROTECTION_INTERVAL = 1.0

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.websocket_to_user: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        try:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            if websocket in self.websocket_to_user:
                user_id = self.websocket_to_user[websocket]
                if user_id in users:
                    user = users[user_id]
                    if user['isAdmin']:
                        print(f"💢 Администратор отключился: {user['username']}")
                    elif user['isPremium']:
                        print(f"💎 Премиум-пользователь отключился: {user['username']}")
                    elif user['isModerator']:
                        print(f"🛡️ Модератор отключился: {user['username']}")
                    else:
                        print(f"💔 Пользователь отключился: {user['username']}")
                    
                    try:
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            asyncio.create_task(self.broadcast({
                                'event': 'userLeft',
                                'user': user
                            }))
                    except Exception as e:
                        print(f"Error broadcasting user left: {e}")
                    
                    del users[user_id]
                del self.websocket_to_user[websocket]
        except Exception as e:
            print(f"Error in disconnect: {e}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict, skip_websocket: WebSocket = None):
        for connection in self.active_connections:
            if connection != skip_websocket:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error broadcasting message: {e}")
                    try:
                        self.disconnect(connection)
                    except:
                        pass

manager = ConnectionManager()

_shuffled_avatars = None

def get_avatars_by_category():
    categories = {}
    avatar_path = "public/Images/Avatars"
    
    animals_path = os.path.join(avatar_path, 'Animals')
    if os.path.exists(animals_path):
        animals = glob.glob(os.path.join(animals_path, "*.png"))
        random.shuffle(animals)
        categories['Animals'] = [f"Images/Avatars/Animals/{os.path.basename(avatar)}" for avatar in animals]
    else:
        categories['Animals'] = []
    
    special_path = os.path.join(avatar_path, 'Special')
    if os.path.exists(special_path):
        special = glob.glob(os.path.join(special_path, "*.png"))
        random.shuffle(special)
        categories['Special'] = [f"Images/Avatars/Special/{os.path.basename(avatar)}" for avatar in special]
    else:
        categories['Special'] = []
    
    return categories

def get_random_avatar():
    categories = get_avatars_by_category()
    
    if categories.get('Animals'):
        return random.choice(categories['Animals'])
    return f"Images/Avatars/Animals/1.png"

async def check_username(username: str, current_user_id: str = None) -> bool:
    for user_id, user_data in users.items():
        if user_data['username'].lower() == username.lower() and user_id != current_user_id:
            return False
    return True

def verify_admin_password(username: str, password: str) -> bool:
    if username.lower() in [name.lower() for name in ADMIN_USERNAMES]:
        return password == ADMIN_PASSWORD
    return False

def verify_moderator_password(username: str, password: str) -> bool:
    if username.lower() in [name.lower() for name in MODERATOR_USERNAMES]:
        return password == MODERATOR_PASSWORD
    return False

@app.get("/")
async def read_root():
    return {"message": "WebChat WebSocket API", "status": "running"}

class AuthRequest(BaseModel):
    username: str
    password: str
    auth_type: str

@app.post("/check_auth")
async def check_auth(request: AuthRequest):
    if request.auth_type == "admin":
        if request.username.lower() in [name.lower() for name in ADMIN_USERNAMES]:
            if request.password == ADMIN_PASSWORD:
                return {"success": True, "isAdmin": True}
            else:
                return {"success": False, "message": "Неверный пароль администратора"}
        else:
            return {"success": False, "message": "Пользователь не найден в списке администраторов"}
    elif request.auth_type == "moderator":
        if request.username.lower() in [name.lower() for name in MODERATOR_USERNAMES]:
            if request.password == MODERATOR_PASSWORD:
                return {"success": True, "isModerator": True}
            else:
                return {"success": False, "message": "Неверный пароль модератора"}
        else:
            return {"success": False, "message": "Пользователь не найден в списке модераторов"}
    else:
        return {"success": False, "message": "Неверный тип авторизации"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            event_type = message.get('event')
            
            if event_type == 'join':
                await handle_join(websocket, message['data'])
            elif event_type == 'chatMessage':
                await handle_chat_message(websocket, message['data'])
            elif event_type == 'editMessage':
                await handle_edit_message(websocket, message['data'])
            elif event_type == 'deleteMessage':
                await handle_delete_message(websocket, message['data'])
            elif event_type == 'typing':
                await handle_typing(websocket)
            elif event_type == 'stopTyping':
                await handle_stop_typing(websocket)
            elif event_type == 'updateAvatar':
                await handle_update_avatar(websocket, message['data'])
            elif event_type == 'updateDisplayName':
                await handle_update_display_name(websocket, message['data'])
            elif event_type == 'updateGroupName':
                await handle_update_group_name(websocket, message['data'])
            elif event_type == 'getAvatarCategories':
                await handle_get_avatar_categories(websocket)
            elif event_type == 'getMessages':
                await handle_get_messages(websocket, message['data'])
            elif event_type == 'getImageData':
                await handle_get_image_data(websocket, message.get('data', {}))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
async def handle_join(websocket: WebSocket, data: dict):
    username = data['username']
    client_is_admin = data.get('isAdmin', False)
    client_is_moderator = data.get('isModerator', False)
    password = data.get('password', '')
    
    is_admin = False
    is_moderator = False
    
    if client_is_admin:
        if verify_admin_password(username, password):
            is_admin = True
            print(f"🔐 Администратор прошел проверку пароля: {username}")
        else:
            print(f"❌ Попытка подмены админа: {username} с паролем: {password}")
            await manager.send_personal_message({
                'event': 'authFailed',
                'message': 'Неверный пароль администратора'
            }, websocket)
            return
    
    if client_is_moderator:
        if verify_moderator_password(username, password):
            is_moderator = True
            print(f"🔐 Модератор прошел проверку пароля: {username}")
        else:
            print(f"❌ Попытка подмены модератора: {username} с паролем: {password}")
            await manager.send_personal_message({
                'event': 'authFailed',
                'message': 'Неверный пароль модератора'
            }, websocket)
            return
    
    is_premium = username.lower() in [name.lower() for name in PREMIUM_USERNAMES]
    
    existing_user_id = None
    for uid, user_data in users.items():
        if user_data['username'].lower() == username.lower():
            existing_user_id = uid
            break
    
    if existing_user_id and existing_user_id != data.get('id'):
        await manager.send_personal_message({
            'event': 'usernameTaken',
            'message': 'Это имя пользователя уже занято'
        }, websocket)
        return
    
    if is_admin:
        print(f"🤍 Администратор подключился: {username}")
    elif is_moderator:
        print(f"🛡️ Модератор подключился: {username}")
    elif is_premium:
        print(f"💎 Премиум-пользователь подключился: {username}")
    else:
        print(f"💚 Пользователь подключился: {username}")
    
    user_id = data.get('id') or str(uuid.uuid4())
    
    if username.lower() in users_by_name:
        avatar = users_by_name[username.lower()]['avatar']
    else:
        avatar = get_random_avatar()
    
    display_name = data.get('displayName', username)
    if not display_name or display_name.strip() == '':
        display_name = username
    
    user = {
        'id': user_id,
        'username': username,
        'avatar': avatar,
        'displayName': display_name,
        'isAdmin': is_admin,
        'isPremium': is_premium,
        'isModerator': is_moderator
    }
    
    users[user_id] = user
    users_by_name[username.lower()] = user
    manager.websocket_to_user[websocket] = user_id
    
    for message in messages:
        if message['user']['username'].lower() == username.lower():
            message['user']['id'] = user_id
            message['user']['avatar'] = avatar
            message['user']['displayName'] = display_name
            message['user']['isPremium'] = is_premium
            message['user']['isModerator'] = is_moderator
    
    initial_messages = []
    for m in messages:
        msg_copy = dict(m)
        if 'files' in m and isinstance(m['files'], list):
            new_files = []
            for f in m['files']:
                f_copy = dict(f)
                if isinstance(f_copy.get('type', ''), str) and f_copy.get('type', '').startswith('image/'):
                    if 'data' in f_copy:
                        f_copy['data'] = None
                new_files.append(f_copy)
            msg_copy['files'] = new_files
        initial_messages.append(msg_copy)

    total_messages = len(messages)
    has_more = False
    
    await manager.send_personal_message({
        'event': 'welcome',
        'user': user,
        'users': list(users.values()),
        'messages': initial_messages,
        'groupName': group_name,
        'totalMessages': total_messages,
        'hasMoreMessages': has_more
    }, websocket)
    
    await manager.broadcast({
        'event': 'userJoined',
        'user': user
    }, skip_websocket=websocket)

async def handle_get_avatar_categories(websocket: WebSocket):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    user = users[user_id]
    username = user['username']
    
    categories = get_avatars_by_category()
    available_categories = {k: v for k, v in categories.items() if v and len(v) > 0}
    
    if user.get('isAdmin') or user.get('isModerator'):
        unlocked_special_avatars = categories.get('Special', [])
    else:
        unlocked_special_avatars = USER_UNLOCKED_SPECIAL_AVATARS.get(username, [])
    
    await manager.send_personal_message({
        'event': 'avatarCategories',
        'categories': available_categories,
        'unlockedSpecialAvatars': unlocked_special_avatars
    }, websocket)

async def handle_update_group_name(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    user = users[user_id]
    if not (user.get('isAdmin') or user.get('isModerator') or user.get('isPremium')):
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'У вас нет прав изменять название группы'
        }, websocket)
        return
    
    global group_name
    new_name = data.get('name', group_name)
    
    if len(new_name) > 16:
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Название группы слишком длинное (максимум 16 символов)'
        }, websocket)
        return
    
    group_name = new_name
    await manager.broadcast({
        'event': 'groupNameUpdated',
        'name': group_name
    })

async def handle_update_avatar(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    new_avatar = data.get('avatar')
    if not new_avatar:
        return
    
    user = users[user_id]
    username = user['username']
    
    allowed_paths = ['Images/Avatars/Animals/']
    
    if new_avatar.startswith('Images/Avatars/Special/'):
        if user.get('isAdmin') or user.get('isModerator'):
            allowed_paths.append('Images/Avatars/Special/')
        else:
            unlocked_special_avatars = USER_UNLOCKED_SPECIAL_AVATARS.get(username, [])
            if new_avatar not in unlocked_special_avatars:
                await manager.send_personal_message({
                    'event': 'authFailed',
                    'message': 'У вас нет доступа к этой специальной аватарке'
                }, websocket)
                return
            allowed_paths.append('Images/Avatars/Special/')
    
    if not any(new_avatar.startswith(path) for path in allowed_paths):
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Недопустимый путь к аватару'
        }, websocket)
        return
    
    avatar_path = f"public/{new_avatar}"
    if not os.path.exists(avatar_path):
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Файл аватара не найден'
        }, websocket)
        return
    
    user['avatar'] = new_avatar
    users_by_name[user['username'].lower()]['avatar'] = new_avatar
    
    for message in messages:
        if message['user']['username'].lower() == user['username'].lower():
            message['user']['avatar'] = new_avatar
            message['user']['displayName'] = user.get('displayName', user['username'])
    
    await manager.broadcast({
        'event': 'avatarChanged',
        'username': user['username'],
        'newAvatar': new_avatar,
        'userId': user['id']
    })

async def handle_update_display_name(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    new_display_name = data.get('displayName', '').strip()
    if not new_display_name:
        new_display_name = users[user_id]['username']
    
    if len(new_display_name) > 20:
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Отображаемое имя слишком длинное (максимум 20 символов)'
        }, websocket)
        return
    
    user = users[user_id]
    user['displayName'] = new_display_name
    users_by_name[user['username'].lower()]['displayName'] = new_display_name
    
    for message in messages:
        if message['user']['username'].lower() == user['username'].lower():
            message['user']['displayName'] = new_display_name
            message['user']['avatar'] = user.get('avatar', message['user'].get('avatar'))
            message['user']['isAdmin'] = user.get('isAdmin', False)
            message['user']['isModerator'] = user.get('isModerator', False)
            message['user']['isPremium'] = user.get('isPremium', False)
    
    await manager.broadcast({
        'event': 'displayNameChanged',
        'username': user['username'],
        'oldDisplayName': user.get('displayName', user['username']),
        'newDisplayName': new_display_name,
        'userId': user['id']
    })

async def handle_chat_message(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    user = users[user_id]
    message_text = data.get('text', '')
    
    if len(message_text) > 2000:
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Сообщение слишком длинное (максимум 2000 символов)'
        }, websocket)
        return
    
    message = {
        'id': int(datetime.now().timestamp() * 1000),
        'text': message_text,
        'user': user,
        'time': datetime.now().isoformat()
    }
    client_message_id = data.get('clientMessageId')
    if client_message_id is not None:
        message['clientMessageId'] = client_message_id
    
    if 'replyTo' in data:
        message['replyTo'] = data['replyTo']
    
    if 'files' in data and data['files']:
        processed_files = []
        for i, file in enumerate(data['files']):
            processed_file = {
                'name': file.get('name', 'Unknown'),
                'type': file.get('type', 'application/octet-stream'),
                'size': file.get('size', 0),
                'data': file.get('data'),
                'url': file.get('url'),
                'tenorId': file.get('tenorId'),
                'isGif': file.get('isGif', False)
            }
            processed_files.append(processed_file)
        message['files'] = processed_files
    
    messages.append(message)
    await manager.broadcast({
        'event': 'message',
        'message': message
    })

async def handle_edit_message(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    user = users[user_id]
    message_id = data.get('id')
    new_text = data.get('text')
    
    if not message_id or not new_text:
        return
    
    if len(new_text) > 2000:
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Сообщение слишком длинное (максимум 2000 символов)'
        }, websocket)
        return
    
    forbidden_words = ['взлом', 'hack', 'хак', 'взломать', 'hacking', 'взломщик', 'хакер']
    if any(word in new_text.lower() for word in forbidden_words):
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Сообщение содержит запрещенные слова'
        }, websocket)
        return
    
    for message in messages:
        if message['id'] == message_id and (message['user']['id'] == user['id'] or 
                                           message['user']['username'].lower() == user['username'].lower()):
            message['text'] = new_text
            message['edited'] = True
            await manager.broadcast({
                'event': 'messageEdited',
                'message': message
            })
            break

async def handle_delete_message(websocket: WebSocket, data: dict):
    user_id = manager.websocket_to_user.get(websocket)
    if not user_id or user_id not in users:
        return
    
    user = users[user_id]
    message_id = data.get('id')
    
    if not message_id:
        return
    
    message_found = False
    message_owner = None
    
    for message in messages:
        if message['id'] == message_id:
            message_found = True
            message_owner = message['user']
            break
    
    if not message_found:
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Сообщение не найдено'
        }, websocket)
        return
    
    if not (message_owner['id'] == user['id'] or 
            message_owner['username'].lower() == user['username'].lower()):
        await manager.send_personal_message({
            'event': 'authFailed',
            'message': 'Вы можете удалять только свои сообщения'
        }, websocket)
        return
    
    for i, message in enumerate(messages):
        if message['id'] == message_id:
            messages.pop(i)
            await manager.broadcast({
                'event': 'messageDeleted',
                'id': message_id
            })
            break

async def handle_typing(websocket: WebSocket):
    user_id = manager.websocket_to_user.get(websocket)
    if user_id and user_id in users:
        await manager.broadcast({
            'event': 'userTyping',
            'user': users[user_id]
        }, skip_websocket=websocket)

async def handle_get_messages(websocket: WebSocket, data: dict):
    page = data.get('page', 0)
    limit = data.get('limit', 20)
    
    total_messages = len(messages)
    
    start_index = max(0, total_messages - (page + 1) * limit)
    end_index = max(0, total_messages - page * limit)
    
    paginated_messages = messages[start_index:end_index] if start_index < end_index else []
    has_more = start_index > 0
    
    await manager.send_personal_message({
        'event': 'messagesLoaded',
        'messages': paginated_messages,
        'page': page,
        'hasMore': has_more,
        'total': total_messages
    }, websocket)


async def handle_stop_typing(websocket: WebSocket):
    user_id = manager.websocket_to_user.get(websocket)
    if user_id and user_id in users:
        await manager.broadcast({
            'event': 'userStoppedTyping',
            'user': users[user_id]
        }, skip_websocket=websocket)

async def handle_get_image_data(websocket: WebSocket, data: dict):
    requests = data.get('requests', [])
    result = []
    id_to_message = {m.get('id'): m for m in messages}
    for req in requests:
        try:
            msg_id = req.get('messageId')
            file_index = req.get('fileIndex')
            if msg_id is None or file_index is None:
                continue
            msg = id_to_message.get(msg_id)
            if not msg:
                continue
            files = msg.get('files', [])
            if not isinstance(files, list) or file_index < 0 or file_index >= len(files):
                continue
            f = files[file_index]
            if isinstance(f.get('type', ''), str) and f.get('type', '').startswith('image/'):
                result.append({
                    'messageId': msg_id,
                    'fileIndex': file_index,
                    'data': f.get('data')
                })
        except Exception:
            continue
    await manager.send_personal_message({
        'event': 'imageDataLoaded',
        'images': result
    }, websocket)

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 6970))
    print(f"✅ Сервер запущен на порту {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)