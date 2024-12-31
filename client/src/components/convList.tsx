import "./convList.css";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user-context";
import { useContext } from "react";
import { ConvInfo } from "../reducers/user-reducer";

const ConvList = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }
    const { userState }: { userState: { convInfos: { [key: string]: ConvInfo } } } = userContext;

    return (
        <div className="conv-list">
            {Object.keys(userState.convInfos).map((convId) => {
                const convInfo = userState.convInfos[convId];
                return (convInfo.numberOfMessages > 0) ? (
                    <Link to={`/chat/${convInfo.convId}`} className="link" key={convId}>
                        {convInfo.title}
                    </Link>
                ) : null
            })}
        </div>
    );
};

export default ConvList;