import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Award, BookOpen, LogOut, Settings, Shield, Trophy, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Sign out error:', error);
              // Force navigation even if signOut fails
              router.replace('/(auth)/welcome');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'siswa': return 'Siswa';
      case 'guru': return 'Guru';
      case 'ortu': return 'Orang Tua';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  const getTypeName = (type?: string) => {
    if (!type) return 'Tidak ditentukan';
    switch (type) {
      case 'normal': return 'Normal';
      case 'cadel': return 'Cadel';
      case 'school': return 'Sekolah';
      case 'personal': return 'Personal';
      default: return type;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarContainer}>
          <User size={48} color="white" />
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Shield size={20} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{getRoleName(profile?.role || '')}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Settings size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipe</Text>
              <Text style={styles.infoValue}>{getTypeName(profile?.type)}</Text>
            </View>
          </View>

          {profile?.organize_id && (
            <View style={styles.infoItem}>
              <BookOpen size={20} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kelas</Text>
                <Text style={styles.infoValue}>Kelas Aktif</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Quick Stats for Students */}
      {profile?.role === 'siswa' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pencapaian Saya</Text>
          
          <View style={styles.achievementContainer}>
            <View style={styles.achievementCard}>
              <Trophy size={24} color="#F59E0B" />
              <Text style={styles.achievementNumber}>0</Text>
              <Text style={styles.achievementLabel}>Total Poin</Text>
            </View>
            <View style={styles.achievementCard}>
              <Award size={24} color="#10B981" />
              <Text style={styles.achievementNumber}>0</Text>
              <Text style={styles.achievementLabel}>Label Juz</Text>
            </View>
            <View style={styles.achievementCard}>
              <BookOpen size={24} color="#3B82F6" />
              <Text style={styles.achievementNumber}>0</Text>
              <Text style={styles.achievementLabel}>Setoran</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton}>
            <User size={20} color="#6B7280" />
            <Text style={styles.actionText}>Edit Profil</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionText}>Pengaturan</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleSignOut}
            disabled={loading}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.logoutText]}>
              {loading ? 'Memproses...' : 'Keluar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
        
       <View style={styles.appInfoCard}>
  <BookOpen size={44} color="#10B981" style={{ marginBottom: 12 }} />

  <Text style={styles.appName}>Ngaji App</Text>
  <Text style={styles.appVersion}>Versi 1.0.0</Text>

  <View style={styles.authorContainer}>
    <Text style={styles.madeBy}>Dirancang dan dibangun oleh:</Text>
    <Text style={styles.authorName}>Akra Mujjaman Raton</Text>
    <Text style={styles.authorName}>Qiageng Berke Jaisyurrohman</Text>
  </View>

  <Text style={styles.appDescription}>
    Platform pembelajaran Quran digital untuk hafalan, murojaah, dan monitoring perkembangan siswa.
  </Text>
</View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 32,
    paddingHorizontal: Math.max(24, width * 0.05),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    width: Math.min(80, width * 0.2),
    height: Math.min(80, width * 0.2),
    backgroundColor: '#10B981',
    borderRadius: Math.min(40, width * 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: Math.min(14, width * 0.035),
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: Math.max(16, width * 0.04),
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Math.max(10, height * 0.015),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Math.min(12, width * 0.03),
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Math.min(16, width * 0.04),
    color: '#1F2937',
    fontWeight: '600',
  },
  achievementContainer: {
    flexDirection: 'row',
    gap: Math.max(8, width * 0.02),
  },
  achievementCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(12, width * 0.03),
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementNumber: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  achievementLabel: {
    fontSize: Math.min(11, width * 0.028),
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Math.max(14, width * 0.035),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 56,
  },
  actionText: {
    fontSize: Math.min(16, width * 0.04),
    color: '#1F2937',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(20, width * 0.05),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: Math.min(20, width * 0.05),
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  appVersion: {
    fontSize: Math.min(14, width * 0.035),
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: Math.min(14, width * 0.035),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: Math.min(20, width * 0.05),
  },

authorContainer: {
  alignItems: 'center',
  marginBottom: 12,
},

madeBy: {
  fontSize: Math.min(13, width * 0.032),
  color: '#4B5563',
  fontStyle: 'italic',
  marginBottom: 2,
},

authorName: {
  fontSize: Math.min(14, width * 0.035),
  color: '#111827',
  fontWeight: '600',
},



});