import { ID } from "@node-steam/id";

export const getSteamLink = (id: ID): string => {
    return `https://steamcommunity.com/profiles/${id.get64()}`;
};
