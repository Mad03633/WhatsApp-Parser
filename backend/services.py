from fastapi import HTTPException
from utils.DB import get_db_connection
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Any, List, Optional, Tuple

@contextmanager
def db_cursor():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if conn:
            cursor.close()
            conn.close()

def execute_query(query: str, params: Optional[Tuple] = None, fetch: str = "none") -> Any:
    with db_cursor() as cursor:
        cursor.execute(query, params)
        if fetch == 'one':
            return cursor.fetchone()
        if fetch == 'all':
            return cursor.fetchall()

def fetch_all(table: str, field: str = None, value: str = None):
    query = f"SELECT * FROM {table}"
    if field and value:
        query += f" WHERE {field} = '{value}'" 
    print(f"Executing query: {query}")
    return execute_query(query, fetch='all')