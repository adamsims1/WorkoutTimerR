import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, TextInput,Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutTimer from '@/components/WorkoutTimer';
import { useTheme } from '@/ThemeContext';
import CustomText from '@/components/CustomText';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';

import { Colors } from 'react-native/Libraries/NewAppScreen';


const HomeScreen = () => {
  const { theme, toggleTheme } = useTheme();
  interface Workout {
    name: string;
    sets: number;
    exerciseTime: number;
    restTime: number;
  }

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<number | null>(null);
  const [workoutDetails, setWorkoutDetails] = useState({name: '', sets: '', exerciseTime: '', restTime: '' });
  const [newWorkout, setNewWorkout] = useState({ name: 'Nové cvičení', sets: '3', exerciseTime: '30', restTime: '10' });




  useEffect(() => {
    const loadWorkouts = async () => {
      const storedWorkouts = await AsyncStorage.getItem('workouts');
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      }
    };
    loadWorkouts();
  }, []);

  const saveWorkout = async (workout: { name: string; sets: number; exerciseTime: number; restTime: number }) => {
    if (!workout.name || !workout.sets || !workout.exerciseTime || !workout.restTime) {
      
      return;
    }
    try {
      const newWorkouts = [...workouts];
      if (editingWorkout !== null) {
        newWorkouts[editingWorkout] = workout;
        setEditingWorkout(null);
      } else {
        newWorkouts.push(workout);
      }
      setWorkouts(newWorkouts);
      await AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
    } catch (error) {
      console.error('Chyba při ukládání cvičení:', error);
    }
  };

  const confirmDelete = (index:number) => {
    const newWorkouts = workouts.filter((_, i) => i !== index);
    AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
    setWorkouts(newWorkouts);
  };

  const editWorkout = (index:number) => {
    setEditingWorkout(index);
    setWorkoutDetails({
      name: workouts[index].name,
      sets: workouts[index].sets.toString(),
      exerciseTime: workouts[index].exerciseTime.toString(),
      restTime: workouts[index].restTime.toString(),
    });
  };

  const openWorkout = (index:number) => {
    setSelectedWorkout(workouts[index]);
  };

  interface WorkoutDetails {
    name: string;
    sets: string;
    exerciseTime: string;
    restTime: string;
  }
  

  const handleInputChange = (field: keyof WorkoutDetails, value: string) => {
    if (field === 'sets' || field === 'exerciseTime' || field === 'restTime') {
      if (!/^\d+$/.test(value)) {
        Alert.alert('Chyba', 'Prosím, zadejte pouze číslice.');
        return;
      }
    }
    setWorkoutDetails({ ...workoutDetails, [field]: value });
  };

  const saveEditedWorkout = () => {
    const updatedWorkouts = workouts.map((workout, index) =>
      index === editingWorkout
        ? {
            ...workoutDetails,
            sets: parseInt(workoutDetails.sets),
            exerciseTime: parseInt(workoutDetails.exerciseTime),
            restTime: parseInt(workoutDetails.restTime),
          }
        : workout
    );
    setWorkouts(updatedWorkouts);
    AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    setEditingWorkout(null);
    setWorkoutDetails({name:'', sets: '', exerciseTime: '', restTime: '' });
  };

  const handleNewWorkoutChange = (field:string, value:string) => {
    if (field === 'sets' || field === 'exerciseTime' || field === 'restTime') {
      if (!/^\d+$/.test(value)) {
        Alert.alert('Chyba', 'Prosím, zadejte pouze číslice.');
        return;
      }
    }
    setNewWorkout({ ...newWorkout, [field]: value });
  };

  const saveNewWorkout = () => {
    const workout = { ...newWorkout, sets: parseInt(newWorkout.sets), exerciseTime: parseInt(newWorkout.exerciseTime), restTime: parseInt(newWorkout.restTime) };
    saveWorkout(workout);
    setNewWorkout({name:'', sets: '', exerciseTime: '', restTime: '' });
  };
  const startNewWorkout = () => {
    const workout = { ...newWorkout, sets: parseInt(newWorkout.sets), exerciseTime: parseInt(newWorkout.exerciseTime), restTime: parseInt(newWorkout.restTime) };
    setSelectedWorkout(workout);
  };

  return (
    <View style={theme === 'light' ? styles.lightContainer : styles.darkContainer}>
      {selectedWorkout ? (
        <WorkoutTimer
          key={JSON.stringify(selectedWorkout)} // Oprava, aby React poznal změnu cvičení
          initialWorkout={selectedWorkout}
          onSaveWorkout={saveWorkout}
          onExit={() => setSelectedWorkout(null)} // Po skončení se vrátí na hlavní stránku
        />
      ) : (
        <>
          {editingWorkout !== null ? (
            <View style={theme === 'light' ? styles.lightContainer : styles.darkContainer}>
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Název cvičení</CustomText>
                <CustomTextInput 
                placeholder="Název cvičení"
                value={workoutDetails.name.toString()}
                onChangeText={(text) => handleInputChange( 'name', text )}
                keyboardType="default"
              />
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Sety</CustomText>
              <CustomTextInput 
                placeholder="Sets"
                value={workoutDetails.sets.toString()}
                onChangeText={(value) => handleInputChange('sets', value)}
                keyboardType="numeric"
              />
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Čas cvičení</CustomText>
              <CustomTextInput
                placeholder="Exercise Time"
                value={workoutDetails.exerciseTime.toString()}
                onChangeText={(value) => handleInputChange('exerciseTime', value)}
                keyboardType="numeric"
              />
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Čas odpočinku</CustomText>
              <CustomTextInput
                placeholder="Rest Time"
                value={workoutDetails.restTime.toString()}
                onChangeText={(value) => handleInputChange('restTime', value)}
                keyboardType="numeric"
              />
              <CustomButton title="Save" onPress={saveEditedWorkout} />
              <CustomButton title="Cancel" onPress={() => setEditingWorkout(null)} />
            </View>
          ) : (
            <>
                <CustomButton title="Toggle Theme" onPress={toggleTheme} />
                <CustomText style={theme === 'light' ? styles.lightText : styles.darkText}>Quickstart</CustomText>
                <CustomText style={theme === 'light' ? styles.lightText : styles.darkText}>Název cvičení</CustomText>
                <CustomTextInput
                placeholder="Název cvičení"
                value={newWorkout.name}
                onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
                keyboardType="default"
      />
      <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Sety</CustomText>
              <CustomTextInput
                placeholder="Sets"
                value={newWorkout.sets.toString()}
                onChangeText={(value) => handleNewWorkoutChange('sets', value)}
                keyboardType="numeric"
              />
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Čas cvičení</CustomText>
              <CustomTextInput
                placeholder="Exercise Time"
                value={newWorkout.exerciseTime.toString()}
                onChangeText={(value) => handleNewWorkoutChange('exerciseTime', value)}
                keyboardType="numeric"
              />
              <CustomText style={{ fontSize: 15, marginTop: 12,alignContent:'center' }}>Čas odpočinku</CustomText>
              <CustomTextInput
                placeholder="Rest Time"
                value={newWorkout.restTime.toString()}
                onChangeText={(value) => handleNewWorkoutChange('restTime', value)}
                keyboardType="numeric"
              />
              <CustomButton title="Uložit" onPress={saveNewWorkout} />
              <CustomButton title="Spustit" onPress={startNewWorkout} />
              <CustomText style={theme === 'light' ? styles.lightText : styles.darkText}>Uložená cvičení:</CustomText>
              <FlatList
                data={workouts}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={theme === 'light' ? styles.lightContainer : styles.darkContainer}>
                    <TouchableOpacity onPress={() => setSelectedWorkout({ ...item })}>
                    <CustomText style={theme === 'light' ? styles.lightText : styles.darkText}>{`${item['name']}`}</CustomText>
                      <CustomText style={theme === 'light' ? styles.lightText : styles.darkText}>{`${item['sets']} setů, ${item['exerciseTime']}s cvičení, ${item['restTime']}s odpočinek`}</CustomText>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 20,alignContent:'center' }}>
                      <CustomButton title="✏️" onPress={() => editWorkout(index)} />
                      <CustomButton title="🗑️"  onPress={() => confirmDelete(index)} />
                      <CustomButton title="Start" onPress={() => openWorkout(index)} />
                    </View>
                  </View>
                )}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
});

export default HomeScreen;