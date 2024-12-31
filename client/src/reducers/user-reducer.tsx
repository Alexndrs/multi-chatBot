export type UserState = {
    email: string;
    token: string | null;
    theme: string;
};

export type UserAction =
    | { type: "UPDATE_USER"; payload: UserState }
    | { type: "RESET_USER" }
    | { type: "CHANGE_THEME" };

export const initialUserState: UserState = {
    email: "",
    token: null,
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
        default:
            const _exhaustiveCheck: never = action;
            throw new Error(`Unknown action type: ${_exhaustiveCheck}`);
    }
};
