import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import {
  InventoryItem,
  StockStatus,
  usePharmacyStore,
} from '@/lib/pharmacy-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

const CATEGORIES = [
  'All',
  'Antibiotics',
  'Analgesics',
  'Chronic Care',
  'Cold Chain',
  'First Aid',
  'Supplements',
] as const;

export default function InventoryManagementScreen() {
  const { openMenu } = useSideMenu();
  const { inventory, updateStock, addNewMedicine, alerts } = usePharmacyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StockStatus | 'All'>('All');
  const [showNotifications, setShowNotifications] = useState(false);

  // Update Stock Modal
  const [updateModalItem, setUpdateModalItem] = useState<InventoryItem | null>(null);
  const [stockDelta, setStockDelta] = useState('50');
  const [isDeductMode, setIsDeductMode] = useState(false);

  // Add New Medicine Modal Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<InventoryItem['category']>('Antibiotics');
  const [newForm, setNewForm] = useState<InventoryItem['form']>('Tablet');
  const [newBatch, setNewBatch] = useState('');
  const [newStock, setNewStock] = useState('100');
  const [newMinThreshold, setNewMinThreshold] = useState('30');
  const [newPrice, setNewPrice] = useState('15.00');
  const [newRack, setNewRack] = useState('Rack A-1');
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newColdChain, setNewColdChain] = useState(false);

  // Computed Summary Metrics
  const lowStockCount = useMemo(() => inventory.filter(i => i.status === 'Low Stock').length, [inventory]);
  const outOfStockCount = useMemo(() => inventory.filter(i => i.status === 'Out of Stock').length, [inventory]);
  const expiringCount = useMemo(() => inventory.filter(i => i.status === 'Expiring Soon').length, [inventory]);

  // Filtered List
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStatus = selectedStatusFilter === 'All' || item.status === selectedStatusFilter;
      if (!matchesCategory || !matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.rackLocation.toLowerCase().includes(q)
      );
    });
  }, [inventory, selectedCategory, selectedStatusFilter, searchQuery]);

  const handleSaveStockUpdate = () => {
    if (!updateModalItem) return;
    const qty = parseInt(stockDelta, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid stock amount.');
      return;
    }
    const finalDelta = isDeductMode ? -qty : qty;
    updateStock(updateModalItem.id, finalDelta, false);
    Alert.alert(
      'Stock Updated',
      `${isDeductMode ? 'Deducted' : 'Added'} ${qty} units for ${updateModalItem.name}. New Total: ${Math.max(
        0,
        updateModalItem.currentStock + finalDelta
      )} units.`
    );
    setUpdateModalItem(null);
    setStockDelta('50');
    setIsDeductMode(false);
  };

  const handleCreateMedicine = () => {
    if (!newName.trim() || !newBrand.trim()) {
      Alert.alert('Missing Details', 'Please provide a Medicine Name and Brand.');
      return;
    }
    addNewMedicine({
      name: newName.trim(),
      brand: newBrand.trim(),
      category: newCategory,
      form: newForm,
      sku: `MED-${Date.now().toString().slice(-5)}`,
      batchNumber: newBatch.trim() || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      currentStock: parseInt(newStock, 10) || 50,
      minThreshold: parseInt(newMinThreshold, 10) || 20,
      unitPrice: parseFloat(newPrice) || 10,
      rackLocation: newRack.trim() || 'Rack A-1',
      expiryDate: newExpiry.trim() || '2027-12-31',
      requiresColdChain: newColdChain,
    });
    Alert.alert('Medicine Added', `${newName} has been added to pharmacy inventory.`);
    setShowAddModal(false);
    // Reset Form
    setNewName('');
    setNewBrand('');
    setNewBatch('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Inventory"
        showMenu
        showNotification
        badgeCount={alerts.length}
        hasUnreadNotifications={alerts.length > 0}
        onPressNotification={() => setShowNotifications(true)}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Medicine Inventory</Text>
            <Text style={styles.headerSubtitle}>{inventory.length} Registered Drugs</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Add New Medicine Action */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by drug, brand, SKU or rack..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addMedBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addMedBtnText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Summary Metric Cards */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={[styles.metricCard, selectedStatusFilter === 'All' && styles.metricCardActive]}
            onPress={() => setSelectedStatusFilter('All')}
            activeOpacity={0.8}
          >
            <Text style={styles.metricVal}>{inventory.length}</Text>
            <Text style={styles.metricLabel}>Total SKUs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              { borderColor: '#FDE68A' },
              selectedStatusFilter === 'Low Stock' && styles.metricCardActiveAmber,
            ]}
            onPress={() => setSelectedStatusFilter(selectedStatusFilter === 'Low Stock' ? 'All' : 'Low Stock')}
            activeOpacity={0.8}
          >
            <Text style={[styles.metricVal, { color: '#D97706' }]}>{lowStockCount}</Text>
            <Text style={styles.metricLabel}>Low Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              { borderColor: '#FED7AA' },
              selectedStatusFilter === 'Expiring Soon' && styles.metricCardActiveOrange,
            ]}
            onPress={() => setSelectedStatusFilter(selectedStatusFilter === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
            activeOpacity={0.8}
          >
            <Text style={[styles.metricVal, { color: '#EA580C' }]}>{expiringCount}</Text>
            <Text style={styles.metricLabel}>Expiring</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              { borderColor: '#FECDD3' },
              selectedStatusFilter === 'Out of Stock' && styles.metricCardActiveRed,
            ]}
            onPress={() => setSelectedStatusFilter(selectedStatusFilter === 'Out of Stock' ? 'All' : 'Out of Stock')}
            activeOpacity={0.8}
          >
            <Text style={[styles.metricVal, { color: '#DC2626' }]}>{outOfStockCount}</Text>
            <Text style={styles.metricLabel}>Out of Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isCatActive && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, isCatActive && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Inventory Item Cards */}
        {filteredInventory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Medicines Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search query or filters.</Text>
          </View>
        ) : (
          filteredInventory.map((item) => {
            const isOut = item.status === 'Out of Stock';
            const isLow = item.status === 'Low Stock';
            const isExpiring = item.status === 'Expiring Soon';

            return (
              <View key={item.id} style={styles.itemCard}>
                {/* Header: Name, Brand, Status Pill */}
                <View style={styles.itemCardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemBrand}>
                      {item.brand} • {item.form} • {item.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isOut && styles.statusOut,
                      isLow && styles.statusLow,
                      isExpiring && styles.statusExpiring,
                      !isOut && !isLow && !isExpiring && styles.statusInStock,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isOut && styles.textOut,
                        isLow && styles.textLow,
                        isExpiring && styles.textExpiring,
                        !isOut && !isLow && !isExpiring && styles.textInStock,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Stock Level Progress */}
                <View style={styles.stockLevelContainer}>
                  <View style={styles.stockLevelHeader}>
                    <Text style={styles.stockQtyText}>
                      <Text style={[styles.stockQtyBold, (isLow || isOut) && { color: '#DC2626' }]}>
                        {item.currentStock}
                      </Text>{' '}
                      units in stock
                    </Text>
                    <Text style={styles.stockMinText}>Min Alert: {item.minThreshold}</Text>
                  </View>

                  {/* Visual Stock Bar */}
                  <View style={styles.stockBarBg}>
                    <View
                      style={[
                        styles.stockBarFill,
                        {
                          width: `${Math.min(100, Math.max(4, (item.currentStock / (item.minThreshold * 2.5)) * 100))}%`,
                          backgroundColor: isOut ? '#EF4444' : isLow ? '#F59E0B' : isExpiring ? '#EA580C' : '#10B981',
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Meta details grid: SKU, Batch, Rack, Expiry, Cold Chain */}
                <View style={styles.itemMetaGrid}>
                  <View style={styles.itemMetaCol}>
                    <Text style={styles.itemMetaLabel}>Batch Code</Text>
                    <Text style={styles.itemMetaVal}>{item.batchNumber}</Text>
                  </View>
                  <View style={styles.itemMetaCol}>
                    <Text style={styles.itemMetaLabel}>Location</Text>
                    <Text style={styles.itemMetaVal}>{item.rackLocation}</Text>
                  </View>
                  <View style={styles.itemMetaCol}>
                    <Text style={styles.itemMetaLabel}>Expiry Date</Text>
                    <Text style={[styles.itemMetaVal, isExpiring && { color: '#EA580C', fontWeight: '800' }]}>
                      {item.expiryDate}
                    </Text>
                  </View>
                  <View style={styles.itemMetaCol}>
                    <Text style={styles.itemMetaLabel}>Unit Price</Text>
                    <Text style={styles.itemMetaVal}>₹{item.unitPrice.toFixed(2)}</Text>
                  </View>
                </View>

                {item.requiresColdChain && (
                  <View style={styles.coldChainTag}>
                    <Ionicons name="snow" size={13} color="#0284C7" />
                    <Text style={styles.coldChainText}>Cold Chain Required (2°C - 8°C Storage)</Text>
                  </View>
                )}

                {/* Update Stock Button */}
                <View style={styles.itemActionRow}>
                  <TouchableOpacity
                    style={styles.btnQuickRestock}
                    onPress={() => {
                      setUpdateModalItem(item);
                      setStockDelta('50');
                      setIsDeductMode(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cube-outline" size={15} color="#1A66E8" />
                    <Text style={styles.btnQuickRestockText}>Update / Restock Units</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL: Update Stock Quantity (+ / -) */}
      {/* ========================================================================= */}
      <Modal
        visible={!!updateModalItem}
        transparent
        animationType="slide"
        onRequestClose={() => setUpdateModalItem(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setUpdateModalItem(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Adjust Stock Level</Text>
                <Text style={styles.modalSub}>{updateModalItem?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setUpdateModalItem(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Mode Toggle: Restock vs Dispense/Deduct */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeToggleBtn, !isDeductMode && styles.modeToggleActiveAdd]}
                onPress={() => setIsDeductMode(false)}
              >
                <Ionicons name="add" size={16} color={!isDeductMode ? '#FFFFFF' : '#334155'} />
                <Text style={[styles.modeToggleText, !isDeductMode && styles.modeToggleTextActive]}>
                  Add Stock (Restock)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeToggleBtn, isDeductMode && styles.modeToggleActiveDeduct]}
                onPress={() => setIsDeductMode(true)}
              >
                <Ionicons name="remove" size={16} color={isDeductMode ? '#FFFFFF' : '#334155'} />
                <Text style={[styles.modeToggleText, isDeductMode && styles.modeToggleTextActive]}>
                  Deduct Stock (Dispense)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Chips */}
            <View style={styles.quickChipsRow}>
              {['10', '25', '50', '100', '200'].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.quickChip}
                  onPress={() => setStockDelta(chip)}
                >
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.stockInput}
              keyboardType="number-pad"
              value={stockDelta}
              onChangeText={setStockDelta}
              placeholder="Enter quantity..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.saveStockBtn} onPress={handleSaveStockUpdate} activeOpacity={0.8}>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveStockBtnText}>Confirm Stock Adjustment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Add New Medicine Form */}
      {/* ========================================================================= */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowAddModal(false)} />
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New Medicine</Text>
                <Text style={styles.modalSub}>Register new stock item into dispensary</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Medicine Name & Strength *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Paracetamol 650mg"
                placeholderTextColor="#94A3B8"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.formLabel}>Manufacturer / Brand *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Cipla, Sun Pharma"
                placeholderTextColor="#94A3B8"
                value={newBrand}
                onChangeText={setNewBrand}
              />

              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {(['Antibiotics', 'Analgesics', 'Chronic Care', 'Cold Chain', 'First Aid', 'Supplements'] as const).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.formSelectChip, newCategory === cat && styles.formSelectChipActive]}
                      onPress={() => setNewCategory(cat)}
                    >
                      <Text style={[styles.formSelectChipText, newCategory === cat && styles.formSelectChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              <View style={styles.formRow2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Initial Stock</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="number-pad"
                    placeholder="100"
                    placeholderTextColor="#94A3B8"
                    value={newStock}
                    onChangeText={setNewStock}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Min Alert Qty</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    value={newMinThreshold}
                    onChangeText={setNewMinThreshold}
                  />
                </View>
              </View>

              <View style={styles.formRow2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Rack / Shelf Location</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Rack B-2"
                    placeholderTextColor="#94A3B8"
                    value={newRack}
                    onChangeText={setNewRack}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Unit Price (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="decimal-pad"
                    placeholder="15.00"
                    placeholderTextColor="#94A3B8"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Expiry Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="2027-12-31"
                placeholderTextColor="#94A3B8"
                value={newExpiry}
                onChangeText={setNewExpiry}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setNewColdChain(!newColdChain)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={newColdChain ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={newColdChain ? PRIMARY_BLUE : '#94A3B8'}
                />
                <Text style={styles.checkboxLabel}>Requires Cold Storage (2°C - 8°C)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveStockBtn} onPress={handleCreateMedicine} activeOpacity={0.8}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.saveStockBtnText}>Add to Pharmacy Inventory</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: Notifications List Modal */}
      {/* ========================================================================= */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNotifications(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Dispensary Notifications</Text>
                <Text style={styles.modalSub}>{alerts.length} Active System Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {alerts.length === 0 ? (
                <View style={styles.emptyNotifBox}>
                  <Ionicons name="checkmark-circle-outline" size={36} color="#15803D" />
                  <Text style={styles.emptyNotifText}>No active alerts. All systems normal!</Text>
                </View>
              ) : (
                alerts.map((al) => (
                  <View key={al.id} style={styles.notifItem}>
                    <View style={styles.notifIconWrap}>
                      <Ionicons
                        name={
                          al.type === 'danger'
                            ? 'alert-circle'
                            : al.type === 'warning'
                            ? 'warning'
                            : al.type === 'success'
                            ? 'shield-checkmark'
                            : 'information-circle'
                        }
                        size={20}
                        color={
                          al.type === 'danger'
                            ? '#DC2626'
                            : al.type === 'warning'
                            ? '#D97706'
                            : al.type === 'success'
                            ? '#15803D'
                            : '#1A66E8'
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{al.title}</Text>
                      <Text style={styles.notifMsg}>{al.message}</Text>
                      <Text style={styles.notifTime}>{al.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  headerSubtitle: {
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Search & Add Row
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 24,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addMedBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Summary Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  metricCardActive: {
    borderColor: PRIMARY_BLUE,
    backgroundColor: '#EFF6FF',
  },
  metricCardActiveAmber: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  metricCardActiveOrange: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  metricCardActiveRed: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'center',
  },

  // Category Filter Scroll
  categoryScroll: {
    maxHeight: 44,
  },
  categoryContainer: {
    gap: 8,
  },
  catChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  catChipActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },

  // Item Card
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  itemBrand: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusInStock: { backgroundColor: '#DCFCE7' },
  statusLow: { backgroundColor: '#FEF3C7' },
  statusOut: { backgroundColor: '#FEE2E2' },
  statusExpiring: { backgroundColor: '#FFEDD5' },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  textInStock: { color: '#15803D' },
  textLow: { color: '#B45309' },
  textOut: { color: '#EF4444' },
  textExpiring: { color: '#C2410C' },

  // Stock Level Progress Bar
  stockLevelContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
  },
  stockLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stockQtyText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  stockQtyBold: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  stockMinText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  stockBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Meta Details Grid
  itemMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemMetaCol: {
    alignItems: 'center',
  },
  itemMetaLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  itemMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  coldChainTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 6,
    borderRadius: 12,
  },
  coldChainText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },

  itemActionRow: {
    marginTop: 2,
  },
  btnQuickRestock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnQuickRestockText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  emptySub: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  modalSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  modeToggleActiveAdd: {
    backgroundColor: PRIMARY_BLUE,
  },
  modeToggleActiveDeduct: {
    backgroundColor: '#DC2626',
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  stockInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 16,
  },
  saveStockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 24,
    marginVertical: 10,
  },
  saveStockBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Form styles
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: TEXT_DARK,
    marginBottom: 10,
  },
  formRow2: {
    flexDirection: 'row',
    gap: 10,
  },
  formSelectChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 6,
  },
  formSelectChipActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  formSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  formSelectChipTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  // Notifications Modal Items
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  notifMsg: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyNotifBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyNotifText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '700',
  },
});
