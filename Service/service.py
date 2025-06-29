from ticket_model import Ticket
from Repository.repo import TicketRepository
from datetime import datetime


class TicketService:
    @staticmethod
    def create_ticket(ticket: Ticket):
        new_ticket = {
            "title": ticket.title,
            "mail": ticket.mail,
            "description": ticket.description,
            'departman': ticket.departman,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "date": datetime.utcnow()
        }
        inserted_id = TicketRepository.insert_ticket(new_ticket)
        return {"message": "Ticket created", "id": str(inserted_id)}
    
    @staticmethod
    def get_tickets():
        tickets = TicketRepository.get_all_tickets()
        return tickets
    

    @staticmethod
    def update_status(id: str,status: str):
        data = TicketRepository.get_ticket_by_id(id)
        if data:
            result= TicketRepository.updateTicket(id,status)
            if result:
                return {"success": True}
            else:
                return { "success": False}
        else:
            return { "success": False}

    @staticmethod
    def delete(ticket_id: str):
        deleted = TicketRepository.deleteTicket(ticket_id)
        if deleted:
            return {"success": True}
        else:
            return { "success": False}

    
    
        

