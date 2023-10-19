import { Principal, Record, Vec, nat, text } from "azle";

export const User = Record({
    eventIds: Vec(Principal)
});

export const Challenge = Record({
    pic: text,
    challenger: Principal,
});

export const Event = Record({
    id: Principal,
    name: text,
    location: text,
    logo: text,
    category: text,
    price: nat,
    transactions: Vec(Challenge),
});

