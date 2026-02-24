import cron from 'node-cron';
import admin from 'firebase-admin';
import { supabase } from '../config/supabaseClient.js';

export const initScheduler = () => {
  cron.schedule('* * * * *', async () => {
    
    try {
      const now = new Date().toISOString();
      const { data: pendingTasks, error: taskError } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          user_id, 
          profiles (fcm_token)
        `)
        .lte('reminder_time', now)
        .eq('notified', false);

      if (taskError) throw taskError;

      if (!pendingTasks || pendingTasks.length === 0) {
        return; 
      }

      for (const task of pendingTasks) {
        const userFcmToken = task.profiles?.fcm_token;

        if (!userFcmToken) {
          console.log(`Skip: No FCM token found for user: ${task.user_id}`);
          continue;
        }

        const message = {
          notification: {
            title: 'Study Time!',
            body: `Your scheduled session "${task.title}" is starting now.`,
          },
          token: userFcmToken
        };

        try {
          await admin.messaging().send(message);
          console.log(`Sent notification for task: ${task.title}`);

          await supabase
            .from('tasks')
            .update({ notified: true })
            .eq('id', task.id);
            
        } catch (fcmError) {
          console.error(`FCM Error for task ${task.id}:`, fcmError.message);
          
          if (
            fcmError.code === 'messaging/registration-token-not-registered' || 
            fcmError.message.includes('Requested entity was not found')
          ) {
            console.log(`Token is dead. Removing from database for user ${task.user_id}`);
            await supabase
              .from('profiles')
              .update({ fcm_token: null })
              .eq('id', task.user_id);
          }
        }
      }
    } catch (error) {
      console.error('Scheduler Error:', error.message);
    }
  });
};