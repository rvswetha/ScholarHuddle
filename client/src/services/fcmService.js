import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import { supabase } from "./supabaseClient";

export const saveFcmToken = async (userId) => {
  try {
    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log("Notification permission denied.");
      return;
    }

    // 2. Get the Token from Firebase
    // Replace 'YOUR_VAPID_KEY' with the key from Firebase Console > Cloud Messaging
    const token = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
    });

    if (token) {
      console.log("FCM Token generated:", token);

      // 3. Save it to the 'profiles' table in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('id', userId);

      if (error) throw error;
      console.log("FCM Token successfully synced with Supabase.");
    }
  } catch (error) {
    console.error("Error in fcmService:", error);
  }
};