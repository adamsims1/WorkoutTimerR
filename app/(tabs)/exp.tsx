import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutTimer from '@/components/WorkoutTimer';
import { useTheme } from '@/ThemeContext';
import CustomText from '@/components/CustomText';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';

const HomeScreen = () => {
  const { theme, toggleTheme } = useTheme();

  interface Phase {
    name: string;
    duration: number;
  }

  interface Workout {
    name: string;
    sets: number;
    phases: Phase[];
  }

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<number | null>(null);
  const [workoutDetails, setWorkoutDetails] = useState<{ name: string; sets: string; phases: Phase[] }>({ name: '', sets: '', phases: [] });
  const [newWorkout, setNewWorkout] = useState<{ name: string; sets: string; phases: Phase[] }>({ name: 'Nové cvičení', sets: '3', phases: [] });
  const [newPhase, setNewPhase] = useState<{ name: string; durationMinutes: string; durationSeconds: string }>({ name: '', durationMinutes: '', durationSeconds: '' });

  useEffect(() => {
    const loadWorkouts = async () => {
      const storedWorkouts = await AsyncStorage.getItem('workouts');
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      }
    };
    loadWorkouts();
  }, []);

  const saveWorkout = async (workout: Workout) => {
    if (!workout.name || !workout.sets) {
      return;
    }

    if (isNaN(workout.sets)) {
      alert('Please enter valid numbers for Sets.');
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

  const confirmDelete = (index: number) => {
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
      phases: workout.phases,
    });
  };

  const openWorkout = (index: number) => {
    setSelectedWorkout(workouts[index]);
  };

  const handleInputChange = (value: string, field: string) => {
    setWorkoutDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
      phases: prevDetails.phases || [],
    }));
  };

  const handlePhaseInputChange = (field: string, value: string) => {
    setNewPhase((prevPhase) => ({
      ...prevPhase,
      [field]: value,
    }));
  };

  const addPhase = async () => {
    const duration = parseInt(newPhase.durationMinutes) * 60 + parseInt(newPhase.durationSeconds);
    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration for the phase.');
      return;
    }
    const phase = {
      name: newPhase.name,
      duration: duration,
    };

    try {
      const updatedPhases = [...(newWorkout.phases || []), phase];
      setNewWorkout((prevWorkout) => ({
        ...prevWorkout,
        phases: updatedPhases,
      }));
      setNewPhase({ name: '', durationMinutes: '', durationSeconds: '' });
      await AsyncStorage.setItem('phases', JSON.stringify(updatedPhases));
    } catch (error) {
      console.error('Chyba při ukládání fáze:', error);
    }
  };

  const saveEditedWorkout = () => {
    const sets = parseInt(workoutDetails.sets);

    if (isNaN(sets)) {
      alert('Please enter valid numbers for Sets.');
      return;
    }

    const workout = {
      name: workoutDetails.name,
      sets: sets,
      phases: workoutDetails.phases,
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
      phases: newWorkout.phases,
    };

    if (isNaN(workout.sets)) {
      alert('Please enter valid numbers for Sets.');
      return;
    }

    saveWorkout(workout);
  };

  const startNewWorkout = () => {
    const workout = {
      ...newWorkout,
      sets: parseInt(newWorkout.sets),
    };
    setSelectedWorkout(workout);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={theme === 'light' ? styles.lightContainer : styles.darkContainer}>
        {selectedWorkout ? (
          <WorkoutTimer
            key={JSON.stringify(selectedWorkout)}
            initialWorkout={selectedWorkout}
            onSaveWorkout={saveWorkout}
            onExit={() => setSelectedWorkout(null)}
          />
        ) : (
          <>
            {editingWorkout !== null ? (
              <View>
                <CustomText theme={theme}>Název cvičení</CustomText>
                <CustomTextInput
                  value={workoutDetails.name}
                  onChangeText={(text) => handleInputChange(text, 'name')}
                  keyboardType="default"
                  theme={theme}
                />
                <CustomText theme={theme}>Sety</CustomText>
                <CustomTextInput
                  placeholder="Sets"
                  value={workoutDetails.sets}
                  onChangeText={(text) => handleInputChange(text, 'sets')}
                  theme={theme}
                />
                <FlatList
                  data={workoutDetails.phases}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View>
                      <CustomText theme={theme}>{item.name}</CustomText>
                      <CustomText theme={theme}>{`${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}</CustomText>
                    </View>
                  )}
                />
                <CustomText theme={theme}>Fáze cvičení</CustomText>
                <CustomTextInput
                  placeholder="Phase Name"
                  value={newPhase.name}
                  onChangeText={(text) => handlePhaseInputChange('name', text)}
                  keyboardType="default"
                  theme={theme}
                />
                <View style={{ flexDirection: 'row' }}>
                  <CustomTextInput
                    placeholder="Minutes"
                    value={newPhase.durationMinutes}
                    onChangeText={(text) => handlePhaseInputChange('durationMinutes', text)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                  <CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={newPhase.durationSeconds}
                    onChangeText={(text) => handlePhaseInputChange('durationSeconds', text)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomButton title="Add Phase" onPress={addPhase} />
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
                <FlatList
                  data={newWorkout.phases}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View>
                      <CustomText theme={theme}>{item.name}</CustomText>
                      <CustomText theme={theme}>{`${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}</CustomText>
                    </View>
                  )}
                />
                <CustomText theme={theme}>Fáze cvičení</CustomText>
                <CustomTextInput
                  placeholder="Phase Name"
                  value={newPhase.name}
                  onChangeText={(text) => handlePhaseInputChange('name', text)}
                  keyboardType="default"
                  theme={theme}
                />
                <View style={{ flexDirection: 'row' }}>
                  <CustomTextInput
                    placeholder="Minutes"
                    value={newPhase.durationMinutes}
                    onChangeText={(text) => handlePhaseInputChange('durationMinutes', text)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                  <CustomText theme={theme}>:</CustomText>
                  <CustomTextInput
                    placeholder="Seconds"
                    value={newPhase.durationSeconds}
                    onChangeText={(text) => handlePhaseInputChange('durationSeconds', text)}
                    keyboardType="numeric"
                    theme={theme}
                    style={{ flex: 1 }}
                  />
                </View>
                <CustomButton title="Add Phase" onPress={addPhase} />
                <CustomText theme={theme} style={{ fontWeight: 'bold' }}>Přidané fáze:</CustomText>
                
                <FlatList
                  data={newWorkout.phases}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View>
                      <CustomText theme={theme}>{item.name}</CustomText>
                      <CustomText theme={theme}>{`${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}</CustomText>
                    </View>
                  )}
                />
                <CustomButton title="Uložit" onPress={saveNewWorkout} />
                <CustomButton title="Spustit" onPress={startNewWorkout} />
                <CustomText theme={theme} style={{ fontWeight: 'bold' }}>Uložená cvičení:</CustomText>
                <FlatList
                  data={workouts}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View>
                      <TouchableOpacity onPress={() => setSelectedWorkout({ ...item })}>
                        <CustomText theme={theme} style={{ fontWeight: 'bold' }}>{`${item['name']}`}</CustomText>
                        <CustomText theme={theme}>{`${item['sets']} setů`}</CustomText>
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', gap: 20, alignContent: 'center' }}>
                        <CustomButton title="✏️" onPress={() => editWorkout(index)} />
                        <CustomButton title="🗑️" onPress={() => confirmDelete(index)} />
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