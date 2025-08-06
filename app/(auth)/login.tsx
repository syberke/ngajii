import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      Alert.alert('Error', error);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#10B981', '#3B82F6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Pressable 
          style={[styles.backButton, { marginTop: insets.top + 16 }]}
         onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/welcome'); // atau ke screen lain sesuai alur app kamu
  }
}}

        >
          <ArrowLeft size={24} color="white" />
        </Pressable>

        <View style={styles.header}>
          <BookOpen size={48} color="white" />
          <Text style={styles.title}>Masuk ke Akun</Text>
          <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#10B981" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#10B981" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              Belum punya akun? <Text style={styles.linkBold}>Daftar disini</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.max(24, width * 0.05),
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.06,
  },
  title: {
    fontSize: Math.min(28, width * 0.07),
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Math.max(20, width * 0.05),
    gap: 16,
    marginHorizontal: width < 400 ? 0 : 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: Math.max(12, width * 0.04),
    gap: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: Math.min(16, width * 0.04),
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#10B981',
    padding: Math.max(14, width * 0.04),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: Math.min(14, width * 0.035),
    marginTop: 8,
    paddingHorizontal: 20,
  },
  linkBold: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});