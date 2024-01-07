import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, TextInput, CheckBox} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL, OPENAI_API_KEY} from '../config';
import {emitEvent} from '../components/Events';
import {Audio} from 'expo-av';
import OpenAI from "openai";

const CreateCardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const [front, setFront] = useState('');
  const [mainWords, setMainWords] = useState('');
  const [back, setBack] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');

  // TODO - enter key in OptionsScreen
  const openai = new OpenAI({apiKey: OPENAI_API_KEY});

  async function createCard() {

    // Required fields
    if (!front.trim() || !back.trim()) {
        setMessage("Japanese and English are required");
        return;
    }

    // TODO - this is also used in EditCardScreen
    const mainWordsArray = mainWords.trim().split(/[ ,.]+/).filter(x => x);
    const tagsArray = tags.trim().toLowerCase().split(/[ ,.]+/).filter(x => x);

    // TODO - refactor these configs
    const config = {
        baseURL: BASE_URL,
        headers: {Authorization: "Bearer " + userInfo.token},
      };

    const card = {
        front: front.trim(),
        mainWords: mainWordsArray,
        back: back.trim(),
        notes: notes.trim(),
        tags: tagsArray,
        tts: true
    };

    setMessage("Creating card")
    axios.create(config)
        .post(`cards`, card)
        .then(res => {
          let createdCard = res.data;
          console.log("Created card", createdCard);
          setMessage("Card just created: " + createdCard.front);
          emitEvent("card-change", {card: createdCard, change: "create"});
        })
        .catch(e => {
          console.log(`Cannot create card, error ${e}`);
          setMessage("Error: " + JSON.stringify(e))
        });
  }

  function clearFields() {
    setFront("");
    setBack("");
    setNotes("");
    setTags("");
    setMessage("");
  }

    // https://docs.expo.dev/versions/latest/sdk/audio/#usage
  // TODO - refactor usage here and in CardScreen

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

  // Optimize, to avoid generating the same audio multiple times
  const [testCard, setTestCard] = useState();

  function listen() {

    // TODO - refactor these configs
    const config = {
      baseURL: BASE_URL,
      headers: {Authorization: "Bearer " + userInfo.token},
    };

    const card = {
        front: front.trim() // we only need this for test listen
    };

    // Audio already generated
    if (testCard && testCard.front == card.front) {
      setMessage("Playing again: " + testCard.front);
      playSound(testCard.files[0]);
      return;
    }

    setMessage("Generating test audio for card")
    axios.create(config)
        .post(`cards/tts`, card)
        .then(res => {
          let testCard = res.data;
          setTestCard(testCard);
          console.log("Test card", testCard);
          setMessage("Playing: " + testCard.front);
          playSound(testCard.files[0])
        })
        .catch(e => {
          console.log(`Cannot test audio, error ${e}`);
          setMessage("Error: " + JSON.stringify(e))
        });
  }

  async function analyse() {
      console.log("Analysing: " + front);
      try {
          // I need to call this via VPN
          const completion = await openai.chat.completions.create({
              messages: [{
                  role: "user",
                  content: `From the Japanese sentence "${front}", ` +
                    'I want the English translation and the main words in Japanese (omit particles and markers).' +
                    'Respond with a JSON with fields "translation" and "words".'
              }],
              model: "gpt-4"
          });
          setNotes(JSON.stringify(completion.choices[0])); // TODO - to see the raw output
          const json = completion.choices[0].message.content;
          const data = JSON.parse(json);
          if (data) {
              setBack(data.translation);
              setMainWords(data.mainWords.join(' '));
          }
      } catch (e) {
          setNotes("error from OpenAI");
          console.log("Error when calling openai.chat.completions.create", e);
      }
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>

        <TextInput
          placeholder="Japanese"
          style={styles.input}
          multiline={true}
          value={front}
          onChangeText={v => setFront(v)}
        />

        <View style={styles.buttonRow}>
          <Button title="Listen"
                  onPress={listen}
          />
          <Button title="Analyse"
                  onPress={analyse}
          />
        </View>

        <TextInput
          placeholder="English"
          style={styles.input}
          multiline={true}
          value={back}
          onChangeText={v => setBack(v)}
        />
        <TextInput
          placeholder="Notes"
          style={styles.input}
          multiline={true}
          value={notes}
          onChangeText={v => setNotes(v)}
        />
        <TextInput
          placeholder="Main words"
          style={styles.input}
          value={mainWords}
          onChangeText={v => setMainWords(v)}
        />
        <TextInput
          placeholder="Tags"
          style={styles.input}
          value={tags}
          onChangeText={v => setTags(v)}
        />
  
        <Button title="Create"
          onPress={createCard}
        />

        <Text style={styles.message}>{message}</Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  wrapper: {
    width: '80%',
    paddingTop: 40,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 18,
  },
  message: {
    marginTop: 10,
    color: 'grey',
  }
});

export default CreateCardScreen;
