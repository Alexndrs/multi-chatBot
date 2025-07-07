import { UserProvider } from './contexts/userProvider';
import { ConvProvider } from './contexts/convProvider';
import AppWrapper from './AppWrapper';


function App() {

  return (
    <UserProvider>
      <ConvProvider>
        <AppWrapper />
      </ConvProvider>
    </UserProvider>
  );
}

export default App;