import json
import os
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Работа с сообщениями: отправка, получение истории, редактирование
    Args: event - dict с httpMethod, headers, body, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            return get_messages(conn, event, user_id)
        elif method == 'POST':
            return send_message(conn, event, user_id)
        elif method == 'PUT':
            return edit_message(conn, event, user_id)
        elif method == 'DELETE':
            return delete_message(conn, event, user_id)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_messages(conn, event: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    '''Получить историю сообщений чата'''
    params = event.get('queryStringParameters', {}) or {}
    chat_id = params.get('chatId')
    contact_id = params.get('contactId')
    
    if not chat_id and not contact_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'chatId or contactId required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    # Если передан contactId, найти или создать чат
    if contact_id:
        # Проверяем, есть ли уже чат между этими пользователями
        cur.execute("""
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON c.id = cm1.chat_id
            JOIN chat_members cm2 ON c.id = cm2.chat_id
            WHERE c.is_group = false
            AND cm1.user_id = %s
            AND cm2.user_id = %s
        """, (user_id, contact_id))
        
        result = cur.fetchone()
        if result:
            chat_id = result[0]
        else:
            # Создать новый чат
            cur.execute("INSERT INTO chats (is_group, created_at) VALUES (false, CURRENT_TIMESTAMP) RETURNING id")
            chat_id = cur.fetchone()[0]
            
            # Добавить обоих пользователей в чат
            cur.execute("INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES (%s, %s, CURRENT_TIMESTAMP)", (chat_id, user_id))
            cur.execute("INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES (%s, %s, CURRENT_TIMESTAMP)", (chat_id, contact_id))
            conn.commit()
    
    # Получить сообщения
    cur.execute("""
        SELECT 
            m.id, m.sender_id, m.text, m.is_voice, m.voice_duration,
            m.is_file, m.file_name, m.file_size, m.is_edited, m.is_forwarded,
            m.forwarded_from, m.reply_to_id, m.created_at,
            u.name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = %s
        ORDER BY m.created_at ASC
    """, (chat_id,))
    
    messages = []
    for row in cur.fetchall():
        msg = {
            'id': row[0],
            'senderId': row[1],
            'text': row[2],
            'isVoice': row[3],
            'voiceDuration': row[4],
            'isFile': row[5],
            'fileName': row[6],
            'fileSize': row[7],
            'isEdited': row[8],
            'isForwarded': row[9],
            'forwardedFrom': row[10],
            'replyToId': row[11],
            'createdAt': row[12].isoformat() if row[12] else None,
            'senderName': row[13],
            'isOwn': str(row[1]) == user_id
        }
        messages.append(msg)
    
    cur.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'chatId': chat_id, 'messages': messages}),
        'isBase64Encoded': False
    }

def send_message(conn, event: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    '''Отправить новое сообщение'''
    body_data = json.loads(event.get('body', '{}'))
    
    chat_id = body_data.get('chatId')
    contact_id = body_data.get('contactId')
    text = body_data.get('text', '').strip()
    is_voice = body_data.get('isVoice', False)
    voice_duration = body_data.get('voiceDuration')
    is_file = body_data.get('isFile', False)
    file_name = body_data.get('fileName')
    file_size = body_data.get('fileSize')
    reply_to_id = body_data.get('replyToId')
    
    if not text and not is_voice and not is_file:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Message text required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    # Если передан contactId, найти или создать чат
    if contact_id:
        cur.execute("""
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON c.id = cm1.chat_id
            JOIN chat_members cm2 ON c.id = cm2.chat_id
            WHERE c.is_group = false
            AND cm1.user_id = %s
            AND cm2.user_id = %s
        """, (user_id, contact_id))
        
        result = cur.fetchone()
        if result:
            chat_id = result[0]
        else:
            # Создать новый чат
            cur.execute("INSERT INTO chats (is_group, created_at) VALUES (false, CURRENT_TIMESTAMP) RETURNING id")
            chat_id = cur.fetchone()[0]
            
            # Добавить обоих пользователей
            cur.execute("INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES (%s, %s, CURRENT_TIMESTAMP)", (chat_id, user_id))
            cur.execute("INSERT INTO chat_members (chat_id, user_id, joined_at) VALUES (%s, %s, CURRENT_TIMESTAMP)", (chat_id, contact_id))
    
    if not chat_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'chatId or contactId required'}),
            'isBase64Encoded': False
        }
    
    # Вставить сообщение
    cur.execute("""
        INSERT INTO messages (
            chat_id, sender_id, text, is_voice, voice_duration,
            is_file, file_name, file_size, reply_to_id, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        RETURNING id, created_at
    """, (chat_id, user_id, text, is_voice, voice_duration, is_file, file_name, file_size, reply_to_id))
    
    message_id, created_at = cur.fetchone()
    conn.commit()
    cur.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'id': message_id,
            'chatId': chat_id,
            'createdAt': created_at.isoformat() if created_at else None
        }),
        'isBase64Encoded': False
    }

def edit_message(conn, event: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    '''Редактировать сообщение'''
    body_data = json.loads(event.get('body', '{}'))
    
    message_id = body_data.get('messageId')
    text = body_data.get('text', '').strip()
    
    if not message_id or not text:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'messageId and text required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    # Проверить, что сообщение принадлежит пользователю
    cur.execute("UPDATE messages SET text = %s, is_edited = true WHERE id = %s AND sender_id = %s", (text, message_id, user_id))
    
    if cur.rowcount == 0:
        conn.rollback()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def delete_message(conn, event: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    '''Удалить сообщение'''
    params = event.get('queryStringParameters', {}) or {}
    message_id = params.get('messageId')
    
    if not message_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'messageId required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    # Удалить только свои сообщения
    cur.execute("DELETE FROM messages WHERE id = %s AND sender_id = %s", (message_id, user_id))
    
    if cur.rowcount == 0:
        conn.rollback()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
