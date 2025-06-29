from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class Ticket(BaseModel):
    title: str
    mail: str
    departman: str
    description: str
    category: str
    priority: str
    status: str
    date: Optional[datetime] = None