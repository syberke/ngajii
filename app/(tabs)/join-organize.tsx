import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Key, CircleCheck as CheckCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function JoinOrganizeScreen() {
  const { profile, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);

  const joinOrganize = async () => {
    if (!classCode.trim()) {
      Alert.alert('Error', 'Mohon masukkan kode kelas');
      return;
    }

    if (profile?.organize_id) {
      Alert.alert('Info', 'Anda sudah bergabung dengan kelas');
      return;
    }

    setLoading(true);

    try {
      // Find organize by code
      const { data: organizeData, error: organizeError } = await supabase
        .from('organizes')
        .select('*')
        .eq('code', classCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle()

      if (organizeError || !organizeData) {
        Alert.alert('Error', 'Kode kelas tidak ditemukan atau tidak aktif');
        setLoading(false);
        return;
      }

      // Update user's organize_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ organize_id: organizeData.id })
        .eq('id', profile?.id);

      if (updateError) {
        Alert.alert('Error', 'Gagal bergabung dengan kelas');
        setLoading(false);
        return;
      }

      // Initialize siswa_poin if not exists
      const { data: existingPoints } = await supabase
        .from('siswa_poin')
        .select('*')
        .eq('siswa_id', profile?.id)
        .single();

      if (!existingPoints) {
        await supabase
          .from('siswa_poin')
          .insert([{
            siswa_id: profile?.id,
            total_poin: 0,
            poin_hafalan: 0,
            poin_quiz: 0,
          }]);
      }

      Alert.alert(
        'Berhasil!', 
        `Anda berhasil bergabung dengan kelas "${organizeData.name}"`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              refreshProfile();
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat bergabung dengan kelas');
    } finally {
      setLoading(false);
    }
  };

  // If already in organize, show success state
  if (profile?.organize_id) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color="#10B981" />
          <Text style={styles.successTitle}>Sudah Bergabung</Text>
          <Text style={styles.successSubtitle}>
            Anda sudah bergabung dengan kelas aktif
          </Text>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.backButtonText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Users size={32} color="#3B82F6" />
        <Text style={styles.headerTitle}>Gabung Kelas</Text>
        <Text style={styles.headerSubtitle}>Masukkan kode kelas untuk bergabung</Text>
      </View>

      {/* Join Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Key size={20} color="#3B82F6" />
          <TextInput
            style={styles.input}
            placeholder="Masukkan Kode Kelas"
            value={classCode}
            onChangeText={setClassCode}
            autoCapitalize="characters"
            maxLength={6}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Pressable
          style={[styles.joinButton, loading && styles.joinButtonDisabled]}
          onPress={joinOrganize}
          disabled={loading}
        >
          <Text style={styles.joinButtonText}>
            {loading ? 'Memproses...' : 'Gabung Kelas'}
          </Text>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Cara Bergabung:</Text>
          <Text style={styles.infoText}>
            1. Minta kode kelas dari guru Anda{'\n'}
            2. Masukkan kode 6 digit di atas{'\n'}
            3. Tekan tombol "Gabung Kelas"{'\n'}
            4. Mulai belajar dan kirim setoran!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: Math.max(24, width * 0.05),
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: Math.min(14, width * 0.035),
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: Math.max(24, width * 0.05),
    paddingVertical: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(16, width * 0.04),
    gap: Math.max(12, width * 0.03),
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 60,
  },
  input: {
    flex: 1,
    fontSize: Math.min(18, width * 0.045),
    color: '#1F2937',
    fontWeight: '600',
    letterSpacing: Math.max(1, width * 0.005),
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    padding: Math.max(16, width * 0.04),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 56,
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(16, width * 0.04),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#6B7280',
    lineHeight: Math.min(20, width * 0.05),
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.max(40, width * 0.1),
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: Math.max(24, width * 0.06),
    paddingVertical: Math.max(12, width * 0.03),
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
});