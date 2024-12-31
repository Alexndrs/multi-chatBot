import "./convList.css";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user-context";
import { useContext } from "react";

const ConvList = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }

    const { state } = userContext;

    return (
        <div className="conv-list">
            {state.convInfos.map((convInfo) => (
                (convInfo.numberOfMessages > 0) ? (
                    <Link to={`/chat/${convInfo.id}`} className="link" key={convInfo.id}>
                        {convInfo.title}
                    </Link>
                ) : null
            ))}
        </div>
    );
};

export default ConvList;