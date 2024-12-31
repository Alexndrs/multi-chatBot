export type ConvInfo = {
    convId: string;
    title: string;
    lastMessageDate: Date;
    numberOfMessages: number;
};

export type UserState = {
    email: string;
    token: string | null;
    convInfos: { [convId: string]: ConvInfo };
    theme: string;
};

export type UserAction =
    | { type: "UPDATE_USER"; payload: UserState }
    | { type: "RESET_USER" }
    | { type: "CHANGE_THEME" }
    | { type: "ADD_CONV"; newConv: ConvInfo };


export const initialConvInfo: ConvInfo = {
    convId: "",
    title: "",
    lastMessageDate: new Date(),
    numberOfMessages: 0
}

export const initialUserState: UserState = {
    email: "",
    token: null,
    convInfos: {},
    theme: "Dark"
};

export const userReducer = (userState: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "UPDATE_USER":
            return { ...userState, ...action.payload };
        case "RESET_USER":
            return initialUserState;
        case "CHANGE_THEME":
            return { ...userState, theme: userState.theme === "Dark" ? "Light" : "Dark" };
        case "ADD_CONV":
            return { ...userState, convInfos: { ...userState.convInfos, [action.newConv.convId]: action.newConv } }
        default:
            const _exhaustiveCheck: never = action;
            throw new Error(`Unknown action type: ${_exhaustiveCheck}`);
    }
};
