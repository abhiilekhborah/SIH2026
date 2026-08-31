import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Prescription', 'Medicines', 'Reports', 'Documents'] as const;
type Category = (typeof CATEGORIES)[number];

// Matches the Supabase table schema
interface UploadedImage {
  id: string;
  secure_url: string;
  original_filename: string;
  created_at: string;
  image_type: string;
  description: string;
  public_id: string;
}

const categoryColors: Record<Category, { bg: string; text: string }> = {
  Prescription: { bg: '#EDE9FE', text: '#7C3AED' },
  Medicines:    { bg: '#DCFCE7', text: '#16A34A' },
  Reports:      { bg: '#E0F2FE', text: '#0284C7' },
  Documents:    { bg: '#FEF9C3', text: '#CA8A04' },
};

// Cloudinary configuration from .env
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export default function Gallery() {
  const { openMenu } = useSideMenu();
  
  // State
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [pendingAssets, setPendingAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // Fetch images from Supabase
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
      
      if (filterCategory !== 'All') {
        const backendType = filterCategory.toUpperCase().replace(' ', '_'); // e.g. "Reports" -> "REPORTS"
        query = query.eq('image_type', backendType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setUploads(data || []);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'Failed to load gallery images.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [filterCategory]);

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

  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    
    // Format the file for React Native FormData
    const file = {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `upload_${Date.now()}.jpg`,
    } as any;

    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `mediquick/${(selectedCategory || 'other').toLowerCase()}`);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary error: ${errText}`);
    }

    return await response.json();
  };

  const handleUpload = async () => {
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category before uploading.');
      return;
    }
    if (pendingAssets.length === 0) {
      Alert.alert('No File Selected', 'Please pick an image from gallery or take a photo first.');
      return;
    }
    if (!UPLOAD_PRESET) {
      Alert.alert('Configuration Error', 'Cloudinary upload preset is missing in .env');
      return;
    }

    try {
      setIsUploading(true);
      
      for (const asset of pendingAssets) {
        // 1. Upload to Cloudinary
        const cloudinaryData = await uploadToCloudinary(asset);
        
        // 2. Save metadata to Supabase
        const backendType = selectedCategory.toUpperCase().replace(' ', '_');
        
        const { error: dbError } = await supabase.from('gallery_images').insert({
          secure_url: cloudinaryData.secure_url,
          public_id: cloudinaryData.public_id,
          original_filename: asset.fileName || cloudinaryData.original_filename,
          image_type: backendType,
          description: description.trim(),
          file_size: cloudinaryData.bytes,
          mime_type: cloudinaryData.format ? `image/${cloudinaryData.format}` : 'image/jpeg',
        });

        if (dbError) throw dbError;
      }
      
      // Clear form and refresh list
      setPendingAssets([]);
      setSelectedCategory(null);
      setDescription('');
      fetchImages();
      
      Alert.alert('Success', 'Images uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to remove this image from the gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw error;
            
            // Optimistic update
            setUploads((prev) => prev.filter((img) => img.id !== id));
          } catch (error: any) {
            console.error('Delete failed:', error);
            Alert.alert('Error', 'Failed to delete image.');
          }
        },
      },
    ]);
  };

  const mapBackendTypeToCategory = (type: string): Category | string => {
    const normalized = type.toUpperCase();
    if (normalized === 'PRESCRIPTION') return 'Prescription';
    if (normalized === 'MEDICINES') return 'Medicines';
    if (normalized === 'REPORTS' || normalized === 'DIAGNOSTIC_REPORT') return 'Reports';
    if (normalized === 'DOCUMENTS' || normalized === 'MEDICAL_DOCUMENT') return 'Documents';
    return 'Other';
  };

  const renderUploadCard = ({ item }: { item: UploadedImage }) => {
    const uiCategory = mapBackendTypeToCategory(item.image_type);
    const badgeColors = (categoryColors as any)[uiCategory] || { bg: '#F3F4F6', text: '#374151' };

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setPreviewUri(item.secure_url)} activeOpacity={0.85} style={styles.cardImageWrapper}>
          <Image source={{ uri: item.secure_url }} style={styles.cardImage} resizeMode="cover" />
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.cardId} numberOfLines={1}>
            ID: {item.id.substring(0, 8)}...
          </Text>
          
          <View style={[styles.categoryBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.categoryBadgeText, { color: badgeColors.text }]}>
              {uiCategory}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

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
            {/* ── Upload Section ── */}
            <Text style={styles.sectionTitle}>Upload</Text>

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

            {pendingAssets.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewStrip}>
                {pendingAssets.map((a, i) => (
                  <TouchableOpacity key={i} onPress={() => setPreviewUri(a.uri)} activeOpacity={0.85}>
                    <Image source={{ uri: a.uri }} style={styles.previewThumb} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)} activeOpacity={0.8}>
              <Text style={[styles.dropdownText, !selectedCategory && styles.dropdownPlaceholder]}>
                {selectedCategory ?? 'Select category…'}
              </Text>
              <Ionicons name="chevron-down-outline" size={18} color="#6B7280" />
            </TouchableOpacity>

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

            <TouchableOpacity 
              style={[styles.submitButton, isUploading && { opacity: 0.7 }]} 
              onPress={handleUpload} 
              activeOpacity={0.85}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.submitButtonText}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Text>
            </TouchableOpacity>

            {/* ── Uploads List Header ── */}
            <Text style={styles.sectionTitle}>
              Uploads {uploads.length > 0 ? `(${uploads.length})` : ''}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[styles.filterChip, filterCategory === 'All' && styles.filterChipActive]}
                onPress={() => setFilterCategory('All')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filterCategory === 'All' && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const isActive = filterCategory === cat;
                const colors = categoryColors[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, isActive && { backgroundColor: colors.bg, borderColor: colors.text }]}
                    onPress={() => setFilterCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isActive && { color: colors.text, fontWeight: '700' }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#0284C7" size="large" />
              <Text style={styles.emptyText}>Loading gallery...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-upload-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No uploads yet</Text>
              <Text style={styles.emptySubtext}>Pick images and hit Upload</Text>
            </View>
          )
        }
      />

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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 12 },
  uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  uploadButton: { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 20 },
  uploadIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  previewStrip: { marginBottom: 8 },
  previewThumb: { width: 64, height: 64, borderRadius: 10, marginRight: 8, backgroundColor: '#F3F4F6' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownText: { fontSize: 14, color: '#111827' },
  dropdownPlaceholder: { color: '#9CA3AF' },
  textInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 80 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0284C7', borderRadius: 12, paddingVertical: 14, marginTop: 16 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  filterContainer: { gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, overflow: 'hidden', padding: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardImageWrapper: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#F3F4F6', overflow: 'hidden', marginRight: 12 },
  cardImage: { width: '100%', height: '100%' },
  cardInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  cardId: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  categoryBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },
  deleteButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', alignItems: 'center', justifyContent: 'center', marginLeft: 12, flexShrink: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  previewFullImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 },
  previewClose: { position: 'absolute', top: 52, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 4 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  modalOptionText: { fontSize: 15, color: '#374151' },
});
