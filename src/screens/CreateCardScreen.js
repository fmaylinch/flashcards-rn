import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, TextInput, CheckBox} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';

const CreateCardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [cardsCreated, setCardsCreated] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button onPress={() => {
          if (cardsCreated.length > 0) {
            console.log("Going back with cards created", cardsCreated);
            navigation.navigate("List", {cardsChanged: cardsCreated})
          } else {
            console.log("Going back without cards created");
            navigation.goBack();
          }
        }} title="Back to List" />
      ),
    });
  }, [navigation, cardsCreated]);

  async function createCard() {

    // Required fields
    if (!front.trim() || !back.trim()) {
        setMessage("Japanese and English are required");
        return;
    }

    // TODO - this is also used in EditCardScreen
    const tagsArray = tags.trim().toLowerCase().split(/[ ,.]+/).filter(x => x);

    const config = {
        baseURL: BASE_URL,
        headers: {Authorization: "Bearer " + userInfo.token},
      };

    const card = {
        front: front.trim(),
        back: back.trim(),
        notes: notes.trim(),
        tags: tagsArray,
        tts: true
    };

    setMessage("Creating card")
    axios.create(config)
        .post(`cards`, card)
        .then(res => {
          let card = res.data;
          console.log("Created card", card);
          setMessage("Card created: " + card.front);
          card.change = "create"; // TODO - find a cleaner way to indcate change type
          setCardsCreated([...cardsCreated, card]);
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
          placeholder="Tags"
          style={styles.input}
          value={tags}
          onChangeText={v => setTags(v)}
        />
  
        <Button title="Create"
          onPress={createCard}
        />

        <Button title="Clear" color="red"
          onPress={clearFields}
        />

        <Text style={styles.message}>{message}</Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
