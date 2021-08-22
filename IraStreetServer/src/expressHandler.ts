import express, {Request, Response} from 'express';
import bodyParser from "body-parser";
import fetch from "node-fetch"
import {
    writeUser,
    connectDB,
    getUser,
    updateUserShopping,
    addChore,
    getAllChores,
    writeFlatShopping,
    markPurchasedFlatShopping,
    currentFlatShopping,
    historyFlatShopping,
    updateChores,
    addBill,
    getBills, deleteUser, removeChore, removeBill, notificationSearchUsers, notificationSearchChores
} from "./mongoHandler";

const restful = express();
const jsonHandler = bodyParser.json()
const PORT = process.env.PORT || 3200
export const uri = process.env.MONGO_URI || "mongodb+srv://HonsonCooky:D1CKD33P1NCR4ZY@honsoncooky-cluster.5nveh.mongodb.net/Ira-Street-App?retryWrites=true&w=majority"

/**
 * Connect to MongoDB instance
 */
let mongoReady = false;

/**
 * Check to see if backend is ready to go
 */
restful.get('/', (req: Request, res: Response) => {
    res.status(200).send("Ira Street Server is running on heroku")
})

/**
 * Check to see if backend is ready to go
 */
restful.get('/connected', (req: Request, res: Response) => {
    if (!mongoReady) {
        return res.status(500).send("Ira Street Server is not yet connected to MongoDB")
    }
    res.status(200).send("Ira Street Server successfully connected to MongoDB")
})
/**--------------------------------------------------------------------------------------------------------------------
 * ERROR HANDLING
 ---------------------------------------------------------------------------------------------------------------------*/
/**
 * Checks if Mongo is ready
 * @param res
 */
const isConnectedToDatabase = (res: Response): boolean => {
    if (!mongoReady) {
        res.status(500).send("Database not connected")
        return false
    }
    return true
}

/**
 * Checks that some request contains necessary information and formatting.
 * @param errTitle
 * @param isJson
 * @param req
 * @param res
 * @param params
 */
const isValidReq = (errTitle: String, isJson: boolean, req: Request, res: Response, ...params: string[]): boolean => {
    if (!req.is('application/json') && isJson) {
        res.status(400).send(`${errTitle}: is not JSON format`)
        return false;
    }

    let ret = true;
    params.forEach((p) => {
        if (!req.body.hasOwnProperty(p) && !req.query.hasOwnProperty(p)) {
            res.status(400).send(`${errTitle}: missing parameters`)
            ret = false;
        }
    })
    return ret
}

const sendUpdate = (name: string, deviceID: string, chore: string) => {
    fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            to: deviceID,
            sound: "default",
            title: "Chore Update",
            body: `Hey ${name}, you're on ${chore} this week`
        })
    }).then((res) => {
        console.log(res.status)
    })
}

const sendUpdate2 = (name: string, deviceID: string, chore: string) => {
    fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            to: deviceID,
            sound: "default",
            title: "Chore Update",
            body: `Hey ${name}, remember, you're on ${chore} this week`
        })
    }).then((res) => {
        console.log(res.status)
    })
}

const matchUserToChore = (users: Array<{ name: string, deviceID: string }>,
                          chores: Array<{ onDuty: string, chore: string }>) => {

    let now = new Date().toUTCString()

    for (let i = 0; i < chores.length; i++) {
        for (let j = 0; j < users.length; j++) {
            let chore = chores[i]
            let user = users[j]
            if (chore.onDuty === user.name) {
                // Check times vs chores and update accordingly
                if (now.includes("Mon")) {
                    sendUpdate(user.name, user.deviceID, chore.chore)
                } else if (chore.chore.includes("Rubbish") && now.includes("Thu")){
                    sendUpdate2(user.name, user.deviceID, chore.chore)
                }
                break;
            }
        }
    }
}

const notificationPusher = async () => {
    let users = await notificationSearchUsers();
    let chores = await notificationSearchChores();
    matchUserToChore(users, chores)
    recursiveUpdate();
}

const recursiveUpdate = () => {
    // Attempt update tomorrow at 10am
    let today = new Date()
    today.setHours(10, 0, 0)
    let tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    let diff = tomorrow.getTime() - Date.now()


    setTimeout(notificationPusher.bind(this), diff)
}


/**--------------------------------------------------------------------------------------------------------------------
 * BILLS
 ---------------------------------------------------------------------------------------------------------------------*/

restful.get('/bills', (req: Request, res: Response) => {
    if (!isConnectedToDatabase(res)) return
    getBills()
        .then((bills) => res.status(200).send(bills))
        .catch(() => res.status(400).send("Unable to get bills"))
})

restful.post('/write-bill', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Write Bill", true, req, res, "company", "amount")) return

    addBill(req.body.company, req.body.amount)
        .then(() => res.status(200).send())
        .catch((_) => res.status(400).send("Unable to add bill"))
})


