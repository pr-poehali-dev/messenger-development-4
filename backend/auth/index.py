import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Авторизация пользователя по номеру телефона
    Args: event с httpMethod, body {phone, name}
    Returns: HTTP response с данными пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        phone = body_data.get('phone', '').strip()
        name = body_data.get('name', '').strip()
        ip_address = body_data.get('ipAddress', '').strip()
        
        if not phone or not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Phone and name are required'}),
                'isBase64Encoded': False
            }
        
        if not ip_address:
            request_context = event.get('requestContext', {})
            identity = request_context.get('identity', {})
            ip_address = identity.get('sourceIp', 'unknown')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, phone, name, avatar, bio, is_online FROM users WHERE phone = %s",
            (phone,)
        )
        user = cur.fetchone()
        
        if user:
            user_id, db_phone, db_name, avatar, bio, is_online = user
            cur.execute(
                "UPDATE users SET name = %s, is_online = true, last_seen = CURRENT_TIMESTAMP, ip_address = %s WHERE id = %s",
                (name, ip_address, user_id)
            )
            conn.commit()
        else:
            cur.execute(
                "INSERT INTO users (phone, name, is_online, ip_address) VALUES (%s, %s, true, %s) RETURNING id, phone, name, avatar, bio, is_online",
                (phone, name, ip_address)
            )
            user = cur.fetchone()
            user_id, db_phone, db_name, avatar, bio, is_online = user
            conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': user_id,
                'phone': db_phone,
                'name': db_name,
                'avatar': avatar,
                'bio': bio,
                'is_online': is_online
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }