import "./convList.css";
import { Link } from "react-router-dom";

const convs = [
    { url: "/chat/idConv1", name: "conv1" },
    { url: "/chat/idConv2", name: "conv2" },
    { url: "/chat/idConv3", name: "conv3" },
]

for (let i = 4; i < 100; i++) {
    convs.push({ url: `/chat/idConv${i}`, name: `conv${i}` });
}

const ConvList = () => {
    return (
        <div className="conv-list">
            {convs.map((conv) => {
                return (
                    <Link to={conv.url} className="link" key={conv.name}>
                        {conv.name}
                    </Link>
                );
            })}
        </div>
    );
};

export default ConvList;