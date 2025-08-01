import { UserProvider } from './contexts/userProvider';
import { ConvProvider } from './contexts/convProvider';
import AppWrapper from './AppWrapper';
import { BrowserRouter } from "react-router-dom";
import { ConversationProvider } from './contexts/conversationProvider';

function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        {/* <ConvProvider> */}
        <ConversationProvider>

          <AppWrapper />
          {/* </ConvProvider> */}

        </ConversationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;