import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import CustomText from '@/components/CustomText';
import CustomText2 from '@/components/CustomText2';
import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/ThemeContext';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const WorkoutTimer = ({ initialWorkout, onSaveWorkout, onExit }) => {
  const { sets, exerciseTime, restTime } = initialWorkout;
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isResting, setIsResting] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [paused, setPaused] = useState(false);
  const soundRef = useRef(null); // Použijeme useRef pro uchování instance zvuku
  const { theme } = useTheme();

  // Požádejte o oprávnění k zasílání notifikací
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access notifications was denied');
        }
      })();
    }
  }, []);

  // Inicializace zvuku při prvním načtení komponenty
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/beep_sound.mp3'),
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    // Uvolnění zvuku při unmountu
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Funkce pro plánování notifikace
  const scheduleNotification = async (title, body) => {
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        identifier: 'workout-progress',
        trigger: null,
      });
    } else {
      console.log(`Notification: ${title} - ${body}`);
    }
  };

  const updateNotification = async (title, body) => {
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        identifier: 'workout-progress',
        trigger: null,
      });
    } else {
      console.log(`Notification: ${title} - ${body}`);
    }
  };

  const announcePhase = (phase) => {
    setTimeout(() => {
      Speech.speak(phase);
    }, 500);
  };

  // Funkce pro přehrávání zvuku
  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0); // Reset zvuku na začátek
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playSoundWithPause = async () => {
    await playSound();
    setTimeout(async () => {
      await playSound();
    }, 250); // 250ms pauza mezi zvuky
  };

  useEffect(() => {
    let timer;
    if (!paused && currentSet <= sets) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 3 && prevTime > 0) {
            playSound();
          }
          if (prevTime === 1) {
            playSoundWithPause();
            if (isPreparing) {
              announcePhase('Exercise');
              setIsPreparing(false);
              updateNotification('Workout', 'Time to exercise!');
              return exerciseTime;
            } else if (isResting) {
              announcePhase('Exercise');
              setIsResting(false);
              setCurrentSet((prevSet) => prevSet + 1);
              updateNotification('Workout', 'Time to exercise!');
              return exerciseTime;
            } else {
              announcePhase('Rest');
              setIsResting(true);
              updateNotification('Workout', 'Time to rest!');
              return restTime;
            }
          }
          updateNotification('Workout Progress', `Set: ${currentSet} / ${sets}, Time Left: ${prevTime - 1}s`);
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paused, isPreparing, isResting, currentSet, sets, exerciseTime, restTime]);

  useEffect(() => {
    if (currentSet > sets) {
      if (Platform.OS !== 'web') {
        Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  }, [currentSet, sets]);

  const stopWorkout = () => {
    setPaused(true);
  };

  const resumeWorkout = () => {
    setPaused(false);
  };

  const exitWorkout = () => {
    onExit();
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      {currentSet > sets ? (
        <View className="flex-1 justify-center items-center">
          <CustomText theme={theme}>Cvičení dokončeno!</CustomText>
          <CustomButton title="Exit" onPress={exitWorkout} />
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <CustomText theme={theme}>Set: {currentSet} / {sets}</CustomText>
          <CustomText theme={theme}>{isPreparing ? 'Prepare' : isResting ? 'Rest' : 'Exercise'}</CustomText>
          <CustomText2 theme={theme}>{timeLeft}s</CustomText2>
          {paused ? (
            <CustomButton title="Resume" onPress={resumeWorkout} />
          ) : (
            <CustomButton title="Stop" onPress={stopWorkout} />
          )}
          <CustomButton title="Exit" onPress={exitWorkout} />
        </View>
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

export default WorkoutTimer;