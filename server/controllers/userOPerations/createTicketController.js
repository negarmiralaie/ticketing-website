const mongoose = require('mongoose');
const TicketModel = require('../../models/Ticket');
const UserModel = require('../../models/User');

// /ticket/create/:id

class createTicketController {
    handleCreateTicket = async (req, res) => {
        const userId = req.params.id;
        const { title, description, requestType } = req.body;

        try{
            // Now find user with given id
            console.log('userId', userId)
            // let foundUser = await UserModel.findOne({ userId });
            const ObjectId = require('mongodb').ObjectID;
            let foundUser = await UserModel.find({"_id": ObjectId(userId)})
            if (!foundUser) return res.status(401).json({ message: "کاربر وجود ندارد." }); //Unauthorized

            console.log('foundUser', foundUser[0])
            console.log(1)
            const ticket = await TicketModel.create ({
                title,
                description,
                requestType,
                "status": "pending",
                "user": foundUser[0]
            });

            console.log(2)

            console.log(ticket)

            // Now attach ticket to its user
            await UserModel.updateMany({ userId },{$push:{"tickets": ticket}});
            await foundUser.save;

            return res.status(200).json({ message: "تیکت با موفقیت ایجاد شد."});
        
        } catch(error){
            return res.status(500).send({ message: "خطای سرور" });
        }
    }
}

module.exports = new createTicketController();

