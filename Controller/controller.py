from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from fastapi import FastAPI, HTTPException, Depends, Header
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import ticket_model
import role
from Service.service import TicketService
from fastapi.middleware.cors import CORSMiddleware

class StatusUpdate(BaseModel):
    id: str
    status: str

def verify_role(role: role.Role):
    def role_checker(role_header: str = Header(...)):
        if role_header != role.value:
            raise HTTPException(status_code=403, detail="Unauthorized for this action")
        return role_header
    return role_checker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.post("/tickets")
def create_ticket(ticket: ticket_model.Ticket, role: str=Depends(verify_role(role.Role.customer))):
    return TicketService.create_ticket(ticket)
   

@app.get("/get_tickets")
def get_tickets(role: str=Depends(verify_role(role.Role.staff))):
    return TicketService.get_tickets()


@app.post("/update_status")
def get_description(data: StatusUpdate, role: str=Depends(verify_role(role.Role.staff))):
    return TicketService.update_status(data.id, data.status)
    

@app.delete('/delete/{ticket_id}')
def delete(ticket_id:str,role: str=Depends(verify_role(role.Role.staff))):
    return TicketService.delete(ticket_id)