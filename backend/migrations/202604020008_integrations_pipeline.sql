-- +goose Up
CREATE TABLE github_pull_requests
(
    id                   SERIAL PRIMARY KEY,
    pull_request_id      INTEGER     NOT NULL REFERENCES pull_requests (id) ON DELETE CASCADE,
    task_id              INTEGER     REFERENCES tasks (id) ON DELETE SET NULL,
    github_node_id       VARCHAR     NOT NULL,
    repository_full_name VARCHAR     NOT NULL,
    head_branch          VARCHAR     NOT NULL,
    base_branch          VARCHAR     NOT NULL,
    payload_json         JSONB       NOT NULL DEFAULT '{}'::jsonb,
    last_event           VARCHAR     NOT NULL,
    synchronized_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_pipeline_jobs
(
    id               SERIAL PRIMARY KEY,
    meeting_id       INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    job_type         VARCHAR     NOT NULL,
    status           VARCHAR     NOT NULL,
    attempt          INTEGER     NOT NULL DEFAULT 0 CHECK (attempt >= 0),
    run_after        TIMESTAMPTZ NOT NULL,
    last_error       VARCHAR,
    payload_json     JSONB       NOT NULL DEFAULT '{}'::jsonb,
    finished_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_artifacts
(
    id               SERIAL PRIMARY KEY,
    meeting_id       INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    artifact_type    VARCHAR     NOT NULL,
    object_key       VARCHAR     NOT NULL,
    content_type     VARCHAR,
    metadata_json    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_summaries
(
    id               SERIAL PRIMARY KEY,
    meeting_id       INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    object_key       VARCHAR     NOT NULL,
    summary_text     VARCHAR,
    metadata_json    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE github_pull_requests
    ADD CONSTRAINT github_pull_requests_pull_request_id_key UNIQUE (pull_request_id);

ALTER TABLE github_pull_requests
    ADD CONSTRAINT github_pull_requests_github_node_id_key UNIQUE (github_node_id);

ALTER TABLE meeting_summaries
    ADD CONSTRAINT meeting_summaries_meeting_id_key UNIQUE (meeting_id);

CREATE INDEX idx_github_pull_requests_task_id ON github_pull_requests (task_id);
CREATE INDEX idx_github_pull_requests_repository_full_name ON github_pull_requests (repository_full_name);
CREATE INDEX idx_meeting_pipeline_jobs_meeting_id ON meeting_pipeline_jobs (meeting_id);
CREATE INDEX idx_meeting_pipeline_jobs_run_after_status ON meeting_pipeline_jobs (run_after, status);
CREATE INDEX idx_meeting_artifacts_meeting_id ON meeting_artifacts (meeting_id);
CREATE INDEX idx_meeting_artifacts_artifact_type ON meeting_artifacts (artifact_type);
CREATE INDEX idx_meeting_summaries_meeting_id ON meeting_summaries (meeting_id);

-- +goose Down
DROP INDEX IF EXISTS idx_meeting_summaries_meeting_id;
DROP INDEX IF EXISTS idx_meeting_artifacts_artifact_type;
DROP INDEX IF EXISTS idx_meeting_artifacts_meeting_id;
DROP INDEX IF EXISTS idx_meeting_pipeline_jobs_run_after_status;
DROP INDEX IF EXISTS idx_meeting_pipeline_jobs_meeting_id;
DROP INDEX IF EXISTS idx_github_pull_requests_repository_full_name;
DROP INDEX IF EXISTS idx_github_pull_requests_task_id;
ALTER TABLE github_pull_requests
    DROP CONSTRAINT IF EXISTS github_pull_requests_github_node_id_key;
ALTER TABLE github_pull_requests
    DROP CONSTRAINT IF EXISTS github_pull_requests_pull_request_id_key;
ALTER TABLE meeting_summaries
    DROP CONSTRAINT IF EXISTS meeting_summaries_meeting_id_key;
DROP TABLE IF EXISTS meeting_summaries;
DROP TABLE IF EXISTS meeting_artifacts;
DROP TABLE IF EXISTS meeting_pipeline_jobs;
DROP TABLE IF EXISTS github_pull_requests;
