package nextcloud

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Client struct {
	baseURL     string
	talkBaseURL string
	roomPrefix  string
	httpClient  *http.Client
	username    string
	password    string
	logger      *logger.Logger
}

func MustNew(cfg config.NextcloudConfig, log *logger.Logger) *Client {
	client, err := New(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to initialize nextcloud client")
		panic(err)
	}

	return client
}

func New(cfg config.NextcloudConfig, log *logger.Logger) (*Client, error) {
	if _, err := url.ParseRequestURI(cfg.BaseURL); err != nil {
		return nil, fmt.Errorf("invalid nextcloud base_url: %w", err)
	}

	talkBaseURL := cfg.TalkBaseURL
	if strings.TrimSpace(talkBaseURL) == "" {
		talkBaseURL = cfg.BaseURL
	}

	return &Client{
		baseURL:     strings.TrimRight(cfg.BaseURL, "/"),
		talkBaseURL: strings.TrimRight(talkBaseURL, "/"),
		roomPrefix:  cfg.RoomPrefix,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
		username: cfg.Username,
		password: cfg.Password,
		logger:   log,
	}, nil
}

type MeetingRoom struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

var ErrRecordingNotReady = errors.New("nextcloud recording not ready")

type Recording struct {
	Filename    string
	ContentType string
	DurationSec *int
	Reader      io.ReadCloser
}

func (c *Client) BuildMeetingRoom(title string) MeetingRoom {
	roomID := uuid.NewString()
	slug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(title), " ", "-"))
	if slug == "" {
		slug = "meeting"
	}

	name := fmt.Sprintf("%s-%s-%s", c.roomPrefix, slug, roomID[:8])

	return MeetingRoom{
		Name: name,
		URL:  fmt.Sprintf("%s/call/%s", c.talkBaseURL, name),
	}
}

func (c *Client) Healthcheck() error {
	req, err := http.NewRequest(http.MethodGet, c.baseURL+"/status.php", nil)
	if err != nil {
		return fmt.Errorf("build nextcloud healthcheck: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("nextcloud healthcheck request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("nextcloud healthcheck returned status %d", resp.StatusCode)
	}

	var payload map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return fmt.Errorf("decode nextcloud healthcheck response: %w", err)
	}

	return nil
}

func (c *Client) FetchRecording(_ context.Context, _ string) (*Recording, error) {
	return nil, ErrRecordingNotReady
}
