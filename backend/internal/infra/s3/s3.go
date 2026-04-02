package s3

import (
	"bytes"
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Client struct {
	raw    *minio.Client
	bucket string
	logger *logger.Logger
}

func MustNew(cfg config.S3Config, log *logger.Logger) *Client {
	client, err := New(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to initialize s3 client")
		panic(err)
	}

	return client
}

func New(cfg config.S3Config, log *logger.Logger) (*Client, error) {
	raw, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
		Region: cfg.Region,
	})
	if err != nil {
		return nil, fmt.Errorf("create s3 client: %w", err)
	}

	exists, err := raw.BucketExists(context.Background(), cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("check s3 bucket: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("s3 bucket %q does not exist", cfg.Bucket)
	}

	return &Client{
		raw:    raw,
		bucket: cfg.Bucket,
		logger: log,
	}, nil
}

func (c *Client) Raw() *minio.Client {
	return c.raw
}

func (c *Client) Bucket() string {
	return c.bucket
}

func (c *Client) PutTextObject(ctx context.Context, objectKey, content string) (string, error) {
	reader := strings.NewReader(content)
	_, err := c.raw.PutObject(ctx, c.bucket, objectKey, reader, int64(len(content)), minio.PutObjectOptions{
		ContentType: "text/markdown; charset=utf-8",
	})
	if err != nil {
		return "", fmt.Errorf("put text object: %w", err)
	}

	return objectKey, nil
}

func (c *Client) PutBytesObject(ctx context.Context, objectKey string, content []byte, contentType string) (string, error) {
	reader := bytes.NewReader(content)
	_, err := c.raw.PutObject(ctx, c.bucket, objectKey, reader, int64(len(content)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("put bytes object: %w", err)
	}

	return objectKey, nil
}

func (c *Client) PresignedGetURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
	u, err := c.raw.PresignedGetObject(ctx, c.bucket, objectKey, expiry, url.Values{})
	if err != nil {
		return "", fmt.Errorf("presign object: %w", err)
	}

	return u.String(), nil
}
