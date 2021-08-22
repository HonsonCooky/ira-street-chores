import mongoose from "mongoose"
import {
    BillSchema,
    ChoreListSchema,
    FlatShoppingItemSchema, UserSchema
} from "../util/schemaObjects";
import {uri} from "./expressHandler";

export const Bills = mongoose.model("bills", BillSchema)
export const Chores = mongoose.model("chores", ChoreListSchema)
export const FlatShoppingItems = mongoose.model("flatshoppings", FlatShoppingItemSchema)
export const UserData = mongoose.model("userdatas", UserSchema)

export const connectDB = async () => {
    await mongoose.connect(uri || "", {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10})
        .catch((err) => {
            console.log(err, 'connection')
            throw err
        })
}

const getWeekNumber = (d: Date) => {
    let date = new Date(d);
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export const notificationSearchUsers = async () => {
    return UserData.find({isFlatmate: true})
}

export const notificationSearchChores = async () => {
    return Chores.find({})
}

/**--------------------------------------------------------------------------------------------------------------------
 * BILLS
 ---------------------------------------------------------------------------------------------------------------------*/

export const getBills = async () => {
    return Bills.find({}).select('company amount paidDate')
}

export const addBill = async (c: string, a: number) => {
    return new Bills({
        company: c,
        amount: a,
        paidDate: new Date().toUTCString()
    }).save()
}

export const removeBill = async (n: string) => {
    let latest = ""
    await Bills.findOne({company: n}, {}, {sort: {'updatedAt': -1}},
        (err, post) => {
            if (err || post == null) throw err
            latest = post._id
        })
    return Bills.deleteOne({_id: latest})
}

/**--------------------------------------------------------------------------------------------------------------------
 * CHORES
 ---------------------------------------------------------------------------------------------------------------------*/

export const updateChores = async () => {
    // First, check when chores were last updated
    let c = await Chores.find({}).select('chore updatedAt')
    if (c === null || c[0] == null) return;
    let curWeek = getWeekNumber(new Date())
    let users = await UserData.find({isFlatmate: true}).select('name')
    for (let i = 0; i < c.length; ++i) {
        let userOffset = (curWeek + i) % users.length
        let userName = users[userOffset] ? users[userOffset].name : "N/A"
        let chore = c[i].chore
        await updateChore(chore, userName)
    }
}

const updateChore = async (c: String, n: String) => {
    let doc = await Chores.findOne({chore: c})
    if (doc != null) {
        return Chores.findOneAndUpdate({chore: c}, {onDuty: n}, {useFindAndModify: false})
    }
    throw new Error()
}

export const getAllChores = async () => {
    return Chores.find({}).select('chore onDuty')
}

export const addChore = async (c: String) => {
    let doc = await Chores.findOne({chore: c})
    if (doc === null) {
        return new Chores({
            chore: c
        }).save()
    }
}

export const removeChore = async (c: String) => {
    return Chores.deleteOne({chore: c});
}

/**--------------------------------------------------------------------------------------------------------------------
 * FlatShopping
 ---------------------------------------------------------------------------------------------------------------------*/

export const currentFlatShopping = async () => {
    return FlatShoppingItems.find({purchasedBy: null}).select('item')
}

export const historyFlatShopping = async () => {
    return FlatShoppingItems.find({purchasedDate: {"$gt": "0"}}).select('item purchasedBy purchasedDate')
}

/**
 * Update / Add user
 * @param n - Name of user
 */
export const writeFlatShopping = async (n: string) => {
    // Remove items older than 12 weeks
    await FlatShoppingItems.deleteMany({updatedAt: {'$lt': new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000)}})
    return new FlatShoppingItems({
        item: n
    }).save()
}

/**
 * Marks object as purchased
 * @param i
 * @param n
 */
export const markPurchasedFlatShopping = async (i: string[], n: string) => {
    return FlatShoppingItems.updateMany({item: {'$in': i}}, {
        purchasedBy: n,
        purchasedDate: new Date().toUTCString(),
    }, {useFindAndModify: false})
}

/**--------------------------------------------------------------------------------------------------------------------
 * USER
 ---------------------------------------------------------------------------------------------------------------------*/

/**
 * Get some user with name n.
 * @param n - Name
 */
export const getUser = async (n: string) => {

    return UserData.find({name: n});
}

/**
 * Update user shopping list
 * @param n - Name of user
 * @param items
 */
export const updateUserShopping = async (n: string, items: string[]) => {
    let doc = await UserData.findOne({name: n})
    if (doc) {
        return UserData.findOneAndUpdate({name: n}, {
            personalShoppingList: items
        }, {useFindAndModify: false});
    }
    throw new Error();
}

/**
 * Update / Add user
 * @param n - Name of user
 * @param isF - Is flatmate boolean
 * @param dID
 */
export const writeUser = async (n: string, isF: boolean, dID: string) => {
    let doc = await UserData.findOne({name: n})
    if (doc) {
        return UserData.findOneAndUpdate({name: n}, {
            isFlatmate: isF,
            deviceId: dID,
        }, {useFindAndModify: false})
    } else {
        return UserData.countDocuments((err, count) => {
            if (err) throw err

            return new UserData({
                name: n,
                fmUUID: count,
                isFlatmate: isF,
                deviceId: dID,
                personalShoppingList: []
            }).save()
        })
    }
}

/**
 * Delete some user with name n
 * @param n
 */
export const deleteUser = async (n: string) => {
    return UserData.deleteMany({name: n})
}