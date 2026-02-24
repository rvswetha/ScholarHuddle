import admin from '../config/firebaseAdmin.js';
import { supabase } from '../config/supabaseClient.js'; // Ensure your server has Supabase initialized!

export const sendChatNotification = async (req, res) => {
  try {
    const { senderName, messageText, studyGroupId, senderId } = req.body;

    // 1. Find all users in this study group (excluding the sender)
    // Assuming you have a 'group_members' table linking users to groups
    const { data: members, error: memberError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', studyGroupId)
      .neq('user_id', senderId);

    if (memberError || !members.length) {
      return res.status(200).json({ message: "No other users to notify." });
    }

    const memberIds = members.map(m => m.user_id);

    // 2. Get the FCM tokens for those users from the 'profiles' table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('fcm_token')
      .in('id', memberIds)
      .not('fcm_token', 'is', null);

    if (profileError || !profiles.length) {
      return res.status(200).json({ message: "No valid FCM tokens found." });
    }

    const tokens = profiles.map(p => p.fcm_token);

    // 3. Construct the Firebase payload
    const payload = {
      notification: {
        title: `New message from ${senderName}`,
        body: messageText,
      },
      tokens: tokens, // Send to multiple devices at once!
    };

    // 4. Fire the notification via Google Firebase
    const response = await admin.messaging().sendEachForMulticast(payload);
    
    res.status(200).json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });

  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};