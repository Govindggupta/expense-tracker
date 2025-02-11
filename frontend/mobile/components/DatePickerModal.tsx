import React, { useState } from 'react';
import { View, Text } from 'react-native';
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
      <View className="bg-white p-6 rounded-2xl w-4/5">
        <Text className="text-lg font-semibold text-center mb-4">Select Date</Text>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      </View>
    </ReactNativeModal>
  );
};

export default DatePickerModal;
