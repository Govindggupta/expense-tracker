import React, { useState } from 'react';
import { View, Image } from 'react-native';
import ImagePickerButton from '@/components/ImagePickerButton';
import OCRProcessor from '@/components/OCRProcessor';
import DisplayResult from '@/components/DisplayResult';
import ExpenseExtractor from '@/components/ExpenseExtractor';

const Scan = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <ImagePickerButton onImagePicked={setImageUri} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 10 }} />
      )}

      {imageUri && <OCRProcessor imageUri={imageUri} onExtractedText={setExtractedText} />}

      {/* {extractedText && <DisplayResult extractedText={extractedText} />} */}

      {extractedText && <ExpenseExtractor extractedText={extractedText} />}
    </View>
  );
};

export default Scan;
