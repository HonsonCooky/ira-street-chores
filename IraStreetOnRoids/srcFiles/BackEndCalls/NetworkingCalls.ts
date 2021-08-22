import fetch from "node-fetch"
const iraStUri = "https://ira-street-app.herokuapp.com/"

/**-----------------------------------------------------------------------------------------------------------------
 * GETS
 -----------------------------------------------------------------------------------------------------------------*/

export const getUser = async(u : string) => {
    let uri = new URL(iraStUri + "user")
    uri.searchParams.append("name", u)
    return await fetch(uri.toString()).then(res => {
        return res.json()
    })
}

export const getBills = async() => {
    let uri = new URL(iraStUri + "bills")
    return await fetch(uri.toString()).then(res => {
        return res.json()
    })
}

export const getChores = async() => {
    let uri = new URL(iraStUri + "chores")
    return await fetch(uri.toString()).then(res => {
        return res.json()
    })
}

export const getFlatShopping = async() => {
    let uri = new URL(iraStUri + "flat-shopping")
    return await fetch(uri.toString()).then(res => {
        return res.json()
    })
}

export const getFlatHistory = async() => {
    let uri = new URL(iraStUri + "flat-shopping-history")
    return await fetch(uri.toString()).then(res => {
        return res.json()
    })
}





/**-----------------------------------------------------------------------------------------------------------------
 * POST
 -----------------------------------------------------------------------------------------------------------------*/

export const setUser = async(u : string, isF: boolean, dId: string) => {
    console.log(isF)
    let uri = new URL(iraStUri + "write-user")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: u, isFlatmate: isF, deviceID: dId})
    }).then(res => res.status).then(res => {
        return res
    })
}

export const deleteUser = async (u: string) => {
    let uri = new URL(iraStUri + "delete-user")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: u})
    }).then(res => res.status).then(res => {
        return res
    })
}


export const deleteChore = async (c: string) => {
    let uri = new URL(iraStUri + "remove-chore")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({chore: c})
    }).then(res => res.status).then(res => {
        return res
    })
}

export const writeFlatShopping = async (i: string) => {
    let uri = new URL(iraStUri + "write-flat-shopping")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({item: i})
    }).then(res => res.status).then(res => {
        return res
    })
}


export const writeBill = async (c: string, a: number) => {
    let uri = new URL(iraStUri + "write-bill")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({company: c, amount: a})
    }).then(res => res.status).then(res => {
        return res
    })
}


export const deleteBill = async (c: string) => {
    let uri = new URL(iraStUri + "remove-bill")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({company: c})
    }).then(res => res.status).then(res => {
        return res
    })
}



export const writeChore = async (c: string) => {
    let uri = new URL(iraStUri + "add-chore")
    return await fetch(uri.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: "Harrison", chore: c})
    }).then(res => res.status).then(res => {
        return res
    })
}

/**-----------------------------------------------------------------------------------------------------------------
 * PATCH
 -----------------------------------------------------------------------------------------------------------------*/

export const updatePersonalShopping = async (u: string, list: string[]) => {
    let uri = new URL(iraStUri + "update-personal-shopping")
    return await fetch(uri.toString(), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: u, shoppingList: list})
    }).then(res => res.status).then(res => {
        return res
    })
}

export const purchaseFlatShopping = async (u: string, i: string[]) => {
    let uri = new URL(iraStUri + "purchase-flat-shopping")
    return await fetch(uri.toString(), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({items: i, name: u})
    }).then(res => res.status).then(res => {
        return res
    })
}


