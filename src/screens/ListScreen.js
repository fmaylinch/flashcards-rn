import React, {useContext, useState, useEffect} from 'react';
import {SafeAreaView, Text, StyleSheet, View, FlatList, TextInput, Button} from 'react-native';
import {Audio} from 'expo-av';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';

const ORIENTATION_FRONT = 1;
const ORIENTATION_BOTH = 2;
const ORIENTATION_BACK = 3;
const ORIENTATION_HIDE = 4;

const ListScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [forcedOrientation, setForcedOrientation] = useState(null);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);

  useEffect(() => {
    // TODO - refactor these calls
    console.log("Loading list of cards from API");
    const config = {
      baseURL: BASE_URL,
      headers: {Authorization: "Bearer " + userInfo.token},
    };
    axios.create(config)
      .get(`cards`)
      .then(res => {
        let cards = res.data;
        prepareCards(cards);
        setMasterDataSource(cards);
        // We need to send cards here, because otherwise we try to filter cards
        // before masterDataSource is updated. We could also useEffect to react
        // to changes on masterDataSource (and maybe changes to search too?).
        applySearch(search, cards);
      })
      .catch(e => {
        console.log(`cannot get cards, error ${e}`);
      });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => navigation.navigate('CreateCard')} title="Add" />
      ),
    });
  }, [navigation]);

  function prepareCards(cards) {
    cards.forEach(card => {
      card.displayText = pickCardText(card, card.orientation);
      const tagsWithDots = card.tags.map(tag => tag + ".");
      card.searchText = `${card.front} ${card.back} ${tagsWithDots} ${card.notes}`.toLowerCase();
      if (card.files.length > 0) { // randomly choose first file to play
        card.fileIndex = Math.floor(Math.random() * card.files.length);
      }
    });
    sort(cards, c => c.updated, -1);

  }

  const applySearch = (text, cards) => {
    if (text) {
      const cleanText = text.toLowerCase().trim();
      const commands = cleanText.split(/ *: */);

      const searchTerms = commands[0].split(/ +/); // first command is filter
      let filtered = filterCards(cards, searchTerms);

      filtered = processCommands(filtered, commands.slice(1)); // other commands
      
      setFilteredDataSource(filtered);
    } else {
      setForcedOrientation(null);
      setFilteredDataSource(cards);
    }
    setSearch(text);
  };

    // Add special list items
    function addDummyItems(cards) {
    const copy = cards.slice();
    const amount = cards.length == masterDataSource.length ?
      `all ${cards.length}` : `${cards.length} of ${masterDataSource.length}`;
    copy.unshift({_id: "info", dummy: true, info: `Showing ${amount} cards`});
    copy.push({_id: "last", dummy: true}); // just to add margin at the end
    return copy;
  }

  function filterCards(cards, searchTerms) {
      return cards.filter(card => {
        for (const term of searchTerms) {
          //console.log(`Searching ${term} in ${card.searchText}`)
          if (card.searchText.indexOf(term) < 0) {
            return false; // some term not found
          }
        }
        return true;
      });
  }

  function processCommands(cards, commands) {
    let orientation = null;
    for (const command of commands) {
      switch (command) {

        // orientation
        case 'jp':
          orientation = ORIENTATION_FRONT;
          break;
        case 'en':
          orientation = ORIENTATION_BACK;
          break;
        case 'hide':
          orientation = ORIENTATION_HIDE;
          break;

        // sort
        case 'sjp':
          sort(cards, c => c.front);
          break;
        case 'sen':
          sort(cards, c => c.back.toLowerCase());
          break;
        case 'rnd':
          shuffleArray(cards);
          break;

        default:
          break;
      }
    }
    setForcedOrientation(orientation);
    return cards;
  }

  function sort(cards, fieldGetter, order = 1) {
    cards.sort(( a, b ) => {
      if ( fieldGetter(a) > fieldGetter(b) ) return order;
      if ( fieldGetter(a) < fieldGetter(b) ) return -order;
      return 0;
    })
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function pickCardText(card, orientation) {
    const showFront = orientation == ORIENTATION_FRONT ||
      // 2 means both, so we choose randomly (3 means back)
      (orientation == ORIENTATION_BOTH && Math.floor(Math.random() * 2) == 0);
    return showFront ? card.front : card.back;
  }

  function pickDynamicCardText(card) {
    if (forcedOrientation == ORIENTATION_HIDE) return "";
    return forcedOrientation ? pickCardText(card, forcedOrientation) : card.displayText;
  }

  const ItemView = ({ item }) => {
    const card = item;
    if (card.dummy) {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.info}>{card.info}</Text>
        </View>);
    }
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.item} onPress={() => openCard(card)}>{pickDynamicCardText(card)}</Text>
        <Text style={styles.itemButton} onPress={() => playSound(card)}>▶️</Text>
      </View>
    );
  };

  const ItemSeparatorView = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#667',
        }}
      />
    );
  };

  const openCard = (card) => {
    navigation.navigate('Card', {card});
  };


  // https://docs.expo.dev/versions/latest/sdk/audio/#usage
  // TODO - refactor usage here and in CardScreen

  const [sound, setSound] = useState();

  async function playSound(card) {
    const uri = `${BASE_URL}/audio/${card.files[card.fileIndex]}`;
    card.fileIndex = (card.fileIndex + 1) % card.files.length; // rotate file to play next
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#334' }}>
      <View style={styles.container}>
        <TextInput
          clearButtonMode='always'
          style={styles.textInputStyle}
          onChangeText={(text) => applySearch(text, masterDataSource)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="word tag. : jp : rnd"
        />
        <FlatList
          data={addDummyItems(filteredDataSource)}
          keyExtractor={(card, index) => card._id}
          ItemSeparatorComponent={ItemSeparatorView}
          renderItem={ItemView}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334',
  },
  item: {
    padding: 10,
    color: "#eee",
    fontSize: 24,
    flex: 1,
  },
  info: {
    padding: 10,
    color: "#667",
    fontSize: 18,
    flex: 1,
  },
  itemButton: {
    padding: 10,
    color: "#eee",
    fontSize: 24,
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
  },
  textInputStyle: {
    borderWidth: 1,
    paddingLeft: 20,
    paddingVertical: 7,
    margin: 5,
    fontSize: 18,
    borderColor: '#eee',
    backgroundColor: "#eee",
  },
});

export default ListScreen;
