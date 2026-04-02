-- +goose Up
CREATE TABLE pull_requests
(
    id             SERIAL PRIMARY KEY,
    project_id     INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    release_id     INTEGER     REFERENCES releases (id) ON DELETE SET NULL,
    number         INTEGER     NOT NULL CHECK (number >= 0),
    title          VARCHAR     NOT NULL,
    branch         VARCHAR     NOT NULL,
    status         VARCHAR     NOT NULL CHECK (status IN ('open', 'reviewing', 'merged', 'closed')),
    author_user_id INTEGER     NOT NULL REFERENCES users (id),
    commits_count  INTEGER     NOT NULL DEFAULT 0 CHECK (commits_count >= 0),
    additions      INTEGER     NOT NULL DEFAULT 0 CHECK (additions >= 0),
    deletions      INTEGER     NOT NULL DEFAULT 0 CHECK (deletions >= 0),
    external_url   VARCHAR,
    merged_at      TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications
(
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    actor_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    type          VARCHAR     NOT NULL,
    title         VARCHAR     NOT NULL,
    description   VARCHAR     NOT NULL,
    entity_type   VARCHAR,
    entity_id     INTEGER,
    channel       VARCHAR,
    read_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_feed
(
    id            SERIAL PRIMARY KEY,
    project_id    INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    actor_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    type          VARCHAR     NOT NULL,
    action        VARCHAR     NOT NULL,
    title         VARCHAR     NOT NULL,
    metadata_json JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS activity_feed;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pull_requests;
