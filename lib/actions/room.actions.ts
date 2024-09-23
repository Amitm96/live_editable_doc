'use server';

import { nanoid } from 'nanoid';
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {

    const roomId = nanoid();

    try {

        let metadata = {
            creatorId: userId,
            email,
            title: 'untitled'
        }

        const usersAccesses : RoomAccesses = {
            [email] : ['room:write']
        }
        const room = await liveblocks.createRoom(roomId, {
            metadata,
            usersAccesses,
            defaultAccesses: []
        }); 

        revalidatePath('/');
        return parseStringify(room);
    }
    catch (err) {
        console.log('Error happend during creation of room');
    }
}

export const getDocument = async ({roomId, userId} : {roomId: string; userId: string}) => {
    try{
        const room = await liveblocks.getRoom(roomId);

        const hasAccess = Object.keys(room.usersAccesses).includes(userId);

        if(!hasAccess){
            throw new Error('You do not have access to this room');
        }

        return parseStringify(room);
    }
    catch(err){
        console.log(err);
    }
}

export const getDocuments = async (email: string) => {
    try{
        const rooms = await liveblocks.getRooms({userId: email});

        // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

        // if(!hasAccess){
        //     throw new Error('You do not have access to this room');
        // }

        return parseStringify(rooms);
    }
    catch(err){
        console.log(err);
    }
}

export const updateDocument = async ({roomId, title}: {roomId: string; title: string}) => {
    try{
        let updatedRoom = await liveblocks.updateRoom(roomId, {metadata: {title}});

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(updatedRoom);
    }
    catch(err){
        console.log(err);
    }
}

export const updateDocumentAccess = async ({roomId, email, userType, updatedBy}: ShareDocumentParams) => {
    try{
        const usersAccesses : RoomAccesses = {
            [email] : getAccessType(userType) as AccessType,
        }

        const room = await liveblocks.updateRoom(roomId, {usersAccesses});

        if(room){
            const notificationId = nanoid();

            await liveblocks.triggerInboxNotification({userId: email, kind: '$documentAccess', subjectId: roomId, activityData: {userType, title: `You document access updated to ${userType} by ${updatedBy.name}`, updatedBy: updatedBy.name, avatar: updatedBy.avatar, email: updatedBy.email}, roomId});
        }

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(room);
    }
    catch(err){
        console.log(`error in share document access ${err}`);
    }
}

export const removeCollaborator = async ({roomId, email}: {roomId: string; email: string}) => {
    try{
        let room = await liveblocks.getRoom(roomId);

        if(room.metadata.email === email){
            throw new Error('you can not remove your account');
        }

        const updatedRoom = await liveblocks.updateRoom(roomId , {usersAccesses: {[email] : null}});

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(updatedRoom);
    }
    catch(err){
        console.log(`remove access error ${err}`);
    }
}

export const deleteDocument = async (roomId: string) => {
    try{
        await liveblocks.deleteRoom(roomId);

        revalidatePath('/');
        redirect('/');
    }
    catch(err){
        console.log(`err in deleting document ${err}`);
    }
}
