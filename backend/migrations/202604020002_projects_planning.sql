-- +goose Up
CREATE TABLE projects
(
    id               SERIAL PRIMARY KEY,
    key              VARCHAR     NOT NULL,
    name             VARCHAR     NOT NULL,
    description      VARCHAR,
    status           VARCHAR     NOT NULL CHECK (status IN ('draft', 'active', 'at-risk', 'archived', 'completed')),
    visibility_mode  VARCHAR     NOT NULL CHECK (visibility_mode IN ('internal', 'customer')),
    owner_user_id    INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    active_epoch_id  INTEGER,
    due_date         DATE,
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    progress_percent INTEGER     NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members
(
    id         SERIAL PRIMARY KEY,
    project_id INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role       VARCHAR     NOT NULL CHECK (role IN ('customer', 'developer', 'manager', 'admin')),
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE epochs
(
    id             SERIAL PRIMARY KEY,
    project_id     INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name           VARCHAR     NOT NULL,
    phase          VARCHAR     NOT NULL,
    status         VARCHAR     NOT NULL CHECK (status IN ('draft', 'active', 'at-risk', 'archived', 'completed')),
    start_date     DATE,
    end_date       DATE,
    days_remaining INTEGER CHECK (days_remaining >= 0),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goals
(
    id               SERIAL PRIMARY KEY,
    epoch_id         INTEGER     NOT NULL REFERENCES epochs (id) ON DELETE CASCADE,
    title            VARCHAR     NOT NULL,
    description      VARCHAR,
    status           VARCHAR     NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')),
    progress_percent INTEGER     NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    owner_user_id    INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS epochs;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
