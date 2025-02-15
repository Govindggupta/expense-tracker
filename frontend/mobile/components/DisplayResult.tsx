import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  extractedText: string;
}

const DisplayResult: React.FC<Props> = ({ extractedText }) => {
  return (
    <View
      style={{
        padding: 10,
        backgroundColor: '#e9ecef',
        borderRadius: 5,
        marginTop: 10,
      }}
    >
      <Text>{extractedText}</Text>
    </View>
  );
};

export default DisplayResult;
