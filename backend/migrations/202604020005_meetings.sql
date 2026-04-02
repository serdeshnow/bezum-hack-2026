-- +goose Up
CREATE TABLE meetings
(
    id                     SERIAL PRIMARY KEY,
    project_id             INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    epoch_id               INTEGER     REFERENCES epochs (id) ON DELETE SET NULL,
    source_context_type    VARCHAR     NOT NULL CHECK (source_context_type IN ('task', 'doc', 'epoch', 'project', 'none')),
    source_context_id      INTEGER,
    title                  VARCHAR     NOT NULL,
    description            VARCHAR,
    type                   VARCHAR     NOT NULL CHECK (type IN
                                                       ('standup', 'planning', 'review', 'retrospective', 'workshop',
                                                        'ad-hoc')),
    status                 VARCHAR     NOT NULL CHECK (status IN ('draft', 'scheduled', 'completed', 'cancelled')),
    starts_at              TIMESTAMPTZ,
    ends_at                TIMESTAMPTZ,
    recording_url          VARCHAR,
    recording_duration_sec INTEGER CHECK (recording_duration_sec >= 0),
    ai_summary_approved    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_participants
(
    id         SERIAL PRIMARY KEY,
    meeting_id INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_label VARCHAR     NOT NULL,
    attended   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_availability_slots
(
    id             SERIAL PRIMARY KEY,
    meeting_id     INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    starts_at      TIMESTAMPTZ NOT NULL,
    ends_at        TIMESTAMPTZ NOT NULL,
    score          INTEGER     NOT NULL DEFAULT 0 CHECK (score >= 0),
    is_recommended BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_availability_votes
(
    id                  SERIAL PRIMARY KEY,
    slot_id             INTEGER     NOT NULL REFERENCES meeting_availability_slots (id) ON DELETE CASCADE,
    participant_user_id INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status              VARCHAR     NOT NULL CHECK (status IN ('available', 'maybe', 'unavailable', 'no-response')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_transcript_entries
(
    id              SERIAL PRIMARY KEY,
    meeting_id      INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    speaker_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    speaker_name    VARCHAR,
    starts_at_sec   INTEGER     NOT NULL CHECK (starts_at_sec >= 0),
    text            VARCHAR     NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_decisions
(
    id            SERIAL PRIMARY KEY,
    meeting_id    INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    decision      VARCHAR     NOT NULL,
    rationale     VARCHAR,
    owner_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_action_items
(
    id               SERIAL PRIMARY KEY,
    meeting_id       INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    task_id          INTEGER     REFERENCES tasks (id) ON DELETE SET NULL,
    task_text        VARCHAR     NOT NULL,
    assignee_user_id INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    due_date         DATE,
    priority         VARCHAR     NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    already_task     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_linked_documents
(
    id                SERIAL PRIMARY KEY,
    meeting_id        INTEGER     NOT NULL REFERENCES meetings (id) ON DELETE CASCADE,
    document_id       INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    update_suggestion VARCHAR,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS meeting_linked_documents;
DROP TABLE IF EXISTS meeting_action_items;
DROP TABLE IF EXISTS meeting_decisions;
DROP TABLE IF EXISTS meeting_transcript_entries;
DROP TABLE IF EXISTS meeting_availability_votes;
DROP TABLE IF EXISTS meeting_availability_slots;
DROP TABLE IF EXISTS meeting_participants;
DROP TABLE IF EXISTS meetings;
