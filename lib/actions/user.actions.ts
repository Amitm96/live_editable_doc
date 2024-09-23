'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({userIds}: {userIds: string[]}) => {
    try{
        const {data} = await clerkClient.users.getUserList({emailAddress: userIds});

        const users = data.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0].emailAddress,
            avatar: user.imageUrl 
        }))

        const sortedUsers = userIds.map((email) => users.find((user) => user.email === email))
        return parseStringify(sortedUsers);
    }
    catch(err){
        console.log(err);
    }
}

export const getDocumentUsers = async ({roomId, currentUser, text}: {roomId: string; currentUser: string; text: string}) => {
    try{
        const room = await liveblocks.getRoom(roomId);

        console.log(room);
        const users = Object.keys(room.usersAccesses).filter((email: string) => email != currentUser);

        if(text.length){
            const lowercaseText = text.toLocaleLowerCase();

            const filteredUsers = users.filter((email : string) => email.toLocaleLowerCase().includes(lowercaseText));

            return parseStringify(filteredUsers);
        }

        return parseStringify(users);
    }
    catch(err){
        console.log(err);
    }
}