import { Canister, query, StableBTreeMap, text, update, Void, Vec, bool, Principal, Opt, nat, nat32, int, int32 } from 'azle';
import { Challenge, Event, User } from "./types";
// This is a global variable that is stored on the heap
let message = '';

let users = StableBTreeMap(Principal, User, 0);
let events = StableBTreeMap(Principal, Event, 1);

export default Canister({

    createEvent: update([Principal, Event], bool, (principal, event) => {
        const userOpt = users.get(principal);
        const id = generateId();
        const new_event: typeof Event = {
            id: id,
            name: event.name,
            location: event.location,
            logo: event.logo,
            category: event.category,
            price: event.price,
            transactions: []
        };
        events.insert(id, new_event);
        if ('None' in userOpt) {
            console.log("USER DOES NOT EXIST");
            const new_user: typeof User = {
                eventIds: [id]
            };
            users.insert(principal, new_user);
        } else {
            console.log("USER EXISTS");
            const events = userOpt.Some;
            const new_user: typeof User = {
                eventIds: [...events.eventIds, id]
            };
            users.insert(principal, new_user);
        }
        return true
    }),

    getAllEvents: query([], Vec(Event), () => {
        return events.values();
    }),

    getEvents: query([int32, int32], Vec(Event), (page, limit) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        console.log("[0]: " + events.values()[0]);
        console.log("Page: " + page);
        console.log("Limit: " + limit);
        console.log("START: " + start);
        console.log("END: " + end);
        // console.log("length: " + events.values().slice(start, end).length);
        return events.values().slice(start, end);
    }),

    getEventByUser: query([Principal], Vec(Event), (principal) => {
        const userOpt = users.get(principal);
        if ('None' in userOpt) {
            return [];
        }
        const eventIds = userOpt.Some.eventIds;
        if (eventIds.length === 0) {
            return [];
        }
        return eventIds.map((id) => events.get(id).Some!);
    }),

    getTransactions: query([Principal, int32, int32], Vec(Challenge), (principal, page, limit) => {
        const eventOpt = events.get(principal);
        if ('None' in eventOpt) {
            return [];
        } else {
            const transactions = eventOpt.Some.transactions;
            const start: int32 = page * limit - 1;
            const end: int32 = page * (limit - 1);
            return transactions.slice(start, end);
        }
    }),

    getAllTransactions: query([Principal], Vec(Challenge), (principal) => {
        const eventOpt = events.get(principal);
        if ('None' in eventOpt) {
            return [];
        }
        return eventOpt.Some.transactions;
    }),
});

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}