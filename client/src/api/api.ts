export const serverAPI = "http://localhost:5020/";
import { ConvInfo } from "../reducers/user-reducer";

const createConvInfo = (): ConvInfo => {
    return {
        convId: "",
        title: "",
        lastMessageDate: new Date(),
        numberOfMessages: 0
    }
}


export const createConv = async (userId: string) => {

    // First we create the conversation in the userDB on the right user
    const optionsUser = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": userId
        },
        body: JSON.stringify(createConvInfo())
    }

    const userRouterResponse = await fetch(`${serverAPI}user/${userId}`, optionsUser);
    const userConvContent: ConvInfo = await userRouterResponse.json();

    // Then we create the conversation in the conversationDB using the convId from the userDB
    const optionsConv = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": userId
        }
    }

    const convRouterResponse = await fetch(`${serverAPI}conv/${userConvContent.convId}`, optionsConv);
    const convContent = await convRouterResponse.json();
    return convContent;
}

export const updateConv = async (userId: string, convInfo: ConvInfo, newMessage: string) => {
    // First we update the conversation in the userDB
    const optionsUser = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": convInfo.convId
        },
        body: JSON.stringify(convInfo)
    }
    const userRouterResponse = await fetch(`${serverAPI}user/${convInfo.convId}`, optionsUser);
    const userConvContent: ConvInfo = await userRouterResponse.json();

    const optionsConv = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": convInfo.convId
        },
        body: JSON.stringify({
            convInfo,
            newMessage
        })
    }

    const convRouterResponse = await fetch(`${serverAPI}conv/${userId}`, optionsConv);
    const convContent = await convRouterResponse.json();
    return convContent;
}