import { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentMethod } from '@/types/budget';
import { toast } from '@/hooks/use-toast';

export interface SpendDraft {
  id: string;
  amount: number;
  note: string;
  paymentMethod: PaymentMethod;
  dateISO: string;
  originalMessage?: string;
  sender?: string;
}

const DRAFTS_STORAGE_KEY = '@finance_tracker_drafts';
const DRAFTS_UPDATED_EVENT = 'drafts_updated';

export function useDrafts() {
  const [drafts, setDrafts] = useState<SpendDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
    const subscription = DeviceEventEmitter.addListener(DRAFTS_UPDATED_EVENT, loadDrafts);
    return () => subscription.remove();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const jsonValue = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
      if (jsonValue != null) {
        setDrafts(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load drafts', e);
      toast({ title: 'Error', description: 'Failed to load message drafts.' });
    } finally {
      setLoading(false);
    }
  };

  const addDraft = async (draft: Omit<SpendDraft, 'id'>) => {
    try {
      const newDraft: SpendDraft = {
        ...draft,
        id: Date.now().toString() + Math.random().toString(36).substring(7),
      };
      
      // Read the latest drafts from storage to prevent stale closure issues
      const jsonValue = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
      const currentDrafts = jsonValue ? JSON.parse(jsonValue) : [];
      
      const updatedDrafts = [newDraft, ...currentDrafts];
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      DeviceEventEmitter.emit(DRAFTS_UPDATED_EVENT);
      
      toast({ 
        title: 'Payment Detected', 
        description: `₹${draft.amount} spent at ${draft.note}. Saved as draft.` 
      });
    } catch (e) {
      console.error('Failed to add draft', e);
    }
  };

  const removeDraft = async (id: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
      const currentDrafts: SpendDraft[] = jsonValue ? JSON.parse(jsonValue) : [];
      const updatedDrafts = currentDrafts.filter(d => d.id !== id);
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      DeviceEventEmitter.emit(DRAFTS_UPDATED_EVENT);
    } catch (e) {
      console.error('Failed to remove draft', e);
    }
  };

  const clearDrafts = async () => {
    try {
      await AsyncStorage.removeItem(DRAFTS_STORAGE_KEY);
      setDrafts([]);
      DeviceEventEmitter.emit(DRAFTS_UPDATED_EVENT);
    } catch (e) {
      console.error('Failed to clear drafts', e);
    }
  };

  return {
    drafts,
    loading,
    addDraft,
    removeDraft,
    clearDrafts,
    refreshDrafts: loadDrafts
  };
}
