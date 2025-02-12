import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
}

const DatePickerModal = ({
  isVisible,
  onClose,
  onDateSelect,
  initialDate,
}: DatePickerModalProps) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
      onClose();
    }
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View className={`p-6 rounded-2xl w-2/2 ${Platform.OS === 'ios' ? 'bg-black' : ''}`}>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display= "inline"
          onChange={handleDateChange}
        />
      </View>
    </ReactNativeModal>
  );
};

export default DatePickerModal;
