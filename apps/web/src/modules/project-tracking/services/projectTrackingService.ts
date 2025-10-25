import supabaseService from '../../../services/supabaseService';
import {
  ProjectData,
  ProjectMilestone,
  ProjectTask,
  ProjectComment,
  ProjectUpdate,
  MilestoneKPI
} from '../types';

export class ProjectTrackingService {
  // Projects
  static async getProject(projectId: string): Promise<ProjectData | null> {
    try {
      const { data, error } = await supabaseService.supabaseService.supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones(*),
          tasks:project_tasks(*),
          team:project_team_members(*),
          risks:project_risks(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as ProjectData;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  static async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  }

  // Milestones
  static async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_milestones')
        .select(`
          *,
          kpis:milestone_kpis(*)
        `)
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
  }

  static async updateMilestone(milestoneId: string, updates: Partial<ProjectMilestone>): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', milestoneId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating milestone:', error);
      return false;
    }
  }

  static async createMilestone(projectId: string, milestone: Omit<ProjectMilestone, 'id'>): Promise<ProjectMilestone | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_milestones')
        .insert({
          ...milestone,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      return null;
    }
  }

  // Tasks
  static async getTasks(milestoneId: string): Promise<ProjectTask[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_tasks')
        .select('*')
        .eq('milestone_id', milestoneId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  static async createTask(task: Omit<ProjectTask, 'id'>): Promise<ProjectTask | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // KPIs
  static async updateKPI(kpiId: string, updates: Partial<MilestoneKPI>): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('milestone_kpis')
        .update(updates)
        .eq('id', kpiId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating KPI:', error);
      return false;
    }
  }

  static async createKPI(milestoneId: string, kpi: Omit<MilestoneKPI, 'id'>): Promise<MilestoneKPI | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('milestone_kpis')
        .insert({
          ...kpi,
          milestone_id: milestoneId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating KPI:', error);
      return null;
    }
  }

  // Comments
  static async getComments(projectId: string): Promise<ProjectComment[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_comments')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async createComment(projectId: string, comment: Omit<ProjectComment, 'id' | 'timestamp'>): Promise<ProjectComment | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_comments')
        .insert({
          ...comment,
          project_id: projectId,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabaseService.supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Updates
  static async getUpdates(projectId: string): Promise<ProjectUpdate[]> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching updates:', error);
      return [];
    }
  }

  static async createUpdate(update: Omit<ProjectUpdate, 'id' | 'timestamp'>): Promise<ProjectUpdate | null> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('project_updates')
        .insert({
          ...update,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating update:', error);
      return null;
    }
  }

  // Real-time subscriptions
  static subscribeToProjectChanges(
    projectId: string,
    onUpdate: (payload: any) => void
  ) {
    return supabaseService.supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_milestones', filter: `project_id=eq.${projectId}` },
        onUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_tasks' },
        onUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_comments', filter: `project_id=eq.${projectId}` },
        onUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_updates', filter: `project_id=eq.${projectId}` },
        onUpdate
      )
      .subscribe();
  }

  static unsubscribeFromProjectChanges(projectId: string) {
    return supabaseService.supabase.channel(`project-${projectId}`).unsubscribe();
  }
}