import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Поиск пользователей по имени, телефону или био
    Args: event с httpMethod, queryStringParameters {query}
    Returns: HTTP response со списком найденных пользователей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        query = params.get('query', '').strip()
        user_id = event.get('headers', {}).get('X-User-Id')
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Query parameter is required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        search_pattern = f'%{query}%'
        cur.execute(
            """
            SELECT id, phone, name, avatar, bio, is_online 
            FROM users 
            WHERE (name ILIKE %s OR phone ILIKE %s OR bio ILIKE %s)
            AND id != COALESCE(%s::INTEGER, 0)
            LIMIT 50
            """,
            (search_pattern, search_pattern, search_pattern, user_id)
        )
        
        users = []
        for row in cur.fetchall():
            user_id_found, phone, name, avatar, bio, is_online = row
            users.append({
                'id': user_id_found,
                'phone': phone,
                'name': name,
                'avatar': avatar,
                'bio': bio,
                'isOnline': is_online
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
