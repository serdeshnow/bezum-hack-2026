# Database Models

Archive note:
This file contains the original broader proposal and is kept only for comparison.
The current reviewed source of truth is [review.md](/Users/serdeshnow/Programming/fullstack-projects/bezum-hack-2026/figma/contracts/review.md).

This document describes the normalized database shape inferred from the Figma product flows.

## 1. Identity and Preferences

### `users`

- `id`
- `email`
- `first_name`
- `last_name`
- `display_name`
- `avatar_url`
- `role`
- `is_active`
- `password_hash`
- `two_factor_enabled`
- `last_login_at`
- `created_at`
- `updated_at`

### `user_preferences`

- `id`
- `user_id`
- `theme`
- `compact_mode`
- `email_notifications`
- `task_assignments_enabled`
- `meeting_reminders_enabled`
- `release_notifications_enabled`
- `mention_notifications_enabled`
- `created_at`
- `updated_at`

## 2. Project Structure

### `projects`

- `id`
- `key`
- `name`
- `description`
- `status`
- `visibility_mode`
- `owner_user_id`
- `active_epoch_id`
- `due_date`
- `started_at`
- `completed_at`
- `progress_percent`
- `created_at`
- `updated_at`

### `project_members`

- `id`
- `project_id`
- `user_id`
- `role`
- `joined_at`
- `created_at`
- `updated_at`

## 3. Planning

### `epochs`

- `id`
- `project_id`
- `name`
- `phase`
- `status`
- `start_date`
- `end_date`
- `days_remaining`
- `created_at`
- `updated_at`

### `goals`

- `id`
- `epoch_id`
- `title`
- `description`
- `status`
- `progress_percent`
- `owner_user_id`
- `created_at`
- `updated_at`

## 4. Tasks

### `tasks`

- `id`
- `project_id`
- `epoch_id`
- `key`
- `title`
- `description`
- `status`
- `priority`
- `assignee_user_id`
- `reporter_user_id`
- `due_date`
- `created_date`
- `release_id`
- `created_at`
- `updated_at`

### `task_tags`

- `id`
- `task_id`
- `value`
- `created_at`
- `updated_at`

### `task_blockers`

- `id`
- `task_id`
- `title`
- `description`
- `resolved_at`
- `created_at`
- `updated_at`

### `task_watchers`

- `id`
- `task_id`
- `user_id`
- `created_at`
- `updated_at`

### `task_comments`

- `id`
- `task_id`
- `author_user_id`
- `content`
- `created_at`
- `updated_at`

### `task_comment_mentions`

- `id`
- `task_comment_id`
- `mentioned_user_id`
- `created_at`
- `updated_at`

### `task_activities`

- `id`
- `task_id`
- `actor_user_id`
- `type`
- `action`
- `metadata_json`
- `created_at`
- `updated_at`

## 5. Documents

### `document_folders`

- `id`
- `project_id`
- `parent_folder_id`
- `name`
- `sort_order`
- `created_at`
- `updated_at`

### `documents`

- `id`
- `project_id`
- `folder_id`
- `title`
- `description`
- `status`
- `access_scope`
- `author_user_id`
- `current_version_id`
- `awaiting_approval`
- `is_starred`
- `archived_at`
- `created_at`
- `updated_at`

### `document_owners`

- `id`
- `document_id`
- `user_id`
- `created_at`
- `updated_at`

### `document_approvers`

- `id`
- `document_id`
- `user_id`
- `approved`
- `decision_at`
- `created_at`
- `updated_at`

### `document_versions`

- `id`
- `document_id`
- `version_label`
- `content_markdown`
- `change_source`
- `source_detail`
- `author_user_id`
- `additions`
- `deletions`
- `modifications`
- `status`
- `created_at`
- `updated_at`

### `document_approvals`

- `id`
- `document_version_id`
- `approver_user_id`
- `status`
- `decision`
- `rationale`
- `decided_at`
- `created_at`
- `updated_at`

### `document_decision_logs`

- `id`
- `document_version_id`
- `approver_user_id`
- `decision`
- `rationale`
- `timestamp`
- `created_at`
- `updated_at`

