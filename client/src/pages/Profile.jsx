import React from 'react';
import { requestNotificationPermission } from '../services/firebase';
import { supabase } from '../services/supabaseClient';

function Profile() {
  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      console.log("Here is your FCM Token:", token);
      // 1. Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 2. Save the token to the 'profiles' table
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            fcm_token: token
          });
        if (error) {
          alert('Error saving token: ' + error.message);
        } else {
          alert('Notifications enabled and token saved!');
        }
      } else {
        alert('You must be logged in to save notification settings.');
      }
    } else {
      alert('Notification permission was not granted.');
    }
  };
  return (
    <div>
      <h2>Profile Settings</h2>
      <button onClick={handleEnableNotifications}>
        Enable Notifications
      </button>
    </div>
  );
}

export default Profile;