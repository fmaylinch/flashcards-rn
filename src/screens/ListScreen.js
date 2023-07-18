import React, {useContext, useState, useEffect} from 'react';
import {SafeAreaView, Text, StyleSheet, View, FlatList, TextInput} from 'react-native';
import {Audio} from 'expo-av';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {BASE_URL} from '../config';

const ListScreen = ({navigation}) => {
  const {userInfo} = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);

  useEffect(() => {
    const config = {
      baseURL: BASE_URL,
      headers: {Authorization: "Bearer " + userInfo.token},
    };
    axios.create(config)
      .get(`cards`)
      .then(res => {
        let cards = res.data;
        shuffleArray(cards);
        cards.forEach(card => {
          card.displayText = pickCardText(card);
          card.searchText = `${card.front} ${card.back} ${card.tags}`.toLowerCase();
          if (card.files.length > 0) { // randomly choose first file to play
            card.fileIndex = Math.floor(Math.random() * card.files.length);
          }
        });
        setFilteredDataSource(cards);
        setMasterDataSource(cards);
      })
      .catch(e => {
        console.log(`cannot get cards, error ${e}`);
      });
  }, []);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const searchFilterFunction = (text) => {
    if (text) {
      const textLower = text.toLowerCase();
      const filtered = masterDataSource.filter(card => card.searchText.indexOf(textLower) >= 0);
      setFilteredDataSource(filtered);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  function pickCardText(card) {
    const showFront = card.orientation == 1 || // 1 means front
      // 2 means both, so we choose randomly (3 means back)
      (card.orientation == 2 && Math.floor(Math.random() * 2) == 0);
    return showFront ? card.front : card.back;
  }

  const ItemView = ({ item }) => {
    const card = item;
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.item} onPress={() => openCard(card)}>{card.displayText}</Text>
        <Text style={styles.itemButton} onPress={() => playSound(card)}>▶️</Text>
      </View>
    );
  };

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };

  const openCard = (card) => {
    navigation.navigate('Card', {id: card._id});
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
          style={styles.textInputStyle}
          onChangeText={(text) => searchFilterFunction(text)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="Search Here"
        />
        <FlatList
          data={filteredDataSource}
          keyExtractor={(item, index) => index.toString()}
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
