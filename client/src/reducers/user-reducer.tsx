export type UserState = {
    email: string;
    token: string | null;
    convInfos: { id: string; title: string, lastMessageDate: Date; numberOfMessages: number }[];
    theme: string;
};

export type UserAction =
    | { type: "UPDATE_USER"; payload: UserState }
    | { type: "RESET_USER" }
    | { type: "CHANGE_THEME" }
    | { type: "ADD_CONV"; newConv: { id: string, title: string, date: Date } };

export const initialUserState: UserState = {
    email: "",
    token: null,
    convInfos: [],
    theme: "Dark"
};

export const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "UPDATE_USER":
            return { ...state, ...action.payload };
        case "RESET_USER":
            return initialUserState;
        case "CHANGE_THEME":
            return { ...state, theme: state.theme === "Dark" ? "Light" : "Dark" };
        case "ADD_CONV":
            return { ...state, convInfos: [...state.convInfos, { id: action.newConv.id, title: action.newConv.title, lastMessageDate: action.newConv.date, numberOfMessages: 0 }] };
        default:
            const _exhaustiveCheck: never = action;
            throw new Error(`Unknown action type: ${_exhaustiveCheck}`);
    }
};
