import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface Props {
  imageUri: string;
  onExtractedText: (text: string) => void;
}

const OCRProcessor: React.FC<Props> = ({ imageUri, onExtractedText }) => {
  const [loading, setLoading] = useState(false);

  const processImage = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('apikey', 'K83324007388957');
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      const extractedText = result.ParsedResults[0]?.ParsedText || 'No text found';
      onExtractedText(extractedText);
    } catch (error) {
      console.error('OCR Error:', error);
      onExtractedText('Failed to extract text.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (imageUri) {
      processImage();
    }
  }, [imageUri]);

  return <View>{loading && <ActivityIndicator size="large" color="#2A7C76" />}</View>;
};

export default OCRProcessor;
