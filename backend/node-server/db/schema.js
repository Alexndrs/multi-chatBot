module.exports = {
    exampleUser: {
        userId: "u123",


        userInfo: {
            name: "Alex",
            email: "alex@mail.com",
            password: "hashed",
            preferences: {}
        },


        conversations: [
            {
                convId: "c1",
                convName: "Conversation 1",
                msgList: [
                    { msgId: "m1", role: "user", content: "Salut", timestamp: "..." },
                    { msgId: "m2", role: "bot", content: "Bonjour !", timestamp: "..." }
                ]
            }
        ]
    }
};