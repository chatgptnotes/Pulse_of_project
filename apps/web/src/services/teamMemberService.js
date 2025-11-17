// Team Member Service
// Handles CRUD operations for team members (client & development teams)

import { supabase } from './supabaseService';

class TeamMemberService {
  constructor() {
    this.tableName = 'team_members';
    console.log('👥 Team Member Service initialized');
  }

  // Get all team members
  async getAllMembers(projectName = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('team_type', { ascending: true })
        .order('name', { ascending: true });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching team members:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} team members`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllMembers:', error);
      return [];
    }
  }

  // Get members by team type
  async getMembersByType(teamType, projectName = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('team_type', teamType)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching team members by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getMembersByType:', error);
      return [];
    }
  }

  // Get client team members
  async getClientTeam(projectName = null) {
    return this.getMembersByType('client', projectName);
  }

  // Get development team members
  async getDevelopmentTeam(projectName = null) {
    return this.getMembersByType('development', projectName);
  }

  // Get member by ID
  async getMemberById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching team member:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error in getMemberById:', error);
      return null;
    }
  }

  // Create new team member
  async createMember(memberData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...memberData,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating team member:', error);
        throw error;
      }

      console.log('✅ Team member created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createMember:', error);
      throw error;
    }
  }

  // Update team member
  async updateMember(id, updates) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating team member:', error);
        throw error;
      }

      console.log('✅ Team member updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in updateMember:', error);
      throw error;
    }
  }

  // Soft delete team member (set is_active to false)
  async deactivateMember(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deactivating team member:', error);
        throw error;
      }

      console.log('✅ Team member deactivated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in deactivateMember:', error);
      throw error;
    }
  }

  // Hard delete team member
  async deleteMember(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting team member:', error);
        throw error;
      }

      console.log('✅ Team member deleted');
      return true;
    } catch (error) {
      console.error('❌ Error in deleteMember:', error);
      throw error;
    }
  }

  // Get team statistics
  async getTeamStats(projectName = null) {
    try {
      const members = await this.getAllMembers(projectName);

      const stats = {
        total: members.length,
        client: members.filter(m => m.team_type === 'client').length,
        development: members.filter(m => m.team_type === 'development').length,
        byRole: {}
      };

      // Count by role
      members.forEach(member => {
        const role = member.role || 'Unspecified';
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error in getTeamStats:', error);
      return { total: 0, client: 0, development: 0, byRole: {} };
    }
  }
}

const teamMemberService = new TeamMemberService();
export default teamMemberService;
