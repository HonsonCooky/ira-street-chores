import mongoose from "mongoose"

const schema = mongoose.Schema

/**
 * Bill Schema
 */
export const BillSchema = new schema({
    company: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    paidDate: {
        type: String,
        required: true
    }
}, {timestamps: true})

/**
 * Chore List Schema
 */
export const ChoreListSchema = new schema({
    chore: {
        type: String,
        required: true
    },
    onDuty: {
        type: String,
        required: false
    }
},{timestamps: true})


/**
 * Flat Shopping Item
 */
export const FlatShoppingItemSchema = new schema({
    item: {
        type: String,
        required: true
    },
    purchasedBy: {
        type: String,
        required: false
    },
    purchasedDate: {
        type: String,
        required: false
    }
},{timestamps: true})


/**
 * User Schema
 */
export const UserSchema = new schema({
    name: {
        type: String,
        required: true
    },
    fmUUID: {
        type: Number,
        required: true
    },
    isFlatmate: {
        type: Boolean,
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    personalShoppingList: {
        type: [String],
        required: true,
    }
}, {timestamps: true})

