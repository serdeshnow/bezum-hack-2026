package redis

import (
	"context"
	"fmt"

	goredis "github.com/redis/go-redis/v9"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Client struct {
	raw    *goredis.Client
	logger *logger.Logger
	prefix string
}

func MustNew(cfg config.RedisConfig, log *logger.Logger) *Client {
	client, err := New(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to initialize redis client")
		panic(err)
	}

	return client
}

func New(cfg config.RedisConfig, log *logger.Logger) (*Client, error) {
	client := goredis.NewClient(&goredis.Options{
		Addr:     cfg.Address(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	return &Client{
		raw:    client,
		logger: log,
		prefix: cfg.SessionPrefix,
	}, nil
}

func (c *Client) Raw() *goredis.Client {
	return c.raw
}

func (c *Client) SessionKey(sessionID string) string {
	return fmt.Sprintf("%s:%s", c.prefix, sessionID)
}
