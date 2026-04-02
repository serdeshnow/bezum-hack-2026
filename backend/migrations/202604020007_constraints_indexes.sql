-- +goose Up
ALTER TABLE projects
    ADD CONSTRAINT projects_active_epoch_id_fkey
        FOREIGN KEY (active_epoch_id) REFERENCES epochs (id) ON DELETE SET NULL;

ALTER TABLE documents
    ADD CONSTRAINT documents_current_version_id_fkey
        FOREIGN KEY (current_version_id) REFERENCES document_versions (id) ON DELETE SET NULL;

ALTER TABLE users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

ALTER TABLE projects
    ADD CONSTRAINT projects_key_key UNIQUE (key);

ALTER TABLE project_members
    ADD CONSTRAINT project_members_project_id_user_id_key UNIQUE (project_id, user_id);

ALTER TABLE tasks
    ADD CONSTRAINT tasks_project_id_key_key UNIQUE (project_id, key);

ALTER TABLE task_watchers
    ADD CONSTRAINT task_watchers_task_id_user_id_key UNIQUE (task_id, user_id);

ALTER TABLE task_comment_mentions
    ADD CONSTRAINT task_comment_mentions_task_comment_id_mentioned_user_id_key UNIQUE (task_comment_id, mentioned_user_id);

ALTER TABLE document_owners
    ADD CONSTRAINT document_owners_document_id_user_id_key UNIQUE (document_id, user_id);

ALTER TABLE document_approvers
    ADD CONSTRAINT document_approvers_document_id_user_id_key UNIQUE (document_id, user_id);

ALTER TABLE document_versions
    ADD CONSTRAINT document_versions_document_id_version_label_key UNIQUE (document_id, version_label);

ALTER TABLE document_approvals
    ADD CONSTRAINT document_approvals_document_version_id_approver_user_id_key UNIQUE (document_version_id, approver_user_id);

ALTER TABLE meeting_participants
    ADD CONSTRAINT meeting_participants_meeting_id_user_id_key UNIQUE (meeting_id, user_id);

ALTER TABLE meeting_availability_votes
    ADD CONSTRAINT meeting_availability_votes_slot_id_participant_user_id_key UNIQUE (slot_id, participant_user_id);

ALTER TABLE meeting_linked_documents
    ADD CONSTRAINT meeting_linked_documents_meeting_id_document_id_key UNIQUE (meeting_id, document_id);

ALTER TABLE pull_requests
    ADD CONSTRAINT pull_requests_project_id_number_key UNIQUE (project_id, number);

