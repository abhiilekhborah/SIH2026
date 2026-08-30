import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = ['Prescription', 'Medicines', 'Reports', 'Documents'] as const;
type Category = (typeof CATEGORIES)[number];

interface UploadedImage {
  id: string;
  uri: string;
  name: string;
  date: string;
  category: Category | null;
  description: string;
  type: 'camera' | 'gallery';
}

const categoryColors: Record<Category, { bg: string; text: string }> = {
  Prescription: { bg: '#EDE9FE', text: '#7C3AED' },
  Medicines:    { bg: '#DCFCE7', text: '#16A34A' },
  Reports:      { bg: '#E0F2FE', text: '#0284C7' },
  Documents:    { bg: '#FEF9C3', text: '#CA8A04' },
};

export default function Gallery() {
  const { openMenu } = useSideMenu();
  const [uploads, setUploads] = useState<UploadedImage[]>([]);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [pendingAssets, setPendingAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

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
      Alert.alert('Permission Required', 'Please grant gallery access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets) {
      setPendingAssets(result.assets);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets) {
      setPendingAssets(result.assets);
    }
  };

  const handleUpload = () => {
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category before uploading.');
      return;
    }
    if (pendingAssets.length === 0) {
      Alert.alert('No File Selected', 'Please pick an image from gallery or take a photo first.');
      return;
    }
    const newUploads: UploadedImage[] = pendingAssets.map((asset) => ({
      id: asset.assetId || `${Date.now()}-${Math.random()}`,
      uri: asset.uri,
      name: asset.fileName || `Image_${Date.now()}`,
      date: formatDate(),
      category: selectedCategory,
      description: description.trim(),
      type: 'gallery' as const,
    }));
    setUploads((prev) => [...newUploads, ...prev]);
    setPendingAssets([]);
    setSelectedCategory(null);
    setDescription('');
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
      {/* Large image tap to preview */}
      <TouchableOpacity onPress={() => setPreviewUri(item.uri)} activeOpacity={0.85} style={styles.cardImageWrapper}>
        <Image source={{ uri: item.uri }} style={styles.cardImage} resizeMode="cover" />
      </TouchableOpacity>

      {/* Bottom info row */}
      <View style={styles.cardBottom}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors[item.category].bg }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColors[item.category].text }]}>
                {item.category}
              </Text>
            </View>
          )}
          {!!item.description && (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredUploads = filterCategory === 'All' 
    ? uploads 
    : uploads.filter((img) => img.category === filterCategory);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Gallery"
        showMenu={true}
        showNotification={false}
        onPressMenu={openMenu}
      />

      <FlatList
        data={filteredUploads}
        keyExtractor={(item) => item.id}
        renderItem={renderUploadCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* ── Upload Section ── */}
            <Text style={styles.sectionTitle}>Upload</Text>

            {/* Source Buttons */}
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickFromGallery} activeOpacity={0.8}>
                <View style={[styles.uploadIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="images-outline" size={28} color="#0284C7" />
                </View>
                <Text style={styles.uploadLabel}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto} activeOpacity={0.8}>
                <View style={[styles.uploadIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="camera-outline" size={28} color="#16A34A" />
                </View>
                <Text style={styles.uploadLabel}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Pending preview strip */}
            {pendingAssets.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewStrip}>
                {pendingAssets.map((a, i) => (
                  <TouchableOpacity key={i} onPress={() => setPreviewUri(a.uri)} activeOpacity={0.85}>
                    <Image source={{ uri: a.uri }} style={styles.previewThumb} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Category Dropdown */}
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)} activeOpacity={0.8}>
              <Text style={[styles.dropdownText, !selectedCategory && styles.dropdownPlaceholder]}>
                {selectedCategory ?? 'Select category…'}
              </Text>
              <Ionicons name="chevron-down-outline" size={18} color="#6B7280" />
            </TouchableOpacity>

            {/* Description Input */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add a short description (optional)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Upload Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleUpload} activeOpacity={0.85}>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Upload</Text>
            </TouchableOpacity>

            {/* ── Uploads List Header ── */}
            <Text style={styles.sectionTitle}>
              Uploads {uploads.length > 0 ? `(${uploads.length})` : ''}
            </Text>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterCategory === 'All' && styles.filterChipActive,
                ]}
                onPress={() => setFilterCategory('All')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterCategory === 'All' && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const isActive = filterCategory === cat;
                const colors = categoryColors[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      isActive && { backgroundColor: colors.bg, borderColor: colors.text },
                    ]}
                    onPress={() => setFilterCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && { color: colors.text, fontWeight: '700' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cloud-upload-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No uploads yet</Text>
            <Text style={styles.emptySubtext}>Pick images and hit Upload</Text>
          </View>
        }
      />

      {/* Category Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const colors = categoryColors[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalOption, active && { backgroundColor: colors.bg }]}
                  onPress={() => { setSelectedCategory(cat); setShowDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, active && { color: colors.text, fontWeight: '700' }]}>
                    {cat}
                  </Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.text} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full-screen Image Preview Modal */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
        statusBarTranslucent
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)} activeOpacity={0.8}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewFullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    marginTop: 20,
    marginBottom: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
  previewStrip: {
    marginBottom: 8,
  },
  previewThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  columnWrapper: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    height: 200,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImageWrapper: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 1,
  },
  categoryBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
    color: '#000000ff',
    marginTop: 1,
  },
  cardDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    flexShrink: 0,
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  previewClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
});
