import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  onImagePicked: (uri: string) => void;
}

const ImagePickerButton: React.FC<Props> = ({ onImagePicked }) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      className='bg-[#2A7C76] p-5 rounded-md item-center'
    >
      <Text style={{ color: 'white', fontSize: 16 }}>Pick Image for OCR</Text>
    </TouchableOpacity>
  );
};

export default ImagePickerButton;
