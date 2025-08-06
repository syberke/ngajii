import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Medal, Award, Crown,BookOpen , Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LeaderboardEntry {
  id: string;
  name: string;
  total_poin: number;
  poin_hafalan: number;
  poin_quiz: number;
  rank: number;
}

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    if (!profile?.organize_id) return;

    try {
      const { data, error } = await supabase
        .from('siswa_poin')
        .select(`
          *,
          siswa:siswa_id(name)
        `)
        .order('total_poin', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      // Filter by organize and add rank
      const organizeStudents = data?.filter(entry => {
        // We need to check if the student is in the same organize
        return true; // For now, show all students
      }) || [];

      const rankedData = organizeStudents.map((entry, index) => ({
        id: entry.siswa_id,
        name: entry.siswa?.name || 'Unknown',
        total_poin: entry.total_poin,
        poin_hafalan: entry.poin_hafalan,
        poin_quiz: entry.poin_quiz,
        rank: index + 1,
      }));

      setLeaderboard(rankedData);

      // Find current user's rank
      const userEntry = rankedData.find(entry => entry.id === profile.id);
      setMyRank(userEntry || null);
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Crown;
      case 2: return Trophy;
      case 3: return Medal;
      default: return Star;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#10B981';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Trophy size={32} color="#F59E0B" />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Peringkat berdasarkan total poin</Text>
      </View>

      {/* My Rank Card */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankTitle}>Peringkat Saya</Text>
          <View style={styles.myRankContent}>
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(myRank.rank) }]}>
              <Text style={styles.rankNumber}>#{myRank.rank}</Text>
            </View>
            <View style={styles.myRankInfo}>
              <Text style={styles.myRankName}>{myRank.name}</Text>
              <Text style={styles.myRankPoints}>{myRank.total_poin} poin</Text>
            </View>
          </View>
        </View>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <View style={styles.podiumContainer}>
          <Text style={styles.sectionTitle}>Top 3 Siswa Terbaik</Text>
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={[styles.podiumPlace, styles.secondPlace]}>
              <View style={[styles.podiumIcon, { backgroundColor: '#C0C0C0' }]}>
                <Trophy size={24} color="white" />
              </View>
              <Text style={styles.podiumName}>{leaderboard[1]?.name}</Text>
              <Text style={styles.podiumPoints}>{leaderboard[1]?.total_poin} poin</Text>
              <Text style={styles.podiumRank}>#2</Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumPlace, styles.firstPlace]}>
              <View style={[styles.podiumIcon, { backgroundColor: '#FFD700' }]}>
                <Crown size={28} color="white" />
              </View>
              <Text style={styles.podiumName}>{leaderboard[0]?.name}</Text>
              <Text style={styles.podiumPoints}>{leaderboard[0]?.total_poin} poin</Text>
              <Text style={styles.podiumRank}>#1</Text>
            </View>

            {/* 3rd Place */}
            <View style={[styles.podiumPlace, styles.thirdPlace]}>
              <View style={[styles.podiumIcon, { backgroundColor: '#e3811fff' }]}>
                <Medal size={24} color="white" />
              </View>
              <Text style={styles.podiumName}>{leaderboard[2]?.name}</Text>
              <Text style={styles.podiumPoints}>{leaderboard[2]?.total_poin} poin</Text>
              <Text style={styles.podiumRank}>#3</Text>
            </View>
          </View>
        </View>
      )}

      {/* Full Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Semua Peringkat</Text>
        <View style={styles.leaderboardList}>
          {leaderboard.map((entry) => {
            const RankIcon = getRankIcon(entry.rank);
            const isCurrentUser = entry.id === profile?.id;
            
            return (
              <View 
                key={entry.id} 
                style={[styles.leaderboardCard, isCurrentUser && styles.currentUserCard]}
              >
                <View style={styles.rankContainer}>
                  <View style={[styles.rankIconContainer, { backgroundColor: getRankColor(entry.rank) }]}>
                    <RankIcon size={16} color="white" />
                  </View>
                  <Text style={styles.rankText}>#{entry.rank}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                    {entry.name}
                    {isCurrentUser && ' (Saya)'}
                  </Text>
                  <View style={styles.pointsBreakdown}>
                    <Text style={styles.totalPoints}>{entry.total_poin} poin</Text>
                    <Text style={styles.pointsDetail}>
                      Hafalan: {entry.poin_hafalan} • Quiz: {entry.poin_quiz}
                    </Text>
                  </View>
                </View>

                <View style={styles.achievementBadges}>
                  {entry.rank <= 3 && (
                    <View style={[styles.achievementBadge, { backgroundColor: getRankColor(entry.rank) + '20' }]}>
                      <Text style={[styles.achievementText, { color: getRankColor(entry.rank) }]}>
                        {entry.rank === 1 ? 'Juara 1' : entry.rank === 2 ? 'Juara 2' : 'Juara 3'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Achievement Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategori Pencapaian</Text>
        
        <View style={styles.categoryCards}>
          <View style={styles.categoryCard}>
            <BookOpen size={24} color="#10B981" />
            <Text style={styles.categoryTitle}>Top Hafalan</Text>
            <Text style={styles.categoryLeader}>
              {leaderboard.sort((a, b) => b.poin_hafalan - a.poin_hafalan)[0]?.name || '-'}
            </Text>
            <Text style={styles.categoryPoints}>
              {leaderboard.sort((a, b) => b.poin_hafalan - a.poin_hafalan)[0]?.poin_hafalan || 0} poin
            </Text>
          </View>

          <View style={styles.categoryCard}>
            <Trophy size={24} color="#3B82F6" />
            <Text style={styles.categoryTitle}>Top Quiz</Text>
            <Text style={styles.categoryLeader}>
              {leaderboard.sort((a, b) => b.poin_quiz - a.poin_quiz)[0]?.name || '-'}
            </Text>
            <Text style={styles.categoryPoints}>
              {leaderboard.sort((a, b) => b.poin_quiz - a.poin_quiz)[0]?.poin_quiz || 0} poin
            </Text>
          </View>
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
  },
  myRankCard: {
    backgroundColor: 'white',
    marginHorizontal: Math.max(16, width * 0.04),
    marginVertical: 12,
    padding: Math.max(16, width * 0.04),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myRankTitle: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  myRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Math.max(12, width * 0.03),
  },
  rankBadge: {
    width: Math.min(48, width * 0.12),
    height: Math.min(48, width * 0.12),
    borderRadius: Math.min(24, width * 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: 'white',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
  myRankInfo: {
    flex: 1,
  },
  myRankName: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  myRankPoints: {
    fontSize: Math.min(14, width * 0.035),
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  podiumContainer: {
    backgroundColor: 'white',
    marginHorizontal: Math.max(16, width * 0.04),
    marginVertical: 12,
    padding: Math.max(16, width * 0.04),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
 podium: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-end', // Dasar semua sejajar
  gap: Math.max(8, width * 0.02),
  marginTop: 24,
},
podiumPlace: {
  alignItems: 'center',
  marginHorizontal: 0,
},

firstPlace: {
  backgroundColor: '#DAC02D', // emas
  width: Math.min(100, width * 0.25),
  height: Math.min(160, height * 0.2), // paling tinggi
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  alignItems: 'center',
  justifyContent: 'flex-end',
  elevation: 4, // Android
  shadowColor: '#000', // iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},

secondPlace: {
  backgroundColor: '#A8A8A8', // perak
  width: Math.min(90, width * 0.22),
  height: Math.min(140, height * 0.17),
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  alignItems: 'center',
  justifyContent: 'flex-end',
  elevation: 4, // Android
  shadowColor: '#000', // iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},

thirdPlace: {
  backgroundColor: '#c2762aff', // perunggu
  width: Math.min(90, width * 0.22),
  height: Math.min(125, height * 0.15),
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  alignItems: 'center',
  justifyContent: 'flex-end',
  elevation: 4, // Android
  shadowColor: '#000', // iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},

  podiumIcon: {
    width: Math.min(40, width * 0.1),
    height: Math.min(40, width * 0.1),
    borderRadius: Math.min(20, width * 0.05),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumName: {
    fontSize: Math.min(12, width * 0.03),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  podiumPoints: {
    fontSize: Math.min(10, width * 0.025),
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: Math.min(10, width * 0.025),
    color: '#6B7280',
    fontWeight: 'bold',
    paddingBottom: 10,
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
  leaderboardList: {
    gap: Math.max(6, width * 0.015),
  },
  leaderboardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(12, width * 0.03),
    flexDirection: 'row',
    alignItems: 'center',
    gap: Math.max(12, width * 0.03),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  rankContainer: {
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
  },
  rankIconContainer: {
    width: Math.min(32, width * 0.08),
    height: Math.min(32, width * 0.08),
    borderRadius: Math.min(16, width * 0.04),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: 'bold',
    color: '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Math.min(15, width * 0.038),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  currentUserName: {
    color: '#10B981',
  },
  pointsBreakdown: {
    marginTop: 4,
  },
  totalPoints: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
    color: '#10B981',
  },
  pointsDetail: {
    fontSize: Math.min(11, width * 0.028),
    color: '#6B7280',
    marginTop: 2,
  },
  achievementBadges: {
    alignItems: 'flex-end',
  },
  achievementBadge: {
    paddingHorizontal: Math.max(6, width * 0.015),
    paddingVertical: 4,
    borderRadius: 6,
  },
  achievementText: {
    fontSize: Math.min(9, width * 0.022),
    fontWeight: 'bold',
  },
  categoryCards: {
    flexDirection: 'row',
    gap: Math.max(8, width * 0.02),
  },
  categoryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Math.max(12, width * 0.03),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: Math.min(13, width * 0.032),
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryLeader: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryPoints: {
    fontSize: Math.min(11, width * 0.028),
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 2,
  },
});