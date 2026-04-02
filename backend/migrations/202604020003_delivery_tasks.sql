-- +goose Up
CREATE TABLE releases
(
    id               SERIAL PRIMARY KEY,
    project_id       INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    version          VARCHAR     NOT NULL,
    title            VARCHAR     NOT NULL,
    status           VARCHAR     NOT NULL CHECK (status IN
                                                 ('planned', 'in-progress', 'deployed', 'failed', 'rolled-back')),
    target_date      DATE,
    deployed_at      TIMESTAMPTZ,
    commits_count    INTEGER     NOT NULL DEFAULT 0 CHECK (commits_count >= 0),
    author_user_id   INTEGER     NOT NULL REFERENCES users (id),
    features_count   INTEGER     NOT NULL DEFAULT 0 CHECK (features_count >= 0),
    fixes_count      INTEGER     NOT NULL DEFAULT 0 CHECK (fixes_count >= 0),
    breaking_count   INTEGER     NOT NULL DEFAULT 0 CHECK (breaking_count >= 0),
    progress_percent INTEGER     NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks
(
    id               SERIAL PRIMARY KEY,
    project_id       INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    epoch_id         INTEGER     REFERENCES epochs (id) ON DELETE SET NULL,
    key              VARCHAR     NOT NULL,
    title            VARCHAR     NOT NULL,
    description      VARCHAR     NOT NULL,
    status           VARCHAR     NOT NULL CHECK (status IN
                                                 ('backlog', 'todo', 'in-progress', 'review', 'done', 'cancelled')),
    priority         VARCHAR     NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assignee_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    reporter_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    due_date         DATE,
    created_date     DATE,
    release_id       INTEGER     REFERENCES releases (id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_tags
(
    id         SERIAL PRIMARY KEY,
    task_id    INTEGER     NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    value      VARCHAR     NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_blockers
(
    id          SERIAL PRIMARY KEY,
    task_id     INTEGER     NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    title       VARCHAR     NOT NULL,
    description VARCHAR,
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_watchers
(
    id         SERIAL PRIMARY KEY,
    task_id    INTEGER     NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_comments
(
    id             SERIAL PRIMARY KEY,
    task_id        INTEGER     NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    author_user_id INTEGER     NOT NULL REFERENCES users (id),
    content        VARCHAR     NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_comment_mentions
(
    id                SERIAL PRIMARY KEY,
    task_comment_id   INTEGER     NOT NULL REFERENCES task_comments (id) ON DELETE CASCADE,
    mentioned_user_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_activities
(
    id            SERIAL PRIMARY KEY,
    task_id       INTEGER     NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    actor_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    type          VARCHAR     NOT NULL,
    action        VARCHAR     NOT NULL,
    metadata_json JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS task_activities;
DROP TABLE IF EXISTS task_comment_mentions;
DROP TABLE IF EXISTS task_comments;
DROP TABLE IF EXISTS task_watchers;
DROP TABLE IF EXISTS task_blockers;
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS releases;
