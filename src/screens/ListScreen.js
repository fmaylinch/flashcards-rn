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
        //console.log("cards from API");
        //console.log(cards);
        cards.forEach(card => card.displayText = pickCardText(card));
        setFilteredDataSource(cards);
        setMasterDataSource(cards);
      })
      .catch(e => {
        console.log(`cannot get cards, error ${e}`);
      });
  }, []);

  const searchFilterFunction = (text) => {
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (card) {
        // Applying filter for the inserted text in search bar
        const itemData = `${card.front} ${card.back}`.toLowerCase();
        const textData = text.toLowerCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
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
    <SafeAreaView style={{ flex: 1 }}>
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
    fontSize: 18,
    backgroundColor: "#334",
    flex: 1,
  },
  itemButton: {
    padding: 10,
    color: "#eee",
    fontSize: 18,
    backgroundColor: "#334",
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
