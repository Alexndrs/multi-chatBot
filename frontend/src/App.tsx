import { UserProvider } from './contexts/userProvider';
import AppWrapper from './AppWrapper';
import { BrowserRouter } from "react-router-dom";
import { ConversationProvider } from './contexts/conversationProvider';

function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        <ConversationProvider>

          <AppWrapper />

        </ConversationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;