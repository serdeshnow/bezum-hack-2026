package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	redisinfra "github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/redis"
)

var ErrSessionNotFound = errors.New("session not found")

type SessionRepository interface {
	Save(ctx context.Context, session Session, ttl time.Duration) error
	Get(ctx context.Context, sessionID string) (*Session, error)
	Delete(ctx context.Context, sessionID string) error
}

type RedisSessionRepository struct {
	client *redisinfra.Client
}

func NewSessionRepository(client *redisinfra.Client) *RedisSessionRepository {
	return &RedisSessionRepository{client: client}
}

func (r *RedisSessionRepository) Save(ctx context.Context, session Session, ttl time.Duration) error {
	payload, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("marshal session: %w", err)
	}

	if err := r.client.Raw().Set(ctx, r.client.SessionKey(session.ID), payload, ttl).Err(); err != nil {
		return fmt.Errorf("save session: %w", err)
	}

	return nil
}

func (r *RedisSessionRepository) Get(ctx context.Context, sessionID string) (*Session, error) {
	value, err := r.client.Raw().Get(ctx, r.client.SessionKey(sessionID)).Result()
	if err != nil {
		if err.Error() == "redis: nil" {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("get session: %w", err)
	}

	var session Session
	if err := json.Unmarshal([]byte(value), &session); err != nil {
		return nil, fmt.Errorf("unmarshal session: %w", err)
	}

	return &session, nil
}

func (r *RedisSessionRepository) Delete(ctx context.Context, sessionID string) error {
	deleted, err := r.client.Raw().Del(ctx, r.client.SessionKey(sessionID)).Result()
	if err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	if deleted == 0 {
		return ErrSessionNotFound
	}

	return nil
}
