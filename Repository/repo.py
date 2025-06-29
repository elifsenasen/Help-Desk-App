from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["helpdesk"]
tickets_collection = db["tickets"]

class TicketRepository:
    @staticmethod
    def insert_ticket(ticket_data):
        result = tickets_collection.insert_one(ticket_data)
        return result.inserted_id

    @staticmethod
    def get_all_tickets():
        all_tickets = []
        for i in tickets_collection.find():
            ticket = {
                "_id": str(i["_id"]),
                "title": i["title"],
                "mail": i["mail"],
                "departman": i["departman"],
                "description": i["description"],
                "category": i["category"],
                "priority": i["priority"],
                "status": i["status"],
                "date": i["date"].strftime("%Y-%m-%d %H:%M:%S")
            }
            all_tickets.append(ticket)
        return all_tickets

    @staticmethod
    def get_ticket_by_id(id):
        return tickets_collection.find_one({"_id": ObjectId(id)})
    
    @staticmethod
    def deleteTicket(ticket_id):
        return tickets_collection.delete_one({"_id": ObjectId(ticket_id)})
        
        
    @staticmethod
    def updateTicket(id,status):
        return tickets_collection.update_one({"_id": ObjectId(id)},  
        {"$set": {"status": status}})
