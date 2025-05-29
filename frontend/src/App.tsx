import Layout from './components/layout';
import AppContent from './AppContent';
import { UserProvider } from './contexts/userProvider';
import { ConvProvider } from './contexts/convProvider';

function App() {

  return (
    <UserProvider>
      <ConvProvider>
        <Layout>
          <AppContent />
        </Layout>
      </ConvProvider>
    </UserProvider>
  );
}

export default App;