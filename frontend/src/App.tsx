import Layout from './components/layout';
import AppContent from './AppContent';
import { UserProvider } from './contexts/userProvider';
// import UIPage from './pages/uiPage';

function App() {
  // const handleLogin = async () => {

  //   // Check if the user is already logged in
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     console.log('User is already logged in');
  //     return;
  //   }
  //   try {
  //     const data = await loginUser("alex@example.com", "password123");
  //     console.log('Login successful:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('Error during login:', error);
  //   }
  // };

  // const fetchConvMeta = async () => {
  //   try {
  //     const conversationsMeta = await getUserConversations();
  //     console.log('User conversations:', conversationsMeta);
  //     return conversationsMeta;
  //   } catch (error) {
  //     console.error('Error fetching conversations:', error);
  //   }
  // };

  // const fetchConv = async (convId: string) => {
  //   try {
  //     const conversation = await getConversation(convId);
  //     console.log('Conversation details:', conversation);
  //     return conversation;
  //   } catch (error) {
  //     console.error('Error fetching conversation:', error);
  //   }
  // }


  // // Call handleLogin when the component mounts
  // useEffect(() => {
  //   handleLogin();
  //   fetchConvMeta()
  //     .then(conversations => {
  //       if (conversations && conversations.length > 0) {
  //         // Fetch details for the first conversation as an example
  //         return fetchConv(conversations[0].convId);
  //       }
  //     })
  //     .catch(error => console.error('Error in useEffect:', error));
  // }
  //   , []);

  return (
    <UserProvider>
      <Layout>
        <AppContent />
        {/* <UIPage /> */}
      </Layout>
    </UserProvider>
  );
}

export default App;