CREATE INDEX idx_user_preferences_user_id ON user_preferences (user_id);
CREATE INDEX idx_projects_owner_user_id ON projects (owner_user_id);
CREATE INDEX idx_projects_active_epoch_id ON projects (active_epoch_id);
CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id ON project_members (user_id);
CREATE INDEX idx_epochs_project_id ON epochs (project_id);
CREATE INDEX idx_goals_epoch_id ON goals (epoch_id);
CREATE INDEX idx_goals_owner_user_id ON goals (owner_user_id);
CREATE INDEX idx_releases_project_id ON releases (project_id);
CREATE INDEX idx_releases_author_user_id ON releases (author_user_id);
CREATE INDEX idx_tasks_project_status_priority ON tasks (project_id, status, priority);
CREATE INDEX idx_tasks_assignee_status ON tasks (assignee_user_id, status);
CREATE INDEX idx_tasks_epoch_id ON tasks (epoch_id);
CREATE INDEX idx_tasks_release_id ON tasks (release_id);
CREATE INDEX idx_tasks_reporter_user_id ON tasks (reporter_user_id);
CREATE INDEX idx_task_tags_task_id ON task_tags (task_id);
CREATE INDEX idx_task_blockers_task_id ON task_blockers (task_id);
CREATE INDEX idx_task_watchers_user_id ON task_watchers (user_id);
CREATE INDEX idx_task_comments_task_id ON task_comments (task_id);
CREATE INDEX idx_task_comments_author_user_id ON task_comments (author_user_id);
CREATE INDEX idx_task_comment_mentions_mentioned_user_id ON task_comment_mentions (mentioned_user_id);
CREATE INDEX idx_task_activities_task_id ON task_activities (task_id);
CREATE INDEX idx_task_activities_actor_user_id ON task_activities (actor_user_id);
CREATE INDEX idx_document_folders_project_id ON document_folders (project_id);
CREATE INDEX idx_document_folders_parent_folder_id ON document_folders (parent_folder_id);
CREATE INDEX idx_documents_project_folder_status_scope ON documents (project_id, folder_id, status, access_scope);
CREATE INDEX idx_documents_author_user_id ON documents (author_user_id);
CREATE INDEX idx_documents_current_version_id ON documents (current_version_id);
CREATE INDEX idx_document_owners_user_id ON document_owners (user_id);
CREATE INDEX idx_document_approvers_user_id ON document_approvers (user_id);
CREATE INDEX idx_document_versions_document_id ON document_versions (document_id);
CREATE INDEX idx_document_versions_author_user_id ON document_versions (author_user_id);
CREATE INDEX idx_document_approvals_document_version_id ON document_approvals (document_version_id);
CREATE INDEX idx_document_approvals_approver_user_id ON document_approvals (approver_user_id);
CREATE INDEX idx_document_decision_logs_document_version_id ON document_decision_logs (document_version_id);
CREATE INDEX idx_document_comments_document_id ON document_comments (document_id);
CREATE INDEX idx_document_comments_author_user_id ON document_comments (author_user_id);
CREATE INDEX idx_document_links_document_id ON document_links (document_id);
CREATE INDEX idx_document_links_entity ON document_links (entity_type, entity_id);
CREATE INDEX idx_meetings_project_status_starts_at ON meetings (project_id, status, starts_at);
CREATE INDEX idx_meetings_epoch_id ON meetings (epoch_id);
CREATE INDEX idx_meetings_source_context ON meetings (source_context_type, source_context_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants (user_id);
CREATE INDEX idx_meeting_availability_slots_meeting_id ON meeting_availability_slots (meeting_id);
CREATE INDEX idx_meeting_availability_votes_participant_user_id ON meeting_availability_votes (participant_user_id);
CREATE INDEX idx_meeting_transcript_entries_meeting_id ON meeting_transcript_entries (meeting_id);
CREATE INDEX idx_meeting_transcript_entries_speaker_user_id ON meeting_transcript_entries (speaker_user_id);
CREATE INDEX idx_meeting_decisions_meeting_id ON meeting_decisions (meeting_id);
CREATE INDEX idx_meeting_decisions_owner_user_id ON meeting_decisions (owner_user_id);
CREATE INDEX idx_meeting_action_items_meeting_id ON meeting_action_items (meeting_id);
CREATE INDEX idx_meeting_action_items_task_id ON meeting_action_items (task_id);
CREATE INDEX idx_meeting_action_items_assignee_user_id ON meeting_action_items (assignee_user_id);
CREATE INDEX idx_meeting_linked_documents_document_id ON meeting_linked_documents (document_id);
CREATE INDEX idx_pull_requests_project_id ON pull_requests (project_id);
CREATE INDEX idx_pull_requests_release_id ON pull_requests (release_id);
CREATE INDEX idx_pull_requests_author_user_id ON pull_requests (author_user_id);
CREATE INDEX idx_notifications_user_id_read_at_created_at ON notifications (user_id, read_at, created_at DESC);
CREATE INDEX idx_notifications_actor_user_id ON notifications (actor_user_id);
CREATE INDEX idx_notifications_entity ON notifications (entity_type, entity_id);
CREATE INDEX idx_activity_feed_project_id_created_at ON activity_feed (project_id, created_at DESC);
CREATE INDEX idx_activity_feed_actor_user_id ON activity_feed (actor_user_id);

-- +goose Down
DROP INDEX IF EXISTS idx_activity_feed_actor_user_id;
DROP INDEX IF EXISTS idx_activity_feed_project_id_created_at;
DROP INDEX IF EXISTS idx_notifications_entity;
DROP INDEX IF EXISTS idx_notifications_actor_user_id;
DROP INDEX IF EXISTS idx_notifications_user_id_read_at_created_at;
DROP INDEX IF EXISTS idx_pull_requests_author_user_id;
DROP INDEX IF EXISTS idx_pull_requests_release_id;
DROP INDEX IF EXISTS idx_pull_requests_project_id;
DROP INDEX IF EXISTS idx_meeting_linked_documents_document_id;
DROP INDEX IF EXISTS idx_meeting_action_items_assignee_user_id;
DROP INDEX IF EXISTS idx_meeting_action_items_task_id;
DROP INDEX IF EXISTS idx_meeting_action_items_meeting_id;
DROP INDEX IF EXISTS idx_meeting_decisions_owner_user_id;
DROP INDEX IF EXISTS idx_meeting_decisions_meeting_id;
DROP INDEX IF EXISTS idx_meeting_transcript_entries_speaker_user_id;
DROP INDEX IF EXISTS idx_meeting_transcript_entries_meeting_id;
DROP INDEX IF EXISTS idx_meeting_availability_votes_participant_user_id;
DROP INDEX IF EXISTS idx_meeting_availability_slots_meeting_id;
DROP INDEX IF EXISTS idx_meeting_participants_user_id;
DROP INDEX IF EXISTS idx_meetings_source_context;
DROP INDEX IF EXISTS idx_meetings_epoch_id;
DROP INDEX IF EXISTS idx_meetings_project_status_starts_at;
DROP INDEX IF EXISTS idx_document_links_entity;
DROP INDEX IF EXISTS idx_document_links_document_id;
DROP INDEX IF EXISTS idx_document_comments_author_user_id;
DROP INDEX IF EXISTS idx_document_comments_document_id;
DROP INDEX IF EXISTS idx_document_decision_logs_document_version_id;
DROP INDEX IF EXISTS idx_document_approvals_approver_user_id;
DROP INDEX IF EXISTS idx_document_approvals_document_version_id;
DROP INDEX IF EXISTS idx_document_versions_author_user_id;
DROP INDEX IF EXISTS idx_document_versions_document_id;
DROP INDEX IF EXISTS idx_document_approvers_user_id;
DROP INDEX IF EXISTS idx_document_owners_user_id;
DROP INDEX IF EXISTS idx_documents_current_version_id;
DROP INDEX IF EXISTS idx_documents_author_user_id;
DROP INDEX IF EXISTS idx_documents_project_folder_status_scope;
DROP INDEX IF EXISTS idx_document_folders_parent_folder_id;
DROP INDEX IF EXISTS idx_document_folders_project_id;
DROP INDEX IF EXISTS idx_task_activities_actor_user_id;
DROP INDEX IF EXISTS idx_task_activities_task_id;
DROP INDEX IF EXISTS idx_task_comment_mentions_mentioned_user_id;
DROP INDEX IF EXISTS idx_task_comments_author_user_id;
DROP INDEX IF EXISTS idx_task_comments_task_id;
DROP INDEX IF EXISTS idx_task_watchers_user_id;
DROP INDEX IF EXISTS idx_task_blockers_task_id;
DROP INDEX IF EXISTS idx_task_tags_task_id;
DROP INDEX IF EXISTS idx_tasks_reporter_user_id;
DROP INDEX IF EXISTS idx_tasks_release_id;
DROP INDEX IF EXISTS idx_tasks_epoch_id;
DROP INDEX IF EXISTS idx_tasks_assignee_status;
DROP INDEX IF EXISTS idx_tasks_project_status_priority;
DROP INDEX IF EXISTS idx_releases_author_user_id;
DROP INDEX IF EXISTS idx_releases_project_id;
DROP INDEX IF EXISTS idx_goals_owner_user_id;
DROP INDEX IF EXISTS idx_goals_epoch_id;
DROP INDEX IF EXISTS idx_epochs_project_id;
DROP INDEX IF EXISTS idx_project_members_user_id;
DROP INDEX IF EXISTS idx_project_members_project_id;
DROP INDEX IF EXISTS idx_projects_active_epoch_id;
DROP INDEX IF EXISTS idx_projects_owner_user_id;
DROP INDEX IF EXISTS idx_user_preferences_user_id;

ALTER TABLE pull_requests
    DROP CONSTRAINT IF EXISTS pull_requests_project_id_number_key;
ALTER TABLE meeting_linked_documents
    DROP CONSTRAINT IF EXISTS meeting_linked_documents_meeting_id_document_id_key;
ALTER TABLE meeting_availability_votes
    DROP CONSTRAINT IF EXISTS meeting_availability_votes_slot_id_participant_user_id_key;
ALTER TABLE meeting_participants
    DROP CONSTRAINT IF EXISTS meeting_participants_meeting_id_user_id_key;
ALTER TABLE document_approvals
    DROP CONSTRAINT IF EXISTS document_approvals_document_version_id_approver_user_id_key;
ALTER TABLE document_versions
    DROP CONSTRAINT IF EXISTS document_versions_document_id_version_label_key;
ALTER TABLE document_approvers
    DROP CONSTRAINT IF EXISTS document_approvers_document_id_user_id_key;
ALTER TABLE document_owners
    DROP CONSTRAINT IF EXISTS document_owners_document_id_user_id_key;
ALTER TABLE task_comment_mentions
    DROP CONSTRAINT IF EXISTS task_comment_mentions_task_comment_id_mentioned_user_id_key;
ALTER TABLE task_watchers
    DROP CONSTRAINT IF EXISTS task_watchers_task_id_user_id_key;
ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_project_id_key_key;
ALTER TABLE project_members
    DROP CONSTRAINT IF EXISTS project_members_project_id_user_id_key;
ALTER TABLE projects
    DROP CONSTRAINT IF EXISTS projects_key_key;
ALTER TABLE user_preferences
    DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE documents
    DROP CONSTRAINT IF EXISTS documents_current_version_id_fkey;
ALTER TABLE projects
    DROP CONSTRAINT IF EXISTS projects_active_epoch_id_fkey;
