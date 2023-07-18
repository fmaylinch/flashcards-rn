import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useRoute} from "@react-navigation/native"
import {AuthContext} from '../context/AuthContext';
import {Audio} from 'expo-av';

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


  // https://docs.expo.dev/versions/latest/sdk/audio/#usage
  // TODO - refactor usage here and in ListScreen

  const [sound, setSound] = useState();

  async function playSound() {
    const uri = `${BASE_URL}/audio/${card.files[0]}`;
    console.log('Loading Sound from uri', uri);
    const { sound } = await Audio.Sound.createAsync({uri});
    setSound(sound);
    //console.log('Setting status callback');
    //sound.setOnPlaybackStatusUpdate(status => console.log(status));
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  return (
    <View style={styles.container}>
      {card == null ?
        <Text>Card {id} loading...</Text>
        : <>
            <Text style={styles.text}>{card.front}</Text>
            <Text style={styles.text}>{card.back}</Text>
            { card.files[0] ?
              <Button title="▶️ Play" onPress={playSound}/>
              : <Text>(No audio)</Text>
            }
          </>
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
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default CardScreen;
