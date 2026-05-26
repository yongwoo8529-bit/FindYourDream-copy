import { supabase } from './supabase.js';

export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) console.error('Error logging in:', error.message);
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
    window.location.reload();
}

export async function checkUser(onUserUpdate) {
    const { data: { user } } = await supabase.auth.getUser();
    onUserUpdate(user);

    supabase.auth.onAuthStateChange((_event, session) => {
        onUserUpdate(session?.user ?? null);
    });
}
