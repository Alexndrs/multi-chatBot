import { UserProvider } from './contexts/userProvider';
import { ConvProvider } from './contexts/convProvider';
import AppWrapper from './AppWrapper';
import { BrowserRouter } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        <ConvProvider>
          <AppWrapper />
        </ConvProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;