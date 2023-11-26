import React, {useContext, useState} from 'react';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const OptionsScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Button
          title="Download cards"
          onPress={downloadCards}
        />
      </View>
    </View>
  );
};

function downloadCards() {
  console.log("Downloading cards (TODO)");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '80%',
  },
});

export default OptionsScreen;
