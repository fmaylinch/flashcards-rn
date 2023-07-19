import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, Alert} from 'react-native';
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
    // TODO - refactor these calls
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

  async function playSound(file) {
    const uri = `${BASE_URL}/audio/${file}`;
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

  function playButtons(card) {
    if (card.files.length == 0) {
      return <Text>(No audio)</Text>;
    }
    return <View style={styles.buttonView}>{ card.files.map(f =>
        <Text key={f} style={styles.itemButton} onPress={() => playSound(f)}>▶️</Text>)
      }</View>
  }

  function confirmDeleteCard() {
    // https://reactnative.dev/docs/alert
    Alert.alert('Delete Card', 'Do you want to delete the card?', [
      {text: 'No', style: 'cancel'},
      {text: 'Yes, delete it', onPress: deleteCard, style: 'destructive'},
    ]);
  }

  function deleteCard() {
    // TODO - refactor these calls
    const config = {
      baseURL: BASE_URL,
      headers: {Authorization: "Bearer " + userInfo.token},
    };
    axios.create(config)
      .delete(`cards/${id}`)
      // TODO - reload list, so this card doesn't appear
      .then(() => navigation.goBack())
      .catch(e => {
        console.log(`cannot delete card ${id}, error ${e}`);
        Alert.alert('Could not delete card', e);
      });
  }

  return (
    <View style={styles.container}>
      {card == null ?
        <Text>Card {id} loading...</Text>
        : <>
            <Text style={styles.text}>{card.front}</Text>
            <Text style={styles.text}>{card.back}</Text>
            <Text style={styles.tags}>{card.tags.join(" ")}</Text>
            { playButtons(card) }
            <Button title='Delete' color='red' onPress={confirmDeleteCard}></Button>
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
    backgroundColor: '#334',
    padding: 20,
  },
  itemButton: {
    padding: 10,
    color: "#eee",
    fontSize: 30,
  },
  buttonView: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 30,
    marginBottom: 8,
    textAlign: 'center',
    color: "#eee",
  },
  tags: {
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    color: '#778',
  },
});

export default CardScreen;
