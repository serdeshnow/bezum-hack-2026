-- +goose Up
CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    email         VARCHAR     NOT NULL,
    first_name    VARCHAR     NOT NULL,
    last_name     VARCHAR     NOT NULL,
    display_name  VARCHAR,
    avatar_url    VARCHAR,
    role          VARCHAR     NOT NULL CHECK (role IN ('customer', 'developer', 'manager', 'admin')),
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    password_hash VARCHAR,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_preferences
(
    id                            SERIAL PRIMARY KEY,
    user_id                       INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    theme                         VARCHAR     NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    compact_mode                  BOOLEAN     NOT NULL DEFAULT FALSE,
    email_notifications           BOOLEAN     NOT NULL DEFAULT TRUE,
    task_assignments_enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
    meeting_reminders_enabled     BOOLEAN     NOT NULL DEFAULT TRUE,
    release_notifications_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    mention_notifications_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS users;
