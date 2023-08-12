import {useContext, useState} from 'react';
import {useRoute} from "@react-navigation/native"
import {Button, StyleSheet, Text, View, TextInput, Alert} from 'react-native';
import Slider from '@react-native-community/slider';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';
import {emitEvent} from '../components/Events';

const EditCardScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const route = useRoute()
  const card = route.params?.card;

  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [orientation, setOrientation] = useState(card.orientation);
  const [notes, setNotes] = useState(card.notes);
  const [tags, setTags] = useState(card.tags.join(" "));
  const [message, setMessage] = useState('');
  
  async function updateCard() {

    // Required fields
    if (!front.trim() || !back.trim()) {
        setMessage("Japanese and English are required");
        return;
    }

    // TODO - this is also used in CreateCardScreen
    const tagsArray = tags.trim().toLowerCase().split(/[ ,.]+/).filter(x => x);

    const config = {
        baseURL: BASE_URL,
        headers: {Authorization: "Bearer " + userInfo.token},
      };

    const cardUpdate = {
        front: front.trim(),
        back: back.trim(),
        orientation: orientation,
        notes: notes.trim(),
        tags: tagsArray,
        tts: card.tts
    };

    setMessage("Updating card")
    axios.create(config)
        .put(`cards/${card._id}`, cardUpdate)
        .then(res => {
          let card = res.data;
          console.log("Updated card", card);
          setMessage("Card updated!");
          //navigation.navigate('Card', {card});
          emitEvent("card-change", {card, change: "update"});
        })
        .catch(e => {
          // TODO - the error message is not well received
          console.log(`Cannot update card`, JSON.stringify(e));
          setMessage("Error: " + JSON.stringify(e))
        });
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
      .delete(`cards/${card._id}`)
      // TODO - reload list, so this card doesn't appear
      .then(() => {
        setMessage("Card deleted!");
        // navigation.navigate('Card', {card});
        emitEvent("card-change", {card, change: "delete"});
      })
      .catch(e => {
        console.log(`cannot delete card ${card._id}, error ${e}`);
        Alert.alert('Could not delete card', e);
      });
  }

  function orientationLabel() {
    switch (orientation) {
        case 1: return "front";
        case 2: return "both";
        case 3: return "back";
        default: return "unexpected value: " + orientation;
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
        <TextInput
          placeholder="English"
          style={styles.input}
          multiline={true}
          value={back}
          onChangeText={v => setBack(v)}
        />

        <Text>Orientation: {orientationLabel()}</Text>

        <Slider
            style={{marginBottom: 12}}
            minimumValue={1}
            maximumValue={3}
            step={1}
            value={orientation}
            minimumTrackTintColor="#bbb"
            maximumTrackTintColor="#bbb"
            onSlidingComplete={v => setOrientation(v)}
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
  
        <View style={styles.buttonContainer}>
          <Button title='Update' onPress={updateCard}></Button>
        </View>

        <View style={styles.buttonContainer}>
          <Button title='Delete' color='red' onPress={confirmDeleteCard}></Button>
        </View>

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

export default EditCardScreen;
