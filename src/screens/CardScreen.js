import {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, Linking} from 'react-native';
import {useRoute} from "@react-navigation/native"
import {Audio} from 'expo-av';
import {registerEvent} from '../components/Events';
import {BASE_URL} from '../config';

const CardScreen = ({navigation}) => {
  const route = useRoute()
  const [card, setCard] = useState(route.params.card);
  const [message, setMessage] = useState("");

  registerEvent("CardScreen", "card-change", cardChange => {
    setCard(cardChange.card);
    setMessage(`Card change: ${cardChange.change}`)
  });
  
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

  function japaneseView() {

    function splitStringByArray(str, words) {
      let result = [];
  
      let currentIndex = 0;
  
      for (let i = 0; i < words.length; i++) {
          const [word, base] = words[i].split(":");
          let splitIndex = str.indexOf(word, currentIndex);
  
          if (splitIndex !== -1) {
              if (splitIndex > currentIndex) {
                  result.push({word: str.substring(currentIndex, splitIndex), inArray: false});
              }
              result.push({word, link: base ? base : word});
              currentIndex = splitIndex + word.length;
          }
      }
  
      if (currentIndex < str.length) {
          result.push({word: str.substring(currentIndex)});
      }
  
      return result;
    }

    function textViewFor(part) {
      if (part.link) {
        return <Text style={styles.textMainPart} onPress={() => openNihongo(part.link)}>{part.word}</Text>;
      } else {
        return <Text style={styles.textPart}>{part.word}</Text>;
      }
    }
    
    if (!card.mainWords || card.mainWords.length == 0) {
      return <Text style={styles.text} onPress={() => openNihongo(card.front)}>{card.front}</Text>;
    }

    const parts = splitStringByArray(card.front, card.mainWords);
    return <View style={styles.textParts}>{ parts.map(textViewFor) }</View>;
  }

  function goToEdit() {
    navigation.navigate('EditCard', {card});
  }

  function openNihongo(text) {
    const url = "https://nihongo-app.com/dictionary/word/" + text;
    Linking.openURL(url);
  }

  return (
    <View style={styles.container}>
      { japaneseView() }
      <Text style={styles.text}>{card.back}</Text>
      <Text style={styles.notes}>{card.notes}</Text>
      <Text style={styles.tags}>{card.tags.join(" ")}</Text>
      { playButtons(card) }
      <View style={styles.buttonContainer}>
        <Button title='Edit' color='#cc6' onPress={goToEdit}></Button>
      </View>
      <Text style={styles.message}>{message}</Text>
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
  textPart: {
    fontSize: 32,
    color: "#777",
  },
  textMainPart: {
    fontSize: 32,
    color: "#eee",
  },
  textParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  notes: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    color: '#bbb',
  },
  message: {
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
