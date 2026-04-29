"use server";

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Test phones bypass SMS: sendPhoneOtp is a no-op, and verifyPhoneOtp accepts the fixed OTP.
// Gated behind env vars so production never has hardcoded test numbers in source.
const TEST_OTPS: Record<string, string> =
  process.env.NEXT_PUBLIC_ENABLE_TEST_OTPS === 'true' && process.env.TEST_OTP_PHONES
    ? Object.fromEntries(
        process.env.TEST_OTP_PHONES.split(',').map((p) => [
          p.trim(),
          process.env.TEST_OTP_CODE || '123456',
        ]),
      )
    : {};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return phone.startsWith('+') ? phone : `+91${digits}`;
}

function syntheticEmailFor(phone: string) {
  return `test-${phone.replace('+', '')}@crestline.local`;
}

function syntheticPasswordFor(phone: string) {
  return `test-pw-${phone.replace('+', '')}-crestline`;
}

export async function sendPhoneOtp(phone: string) {
  const supabase = await createClient();
  const withCountry = normalizePhone(phone);

  if (TEST_OTPS[withCountry]) {
    return { success: true };
  }

  const { error } = await supabase.auth.signInWithOtp({ phone: withCountry });
  if (error) {
    console.error('[OTP] Send error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = await createClient();
  const phoneForVerify = normalizePhone(phone);

  const testOtp = TEST_OTPS[phoneForVerify];
  if (testOtp) {
    if (token !== testOtp) {
      return { success: false, error: 'Invalid OTP' };
    }

    const admin = createServiceRoleClient();
    const email = syntheticEmailFor(phoneForVerify);
    const password = syntheticPasswordFor(phoneForVerify);

    // Ensure a user exists for this test phone, with a known synthetic email + password
    // we can use to establish a real Supabase session via password sign-in.
    const { error: createErr } = await admin.auth.admin.createUser({
      phone: phoneForVerify,
      email,
      password,
      phone_confirm: true,
      email_confirm: true,
    });

    if (createErr && !/already|exists|registered|duplicate/i.test(createErr.message)) {
      console.error('[OTP] Test user create error:', createErr.message);
      return { success: false, error: createErr.message };
    }

    if (createErr) {
      // User already exists — find them and reset email/password so sign-in works.
      const phoneDigits = phoneForVerify.replace('+', '');
      let existingId: string | undefined;
      for (let page = 1; page <= 10 && !existingId; page++) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (listErr) {
          console.error('[OTP] Test user list error:', listErr.message);
          return { success: false, error: listErr.message };
        }
        const match = list?.users.find(
          (u) => u.phone === phoneDigits || u.phone === phoneForVerify || u.email === email,
        );
        if (match) existingId = match.id;
        if (!list || list.users.length < 200) break;
      }
      if (!existingId) {
        return { success: false, error: 'Could not locate existing test user' };
      }
      const { error: updateErr } = await admin.auth.admin.updateUserById(existingId, {
        email,
        password,
        email_confirm: true,
        phone: phoneForVerify,
        phone_confirm: true,
      });
      if (updateErr) {
        console.error('[OTP] Test user update error:', updateErr.message);
        return { success: false, error: updateErr.message };
      }
    }

    const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr || !signIn.session) {
      console.error('[OTP] Test sign-in error:', signInErr?.message);
      return { success: false, error: signInErr?.message || 'Verification failed' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signIn.user!.id)
      .single();

    return { success: true, role: profile?.role || 'member' };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneForVerify,
    token,
    type: 'sms',
  });
  if (error) {
    console.error('[OTP] Verify error:', error.message);
    return { success: false, error: error.message };
  }
  if (!data.session) return { success: false, error: 'Verification failed' };

  // Fetch the role to allow client-side redirection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user!.id)
    .single();

  return {
    success: true,
    role: profile?.role || 'member'
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