### `document_comments`

- `id`
- `document_id`
- `author_user_id`
- `content`
- `resolved`
- `created_at`
- `updated_at`

### `document_links`

- `id`
- `document_id`
- `entity_type`
- `entity_id`
- `created_at`
- `updated_at`

## 6. Meetings

### `meetings`

- `id`
- `project_id`
- `epoch_id`
- `source_context_type`
- `source_context_id`
- `title`
- `description`
- `type`
- `status`
- `starts_at`
- `ends_at`
- `recording_url`
- `recording_duration_sec`
- `ai_summary_approved`
- `created_at`
- `updated_at`

### `meeting_participants`

- `id`
- `meeting_id`
- `user_id`
- `role_label`
- `attended`
- `created_at`
- `updated_at`

### `meeting_availability_slots`

- `id`
- `meeting_id`
- `starts_at`
- `ends_at`
- `score`
- `is_recommended`
- `created_at`
- `updated_at`

### `meeting_availability_votes`

- `id`
- `slot_id`
- `participant_user_id`
- `status`
- `created_at`
- `updated_at`

### `meeting_transcript_entries`

- `id`
- `meeting_id`
- `speaker_user_id`
- `speaker_name`
- `starts_at_sec`
- `text`
- `created_at`
- `updated_at`

### `meeting_decisions`

- `id`
- `meeting_id`
- `decision`
- `rationale`
- `owner_user_id`
- `created_at`
- `updated_at`

### `meeting_action_items`

- `id`
- `meeting_id`
- `task_id`
- `task_text`
- `assignee_user_id`
- `due_date`
- `priority`
- `already_task`
- `created_at`
- `updated_at`

### `meeting_linked_documents`

- `id`
- `meeting_id`
- `document_id`
- `update_suggestion`
- `created_at`
- `updated_at`

## 7. Delivery

### `releases`

- `id`
- `project_id`
- `version`
- `title`
- `status`
- `target_date`
- `deployed_at`
- `commits_count`
- `author_user_id`
- `features_count`
- `fixes_count`
- `breaking_count`
- `progress_percent`
- `created_at`
- `updated_at`

### `pull_requests`

- `id`
- `project_id`
- `release_id`
- `number`
- `title`
- `branch`
- `status`
- `author_user_id`
- `commits_count`
- `additions`
- `deletions`
- `external_url`
- `merged_at`
- `created_at`
- `updated_at`

## 8. Communication

### `notifications`

- `id`
- `user_id`
- `actor_user_id`
- `type`
- `title`
- `description`
- `entity_type`
- `entity_id`
- `channel`
- `read_at`
- `created_at`
- `updated_at`

### `activity_feed`

- `id`
- `project_id`
- `actor_user_id`
- `type`
- `action`
- `title`
- `metadata_json`
- `created_at`
- `updated_at`

## 9. Key Relationships

- one `project` has many `project_members`
- one `project` has many `epochs`, `tasks`, `documents`, `meetings`, `releases`, `pull_requests`
- one `epoch` has many `goals`, `tasks`, `meetings`
- one `task` has many `task_tags`, `task_blockers`, `task_comments`, `task_activities`
- one `document` has many `document_versions`, `document_comments`, `document_links`
- one `meeting` has many `meeting_participants`, `meeting_availability_slots`, `meeting_transcript_entries`, `meeting_decisions`, `meeting_action_items`
- one `release` may group many `pull_requests` and many `tasks`
- one `user` participates across ownership, assignee, approver, actor, watcher, notification receiver roles

## 10. Recommended Indexes

- `users(email)` unique
- `projects(key)` unique
- `tasks(project_id, status, priority)`
- `tasks(assignee_user_id, status)`
- `documents(project_id, folder_id, status, access_scope)`
- `document_versions(document_id, version_label)` unique
- `meetings(project_id, status, starts_at)`
- `meeting_availability_votes(slot_id, participant_user_id)` unique
- `pull_requests(project_id, number)` unique
- `notifications(user_id, read_at, created_at desc)`
- `activity_feed(project_id, created_at desc)`
й
