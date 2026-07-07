'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';
import { useAuth } from '@/contexts/AuthContext';

// Known plaintext encrypted under the user's passphrase and stored (as ciphertext)
// in profiles.enc_verifier. Decrypting it back to this exact string proves the
// entered passphrase is correct — without the server ever seeing the passphrase.
const VERIFIER_PLAINTEXT = 'ryvynn-verify-v1';

interface EncryptionContextType {
  ready: boolean;            // finished checking whether a passphrase exists
  hasPassphrase: boolean;    // a verifier exists for this account
  isUnlocked: boolean;       // passphrase held in memory this session
  unlockError: string | null;
  createPassphrase: (pass: string) => Promise<void>;
  unlock: (pass: string) => Promise<boolean>;
  lock: () => void;
  encryptText: (text: string) => Promise<string>;
  decryptText: (cipher: string) => Promise<string>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // The passphrase lives ONLY in memory, only for this tab session. It is never
  // written to storage, never sent to the server. Refresh/lock clears it.
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [hasPassphrase, setHasPassphrase] = useState(false);
  const [ready, setReady] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user) {
        setPassphrase(null);
        setHasPassphrase(false);
        setReady(true);
        return;
      }
      setReady(false);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('enc_verifier')
          .eq('id', user.id)
          .single();
        const v = data ? (data as { enc_verifier?: string | null }).enc_verifier : null;
        if (!cancelled) setHasPassphrase(!!v);
      } catch {
        if (!cancelled) setHasPassphrase(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [user]);

  const createPassphrase = useCallback(async (pass: string) => {
    setUnlockError(null);
    if (!user) throw new Error('Not signed in');
    if (pass.length < 8) {
      setUnlockError('Use at least 8 characters.');
      throw new Error('passphrase too short');
    }
    const verifier = await encrypt(VERIFIER_PLAINTEXT, pass);
    const { error } = await supabase
      .from('profiles')
      .update({ enc_verifier: verifier })
      .eq('id', user.id);
    if (error) {
      setUnlockError('Could not save passphrase. Try again.');
      throw error;
    }
    setHasPassphrase(true);
    setPassphrase(pass);
  }, [user]);

  const unlock = useCallback(async (pass: string): Promise<boolean> => {
    setUnlockError(null);
    if (!user) return false;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('enc_verifier')
        .eq('id', user.id)
        .single();
      const verifier = data ? (data as { enc_verifier?: string | null }).enc_verifier : null;
      if (!verifier) {
        setUnlockError('No passphrase set yet.');
        return false;
      }
      const result = await decrypt(verifier, pass);
      if (result === VERIFIER_PLAINTEXT) {
        setPassphrase(pass);
        return true;
      }
      setUnlockError('Incorrect passphrase.');
      return false;
    } catch {
      // AES-GCM throws on a wrong key — treat as incorrect passphrase.
      setUnlockError('Incorrect passphrase.');
      return false;
    }
  }, [user]);

  const lock = useCallback(() => setPassphrase(null), []);

  const encryptText = useCallback(async (text: string) => {
    if (!passphrase) throw new Error('Encryption is locked');
    return encrypt(text, passphrase);
  }, [passphrase]);

  const decryptText = useCallback(async (cipher: string) => {
    if (!passphrase) throw new Error('Encryption is locked');
    return decrypt(cipher, passphrase);
  }, [passphrase]);

  return (
    <EncryptionContext.Provider
      value={{
        ready,
        hasPassphrase,
        isUnlocked: passphrase !== null,
        unlockError,
        createPassphrase,
        unlock,
        lock,
        encryptText,
        decryptText,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const ctx = useContext(EncryptionContext);
  if (!ctx) throw new Error('useEncryption must be used within EncryptionProvider');
  return ctx;
}
