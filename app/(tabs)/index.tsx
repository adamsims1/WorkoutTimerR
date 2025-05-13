import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, FlatList, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutTimer from '@/components/WorkoutTimer';
import { useTheme } from '@/ThemeContext';
import CustomText from '@/components/CustomText';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';
import { parse } from '@babel/core';

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
  const [workoutDetails, setWorkoutDetails] = useState({ name: '', sets: '', exerciseTimeMinutes: '', exerciseTimeSeconds: '', restTimeMinutes: '', restTimeSeconds: '' });
  const [newWorkout, setNewWorkout] = useState({ name: 'Nové cvičení', sets: '3', exerciseTimeMinutes: '0', exerciseTimeSeconds: '30', restTimeMinutes: '0', restTimeSeconds: '10' });
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
  
    if (isNaN(workout.sets) || isNaN(workout.exerciseTime) || isNaN(workout.restTime)) {
      alert('Please enter valid numbers for Sets, Exercise Time, and Rest Time.');
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

  const editWorkout = (index: number) => {
    const workout = workouts[index];
    setEditingWorkout(index);
    setWorkoutDetails({
      name: workout.name,
      sets: workout.sets.toString(),
      exerciseTimeMinutes: Math.floor(workout.exerciseTime / 60).toString(),
      exerciseTimeSeconds: (workout.exerciseTime % 60).toString(),
      restTimeMinutes: Math.floor(workout.restTime / 60).toString(),
      restTimeSeconds: (workout.restTime % 60).toString(),
    });
  };
  const openWorkout = (index:number) => {
    setSelectedWorkout(workouts[index]);
  };

  const handleInputChange = (value: string, field: string) => {
      setWorkoutDetails((prevDetails) => ({
        ...prevDetails,
        [field]: value,
      }));
    };

  const saveEditedWorkout = () => {
    const sets = parseInt(workoutDetails.sets);
    const exerciseTimeMinutes = parseInt(workoutDetails.exerciseTimeMinutes);
    const exerciseTimeSeconds = parseInt(workoutDetails.exerciseTimeSeconds);
    const restTimeMinutes = parseInt(workoutDetails.restTimeMinutes);
    const restTimeSeconds = parseInt(workoutDetails.restTimeSeconds);
  
    // Validation to ensure numeric fields contain only numbers
    if (isNaN(sets) || isNaN(exerciseTimeMinutes) || isNaN(exerciseTimeSeconds) || isNaN(restTimeMinutes) || isNaN(restTimeSeconds)) {
      alert('Please enter valid numbers for Sets, Exercise Time, and Rest Time.');
      return;
    }
    if (exerciseTimeSeconds < 3 || restTimeSeconds < 3) {
      alert('Please enter at least 3 seconds for Exercise Time and Rest Time.');
      return;
    }
  
    const workout = {
      name: workoutDetails.name,
      sets: sets,
      exerciseTime: exerciseTimeMinutes * 60 + exerciseTimeSeconds,
      restTime: restTimeMinutes * 60 + restTimeSeconds,
    };
  
    saveWorkout(workout);
  };

  const handleNewWorkoutChange = (field: string, value: string) => {
    setNewWorkout((prevWorkout) => ({
      ...prevWorkout,
      [field]: value,
    }));
  };

  const saveNewWorkout = () => {
    const workout = {
      name: newWorkout.name,
      sets: parseInt(newWorkout.sets),
    exerciseTime: parseInt(newWorkout.exerciseTimeMinutes) * 60 + parseInt(newWorkout.exerciseTimeSeconds),
    restTime: parseInt(newWorkout.restTimeMinutes) * 60 + parseInt(newWorkout.restTimeSeconds),
    };
  
    if (isNaN(workout.sets) || isNaN(workout.exerciseTime) || isNaN(workout.restTime)) {
      alert('Please enter valid numbers for Sets, Exercise Time, and Rest Time.');
      return;
    }
    if (parseInt(newWorkout.exerciseTimeSeconds) < 3 || parseInt(newWorkout.restTimeSeconds) < 3) {
      alert('Please enter at least 3 seconds for Exercise Time and Rest Time.');
      return;
    }
  
    saveWorkout(workout);
  };
  
  const startNewWorkout = () => {
    const workout = {
      ...newWorkout,
      sets: parseInt(newWorkout.sets),
      exerciseTime: parseInt(newWorkout.exerciseTimeMinutes) * 60 + parseInt(newWorkout.exerciseTimeSeconds),
      restTime: parseInt(newWorkout.restTimeMinutes) * 60 + parseInt(newWorkout.restTimeSeconds),
    };
    setSelectedWorkout(workout);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              <View>
                <CustomText theme={theme}>Název cvičení</CustomText>
                  <CustomTextInput 
                  value={workoutDetails.name}
                  onChangeText={(value) => handleInputChange(value, 'name')}
                  keyboardType="default"
                  theme={theme}
                />
                <CustomText theme={theme}>Sety</CustomText>
                <CustomTextInput 
                  placeholder="Sets"
                  value={workoutDetails.sets}
                  onChangeText={(value) => handleInputChange(value, 'sets')}
                  theme={theme}
                />
  <CustomText theme={theme}>Čas cvičení (minuty a sekundy)</CustomText>
                <View style={{ flexDirection: 'row' }}>
                <CustomTextInput
                    placeholder="Minutes"
                    value={workoutDetails.exerciseTimeMinutes}
                    onChangeText={(value) => handleInputChange(value, 'exerciseTimeMinutes')}
                    theme={theme}
                    style={{ flex: 1 }}
                  /><CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={workoutDetails.exerciseTimeSeconds}
                    onChangeText={(value) => handleInputChange(value, 'exerciseTimeSeconds')}
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomText theme={theme}>Čas odpočinku (minuty a sekundy)</CustomText>
                <View style={{ flexDirection: 'row' }}>
                  <CustomTextInput
                    placeholder="Minutes"
                    value={workoutDetails.restTimeMinutes}
                    onChangeText={(value) => handleInputChange(value, 'restTimeMinutes')}
                    theme={theme}
                    style={{ flex: 1 }}
                  /><CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={workoutDetails.restTimeSeconds}
                    onChangeText={(value) => handleInputChange(value, 'restTimeSeconds')}
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomButton title="Save" onPress={saveEditedWorkout} />
                <CustomButton title="Cancel" onPress={() => setEditingWorkout(null)} />
              </View>
            ) : (
              <>
                  <CustomButton title="Toggle Theme" onPress={toggleTheme} />
                  <CustomText theme={theme} style={{ fontWeight: 'bold' }}>Quickstart</CustomText>
                  <CustomText theme={theme}>Název cvičení</CustomText>
                  <CustomTextInput
                  placeholder="Název cvičení"
                  value={newWorkout.name}
                  onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
                  keyboardType="default"
                  theme={theme}
        />
        <CustomText theme={theme}>Sety</CustomText>
                <CustomTextInput 
                  placeholder="Sets"
                  value={newWorkout.sets.toString()}
                  onChangeText={(value) => handleNewWorkoutChange('sets', value)}
                  keyboardType="numeric"
                  theme={theme}
                />
                <CustomText theme={theme}>Čas cvičení</CustomText>
                <View style={{ flexDirection: 'row' }}>
                  <CustomTextInput
                    placeholder="Minutes"
                    value={newWorkout.exerciseTimeMinutes}
                    onChangeText={(value) => handleNewWorkoutChange('exerciseTimeMinutes', value)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  /><CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={newWorkout.exerciseTimeSeconds}
                    onChangeText={(value) => handleNewWorkoutChange('exerciseTimeSeconds', value)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomText theme={theme}>Čas odpočinku</CustomText>
                <View style={{ flexDirection: 'row' }}>
                  <CustomTextInput
                    placeholder="Minutes"
                    value={newWorkout.restTimeMinutes}
                    onChangeText={(value) => handleNewWorkoutChange('restTimeMinutes', value)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  /><CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={newWorkout.restTimeSeconds}
                    onChangeText={(value) => handleNewWorkoutChange('restTimeSeconds', value)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomButton title="Uložit" onPress={saveNewWorkout} />
                <CustomButton title="Spustit" onPress={startNewWorkout} />
                <CustomText theme={theme} style={{ fontWeight: 'bold' }}>Uložená cvičení:</CustomText>
                <FlatList
                  data={workouts}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View >
                      <TouchableOpacity onPress={() => setSelectedWorkout({ ...item })}>
                      <CustomText theme={theme} style={{ fontWeight: 'bold' }}>{`${item['name']}`}</CustomText>
                        <CustomText theme={theme}>{`${item['sets']} setů, ${item['exerciseTime']}s cvičení, ${item['restTime']}s odpočinek`}</CustomText>
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
    </ScrollView>
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