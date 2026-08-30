import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UploadedImage {
  id: string;
  uri: string;
  name: string;
  date: string;
  type: 'camera' | 'gallery';
}

export default function Gallery() {
  const { openMenu } = useSideMenu();
  const [uploads, setUploads] = useState<UploadedImage[]>([]);

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant gallery access to upload images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newUploads: UploadedImage[] = result.assets.map((asset) => ({
        id: asset.assetId || `${Date.now()}-${Math.random()}`,
        uri: asset.uri,
        name: asset.fileName || `Image_${Date.now()}`,
        date: formatDate(),
        type: 'gallery' as const,
      }));
      setUploads((prev) => [...newUploads, ...prev]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newUpload: UploadedImage = {
        id: result.assets[0].assetId || `${Date.now()}`,
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `Photo_${Date.now()}`,
        date: formatDate(),
        type: 'camera',
      };
      setUploads((prev) => [newUpload, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setUploads((prev) => prev.filter((img) => img.id !== id)),
      },
    ]);
  };

  const renderUploadCard = ({ item }: { item: UploadedImage }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.uri }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons
            name={item.type === 'camera' ? 'camera-outline' : 'images-outline'}
            size={14}
            color="#6B7280"
          />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Gallery"
        showMenu={true}
        showNotification={false}
        onPressMenu={openMenu}
      />

      <FlatList
        data={uploads}
        keyExtractor={(item) => item.id}
        renderItem={renderUploadCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Upload Section */}
            <Text style={styles.sectionTitle}>Upload</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickFromGallery}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="images-outline" size={28} color="#0284C7" />
                </View>
                <Text style={styles.uploadLabel}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="camera-outline" size={28} color="#16A34A" />
                </View>
                <Text style={styles.uploadLabel}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Uploads Section */}
            <Text style={styles.sectionTitle}>
              Uploads {uploads.length > 0 ? `(${uploads.length})` : ''}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cloud-upload-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No uploads yet</Text>
            <Text style={styles.emptySubtext}>
              Use the buttons above to add images
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 20,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: 72,
    height: 72,
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#D1D5DB',
    marginTop: 4,
  },
});
