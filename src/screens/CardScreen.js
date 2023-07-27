import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useRoute} from "@react-navigation/native"
import {AuthContext} from '../context/AuthContext';
import {Audio} from 'expo-av';
import Events from '../components/Events';
import {BASE_URL} from '../config';

const CardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);
  const route = useRoute()
  const [card, setCard] = useState(route.params?.card);
  const id = card._id;

  useEffect(() => {
    const screenId = "CardScreen";
    Events.register(screenId, "card-change", cardChange => {
      console.log(`${screenId} detected a card change`, cardChange.change);
      setCard(cardChange.card);
    });
    return () => Events.unregisterAll(screenId);
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
    return <View style={styles.audioButtons}>{ card.files.map(f =>
        <Text key={f} style={styles.itemButton} onPress={() => playSound(f)}>▶️</Text>)
      }</View>
  }


  function goToEdit() {
    navigation.navigate('EditCard', {card});
  }

  return (
    <View style={styles.container}>
      {card == null ?
        <Text style={styles.notes}>Card loading...</Text>
        : <>
            <Text style={styles.text}>{card.front}</Text>
            <Text style={styles.text}>{card.back}</Text>
            <Text style={styles.notes}>{card.notes}</Text>
            <Text style={styles.tags}>{card.tags.join(" ")}</Text>
            { playButtons(card) }
            <View style={styles.buttonContainer}>
              <Button title='Edit' color='#cc6' onPress={goToEdit}></Button>
            </View>
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
  audioButtons: {
    flexDirection: 'row',
    marginTop: 10
  },
  buttonContainer: {
    margin: 10,
  },
  text: {
    fontSize: 32,
    marginBottom: 15,
    textAlign: 'center',
    color: "#eee",
  },
  notes: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    color: '#bbb',
  },
  change: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#c9c',
  },
  tags: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    color: '#778',
  },
});

export default CardScreen;
