import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { UserContextProvider } from "./context/user-context.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContextProvider>
      <App />
    </ UserContextProvider>
  </StrictMode>,
)