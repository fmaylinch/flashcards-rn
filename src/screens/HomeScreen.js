import {useContext} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';

const HomeScreen = ({navigation}) => {
  const {userInfo, isLoading, logout} = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <Text style={styles.welcome}>Welcome {userInfo.username}</Text>
      <Button title="Flashcards" onPress={() => navigation.navigate('List', {local: false})} />
      <Button title="Flashcards (local)" onPress={() => navigation.navigate('List', {local: true})} />
      <Button title="Options" onPress={() => navigation.navigate('Options')} />
      <Button title="Logout" color="red" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default HomeScreen;
