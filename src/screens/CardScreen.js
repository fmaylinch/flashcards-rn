import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useRoute} from "@react-navigation/native"
import {AuthContext} from '../context/AuthContext';

const CardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const [card, setCard] = useState(null);
  const route = useRoute()
  const id = route.params?.id;

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/' + id)
      .then((response) => response.json())
      .then((responseJson) => {
        setCard(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <View style={styles.container}>      
      {card == null ?
        <Text style={styles.welcome}>Card {id} loading...</Text>
        :
        <Text style={styles.welcome}>{card.title}</Text>
      }
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

export default CardScreen;