restful.post('/remove-bill', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Remove Bill", true, req, res, "company")) return

    removeBill(req.body.company)
        .then(() => res.status(200).send())
        .catch((e) => {
            console.log(e)
            res.status(400).send("Unable to remove bill")
        })
})

/**--------------------------------------------------------------------------------------------------------------------
 * CHORES
 ---------------------------------------------------------------------------------------------------------------------*/
/**
 * Get all chores
 */
restful.get('/chores', (req: Request, res: Response) => {
    if (!isConnectedToDatabase(res)) return
    updateChores()
        .then(() => getAllChores()
            .then((val) =>
                res.status(200).send(val)))
})


/**
 * Add a chore
 */
restful.post('/add-chore', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Add Chore", true, req, res, "chore")) return

    addChore(req.body.chore)
        .then(() => updateChores()
            .then(() => res.status(200).send()))
        .catch(() => {
            res.status(400).send("Unable to add chore")
        })

})

/**
 * Remove a chore
 */
restful.post('/remove-chore', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Remove Chore", true, req, res, "chore")) return

    removeChore(req.body.chore)
        .then(() => updateChores()
            .then(() => res.status(200).send()))
        .catch(() => {
            res.status(400).send("Unable to remove chore")
        })

})


/**--------------------------------------------------------------------------------------------------------------------
 * FlatShopping
 ---------------------------------------------------------------------------------------------------------------------*/

restful.get('/flat-shopping', (req: Request, res: Response) => {
    if (!isConnectedToDatabase(res)) return
    currentFlatShopping().then((val) => res.status(200).send(val))
})

restful.get('/flat-shopping-history', (req: Request, res: Response) => {
    if (!isConnectedToDatabase(res)) return
    historyFlatShopping().then((val) => res.status(200).send(val))
})


restful.post('/write-flat-shopping', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Write Flat Shopping", true, req, res, "item")) return

    // Add the user
    writeFlatShopping(req.body.item)
        .then(() => res.status(200).send())
        .catch(() => res.status(400).send("Unable to add item at the moment"))

})

restful.patch('/purchase-flat-shopping', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Purchase Flat Shopping", true, req, res, "items", "name")) return
    if (!Array.isArray(req.body.items)) return res.status(400).send("Items needs to be an array")

    // Add the user
    markPurchasedFlatShopping(req.body.items, req.body.name)
        .then(() => res.status(200).send())
        .catch(() => res.status(400).send("Unable to update item at the moment"))

})

/**--------------------------------------------------------------------------------------------------------------------
 * USER
 ---------------------------------------------------------------------------------------------------------------------*/


/**
 * Get User: Gets the information of some user
 */
restful.get('/user?:name', (req: Request, res: Response) => {
    if (!isConnectedToDatabase(res)) return
    if (!req.query.name) {
        return res.status(400).send(`Unable to find user '${req.query.name}'`)
    }

    getUser(req.query.name.toString())
        .then((u) => {
            if (u != null) {
                res.status(200).send(u)
            } else throw new Error(); // Want 400 status here, so jump to catch
        })
        .catch(() => res.status(400).send(`Unable to find user '${req.query.name}'`))
})

/**
 * Write User: Given a JSON with a name, isFlatmate, add/update a user in the MongoDB.
 */
restful.post('/write-user', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Write user", true, req, res, "name", "isFlatmate", "deviceID")) return

    console.log(req.body.name, req.body.isFlatmate === true, req.body.deviceID)

    // Add the user
    writeUser(req.body.name, req.body.isFlatmate === true, req.body.deviceID)
        .then(() => {
            updateChores()
                .then(() => res.status(200).send())
        })
        .catch(() => res.status(400).send("Unable to add user, possibly already added"))
})

/**
 * Update: Given a JSON with a name and shoppingList update a user in the MongoDB.
 */
restful.patch('/update-personal-shopping', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Update Person Shopping", true, req, res, "name", "shoppingList")) return

    // Add the user
    updateUserShopping(req.body.name, req.body.shoppingList)
        .then(() => res.status(200).send())
        .catch(() => res.status(400).send("Unable to update user shopping"))
})


restful.post('/delete-user', jsonHandler, (req: Request, res: Response) => {
    //Ensure we can call
    if (!isConnectedToDatabase(res)) return
    else if (!isValidReq("Delete User", true, req, res, "name")) return

    deleteUser(req.body.name)
        .then(() => res.status(200).send())
        .catch(() => res.status(400).send("Unable to delete user, possibly already added"))
})

/**--------------------------------------------------------------------------------------------------------------------
 * START
 ---------------------------------------------------------------------------------------------------------------------*/

restful.listen(PORT, () => {
    console.log(`Running instance on http://localhost:${PORT}.`);
});

connectDB().then(() => {
    console.log("Connected to MANGODB")
    mongoReady = true
    recursiveUpdate();
}).catch(() => mongoReady = false)