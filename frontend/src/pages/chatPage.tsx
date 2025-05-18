import { MyButton, ProfileCard, ImageGallery, Form, Modal } from "../components/exercice";


const ChatPage: React.FC = () => {

    return (
        <div className="flex flex-col overflow-auto h-screen bg-indigo-950">
            <h1 className="text-3xl font-medium text-center text-white">
                Hello world
            </h1>
            <MyButton />
            <ProfileCard name="John Doe" bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit." avatarUrl="logo.png" />
            <ImageGallery images={["poke1.png", "poke2.png", "poke3.png", "poke4.png", "poke5.png", "poke6.png"]} />
            <Form />
            <Modal />
        </div>
    );
};

export default ChatPage;