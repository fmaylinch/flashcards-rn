import { StatusBar } from 'expo-status-bar';
import Navigation from './src/components/Navigation';
import {AuthProvider} from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar backgroundColor="#06bcee" />
      <Navigation />
    </AuthProvider>
  );
}
