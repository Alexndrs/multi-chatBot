import "./tab.css";
import { useEffect, useState } from "react";
// import { UserContext } from "../context/user-context";
// import { AppContextProvider } from "../context/app-context";
// import { initialState } from "../reducers/reservation-reducer";

const Tab = () => {

    // const userContext = useContext(UserContext);
    // if (!userContext) {
    //     throw new Error("ProfilePage must be used within a UserContextProvider");
    // }
    // const { state } = userContext;
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement as HTMLElement;

            // Vérifie si l'utilisateur est dans un input, textarea, ou élément éditable
            const isTyping =
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.isContentEditable;

            if (!isTyping && (event.key === "t")) {
                setIsVisible((prev) => !prev);
            }

            if (!isTyping && isVisible && (event.key === "Escape")) {
                setIsVisible(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);



    return (
        <>
            <section className={`tab-container ${isVisible ? "" : "hidden"}`}>

            </section>
            <button onClick={() => setIsVisible(true)} className="tab-button">
                T
            </button>
        </>
    );
};

export default Tab;