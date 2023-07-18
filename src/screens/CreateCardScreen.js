import {useContext, useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View, TextInput, CheckBox} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';

const CreateCardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('Enter data');
  
  async function createCard() {
    const tagsArray = tags.trim().toLowerCase().split(/[ ,]+/);

    const config = {
        baseURL: BASE_URL,
        headers: {Authorization: "Bearer " + userInfo.token},
      };

    const card = {
        front: front.trim(),
        back: back.trim(),
        tags: tagsArray,
        tts: true
    };

    if (!card.front || !card.back) {
        return;
    }

    setMessage("Creating card")
    axios.create(config)
        .post(`cards`, card)
        .then(res => {
          let card = res.data;
          console.log("Created card", card);
          setMessage("Card created!");
        })
        .catch(e => {
          console.log(`Cannot create card, error ${e}`);
          setMessage("Error: " + JSON.stringify(e))
        });
  }

  function clearFields() {
    setFront("");
    setBack("");
    setTags("");
    setMessage("Enter data");
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>

        <Text style={styles.message}>{message}</Text>
  
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
    marginBottom: 10,
    color: 'grey',
  }
});

export default CreateCardScreen;
