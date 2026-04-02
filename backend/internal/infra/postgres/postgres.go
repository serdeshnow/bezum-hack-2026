package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Client struct {
	pool   *pgxpool.Pool
	logger *logger.Logger
}

func MustNew(cfg config.PGConfig, log *logger.Logger) *Client {
	client, err := New(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to initialize postgres client")
		panic(err)
	}

	return client
}

func New(cfg config.PGConfig, log *logger.Logger) (*Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), cfg.Timeout)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("create postgres pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &Client{
		pool:   pool,
		logger: log,
	}, nil
}

func (c *Client) Pool() *pgxpool.Pool {
	return c.pool
}
