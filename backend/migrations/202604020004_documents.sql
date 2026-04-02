-- +goose Up
CREATE TABLE document_folders
(
    id               SERIAL PRIMARY KEY,
    project_id       INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    parent_folder_id INTEGER REFERENCES document_folders (id) ON DELETE CASCADE,
    name             VARCHAR     NOT NULL,
    sort_order       INTEGER     NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents
(
    id                 SERIAL PRIMARY KEY,
    project_id         INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    folder_id          INTEGER     REFERENCES document_folders (id) ON DELETE SET NULL,
    title              VARCHAR     NOT NULL,
    description        VARCHAR,
    status             VARCHAR     NOT NULL CHECK (status IN ('draft', 'in-review', 'approved', 'obsolete', 'rejected')),
    access_scope       VARCHAR     NOT NULL CHECK (access_scope IN ('customer', 'manager', 'dev', 'internal')),
    author_user_id     INTEGER     NOT NULL REFERENCES users (id),
    current_version_id INTEGER,
    awaiting_approval  BOOLEAN     NOT NULL DEFAULT FALSE,
    is_starred         BOOLEAN     NOT NULL DEFAULT FALSE,
    archived_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_owners
(
    id          SERIAL PRIMARY KEY,
    document_id INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_approvers
(
    id          SERIAL PRIMARY KEY,
    document_id INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    approved    BOOLEAN     NOT NULL DEFAULT FALSE,
    decision_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_versions
(
    id               SERIAL PRIMARY KEY,
    document_id      INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    version_label    VARCHAR     NOT NULL,
    content_markdown VARCHAR     NOT NULL,
    change_source    VARCHAR     NOT NULL CHECK (change_source IN ('manual', 'meeting', 'task', 'imported')),
    source_detail    VARCHAR,
    author_user_id   INTEGER     REFERENCES users (id) ON DELETE SET NULL,
    additions        INTEGER     NOT NULL DEFAULT 0 CHECK (additions >= 0),
    deletions        INTEGER     NOT NULL DEFAULT 0 CHECK (deletions >= 0),
    modifications    INTEGER     NOT NULL DEFAULT 0 CHECK (modifications >= 0),
    status           VARCHAR     NOT NULL CHECK (status IN ('draft', 'in-review', 'approved', 'obsolete', 'rejected')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_approvals
(
    id                  SERIAL PRIMARY KEY,
    document_version_id INTEGER     NOT NULL REFERENCES document_versions (id) ON DELETE CASCADE,
    approver_user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status              VARCHAR     NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'requested-changes')),
    decision            VARCHAR CHECK (decision IN ('pending', 'approved', 'rejected', 'requested-changes')),
    rationale           VARCHAR,
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_decision_logs
(
    id                  SERIAL PRIMARY KEY,
    document_version_id INTEGER     NOT NULL REFERENCES document_versions (id) ON DELETE CASCADE,
    approver_user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    decision            VARCHAR     NOT NULL CHECK (decision IN ('pending', 'approved', 'rejected', 'requested-changes')),
    rationale           VARCHAR,
    "timestamp"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_comments
(
    id             SERIAL PRIMARY KEY,
    document_id    INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    author_user_id INTEGER     NOT NULL REFERENCES users (id),
    content        VARCHAR     NOT NULL,
    resolved       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_links
(
    id          SERIAL PRIMARY KEY,
    document_id INTEGER     NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    entity_type VARCHAR     NOT NULL CHECK (entity_type IN ('epoch', 'task', 'meeting', 'release', 'project')),
    entity_id   INTEGER     NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS document_links;
DROP TABLE IF EXISTS document_comments;
DROP TABLE IF EXISTS document_decision_logs;
DROP TABLE IF EXISTS document_approvals;
DROP TABLE IF EXISTS document_versions;
DROP TABLE IF EXISTS document_approvers;
DROP TABLE IF EXISTS document_owners;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS document_folders;
