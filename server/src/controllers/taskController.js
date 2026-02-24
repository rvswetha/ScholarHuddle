import { supabase } from '../config/supabaseClient.js';

export const getAllTasks = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createTask = async (req, res) => {
  const userId = req.user.id;
  const { title, start, end, priority, reminder_time } = req.body;

  if (!title || !start) {
    return res.status(400).json({ error: 'Title and start time are required.' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      { 
        title, 
        start, 
        end, 
        priority, 
        user_id: userId,
        reminder_time: reminder_time || start
      }
    ])
    .select();

  if (error) {
    console.error("Supabase Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data[0]);
};

export const updateTask = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, start, end, priority, reminder_time } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update({ title, start, end, priority, reminder_time })
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data[0]);
};

export const deleteTask = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: 'Task deleted successfully.' });
};