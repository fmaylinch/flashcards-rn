import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useRoute} from "@react-navigation/native"
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';

const CardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const [card, setCard] = useState(null);
  const route = useRoute()
  const id = route.params?.id;

  useEffect(() => {
    const config = {
      baseURL: BASE_URL,
      headers: {Authorization: "Bearer " + userInfo.token},
    };
    axios.create(config)
      .get(`cards/${id}`)
      .then(res => {
        let card = res.data;
        setCard(card);
      })
      .catch(e => {
        console.log(`cannot get card ${id}, error ${e}`);
      });
  }, []);

  return (
    <View style={styles.container}>      
      {card == null ?
        <Text style={styles.welcome}>Card {id} loading...</Text>
        :
        <Text style={styles.welcome}>{card.front} - {card.back}</Text>
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
