package config

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-viper/mapstructure/v2"
	"github.com/spf13/viper"
)

const (
	_defaultAppMode          = "debug"
	_defaultAppHost          = "0.0.0.0"
	_defaultAppPort          = 8080
	_defaultContextDuration  = 5 * time.Second
	_defaultAllowedOrigins   = "*"
	_defaultPGPort           = 5432
	_defaultMaxPoolSize      = 10
	_defaultConnAttempts     = 10
	_defaultConnTimeout      = time.Second
	_defaultRedisPort        = 6379
	_defaultJWTExpire        = 15 * time.Minute
	_defaultJWTSessionExpire = 24 * time.Hour
)

type Config struct {
	App       AppConfig       `mapstructure:"app"`
	PG        PGConfig        `mapstructure:"pg"`
	Redis     RedisConfig     `mapstructure:"redis"`
	JWT       JWTConfig       `mapstructure:"jwt"`
	S3        S3Config        `mapstructure:"s3"`
	Nextcloud NextcloudConfig `mapstructure:"nextcloud"`
	GitHub    GitHubConfig    `mapstructure:"github"`
	RabbitMQ  RabbitMQConfig  `mapstructure:"rabbitmq"`
}

type AppConfig struct {
	Mode            string        `mapstructure:"mode"`
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	AllowedOrigins  []string      `mapstructure:"allowed_origins"`
	ContextDuration time.Duration `mapstructure:"context_duration"`
}

func (c AppConfig) Address() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

type PGConfig struct {
	Name               string        `mapstructure:"name"`
	User               string        `mapstructure:"user"`
	Password           string        `mapstructure:"password"`
	Host               string        `mapstructure:"host"`
	Port               int           `mapstructure:"port"`
	SSLMode            string        `mapstructure:"ssl_mode"`
	MaxPool            int           `mapstructure:"max_pool"`
	Timeout            time.Duration `mapstructure:"timeout"`
	ConnectionAttempts int           `mapstructure:"connection_attempts"`
}

func (c PGConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s&pool_max_conns=%d",
		c.User,
		c.Password,
		c.Host,
		c.Port,
		c.Name,
		c.SSLMode,
		c.MaxPool,
	)
}

type RedisConfig struct {
	Host          string `mapstructure:"host"`
	Password      string `mapstructure:"password"`
	Port          int    `mapstructure:"port"`
	DB            int    `mapstructure:"db"`
	SessionPrefix string `mapstructure:"session_prefix"`
}

func (c RedisConfig) Address() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

type JWTConfig struct {
	Expire            time.Duration `mapstructure:"expire"`
	Secret            string        `mapstructure:"secret"`
	SessionExpiration time.Duration `mapstructure:"session_expiration"`
}

type S3Config struct {
	Endpoint  string `mapstructure:"endpoint"`
	Region    string `mapstructure:"region"`
	Bucket    string `mapstructure:"bucket"`
	AccessKey string `mapstructure:"access_key"`
	SecretKey string `mapstructure:"secret_key"`
	UseSSL    bool   `mapstructure:"use_ssl"`
}

type NextcloudConfig struct {
	BaseURL     string        `mapstructure:"base_url"`
	Username    string        `mapstructure:"username"`
	Password    string        `mapstructure:"password"`
	RoomPrefix  string        `mapstructure:"room_prefix"`
	Timeout     time.Duration `mapstructure:"timeout"`
	TalkBaseURL string        `mapstructure:"talk_base_url"`
}

type GitHubConfig struct {
	WebhookSecret   string `mapstructure:"webhook_secret"`
	BaseURL         string `mapstructure:"base_url"`
	RepositoryOwner string `mapstructure:"repository_owner"`
	RepositoryName  string `mapstructure:"repository_name"`
	ProjectID       int    `mapstructure:"project_id"`
	ActorUserID     int    `mapstructure:"actor_user_id"`
	TaskKeyPattern  string `mapstructure:"task_key_pattern"`
}

type RabbitMQConfig struct {
	URL                    string        `mapstructure:"url"`
	Exchange               string        `mapstructure:"exchange"`
	MeetingRecordingsQueue string        `mapstructure:"meeting_recordings_queue"`
	MLResultsQueue         string        `mapstructure:"ml_results_queue"`
	MLIntakeQueue          string        `mapstructure:"ml_intake_queue"`
	DeadLetterExchange     string        `mapstructure:"dead_letter_exchange"`
	PrefetchCount          int           `mapstructure:"prefetch_count"`
	RetryDelay             time.Duration `mapstructure:"retry_delay"`
}

func MustLoad() *Config {
	cfg, err := Load()
	if err != nil {
		panic(err)
	}
	return cfg
}

func Load() (*Config, error) {
	v := viper.New()

	v.SetConfigName(".env")
	v.SetConfigType("env")
	v.AddConfigPath(".")
	v.AutomaticEnv()

	setDefaults(v)

	if err := v.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return nil, fmt.Errorf("read config: %w", err)
		}
	}

	bindEnv(v)

	var cfg Config
	if err := v.Unmarshal(&cfg, withDecodeHooks()); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return &cfg, nil
}

func (c *Config) Validate() error {
	switch c.App.Mode {
	case "debug", "release", "test":
	default:
		return fmt.Errorf("app.mode must be one of debug, release, test")
	}

	if strings.TrimSpace(c.App.Host) == "" {
		return fmt.Errorf("app.host is required")
	}
	if c.App.Port <= 0 {
		return fmt.Errorf("app.port must be positive")
	}
	if c.App.ContextDuration <= 0 {
		return fmt.Errorf("app.context_duration must be positive")
	}

	if strings.TrimSpace(c.PG.Name) == "" {
		return fmt.Errorf("pg.name is required")
	}
	if strings.TrimSpace(c.PG.User) == "" {
		return fmt.Errorf("pg.user is required")
	}
	if strings.TrimSpace(c.PG.Password) == "" {
		return fmt.Errorf("pg.password is required")
	}
	if strings.TrimSpace(c.PG.Host) == "" {
		return fmt.Errorf("pg.host is required")
	}
	if c.PG.Port <= 0 {
		return fmt.Errorf("pg.port must be positive")
	}
	if strings.TrimSpace(c.PG.SSLMode) == "" {
		return fmt.Errorf("pg.ssl_mode is required")
	}
	if c.PG.MaxPool <= 0 {
		return fmt.Errorf("pg.max_pool must be positive")
	}
	if c.PG.ConnectionAttempts <= 0 {
		return fmt.Errorf("pg.connection_attempts must be positive")
	}
	if c.PG.Timeout <= 0 {
		return fmt.Errorf("pg.timeout must be positive")
	}

	if strings.TrimSpace(c.Redis.Host) == "" {
		return fmt.Errorf("redis.host is required")
	}
	if c.Redis.Port <= 0 {
		return fmt.Errorf("redis.port must be positive")
	}
	if c.Redis.DB < 0 {
		return fmt.Errorf("redis.db must be non-negative")
	}
	if strings.TrimSpace(c.Redis.SessionPrefix) == "" {
		return fmt.Errorf("redis.session_prefix is required")
	}

	if strings.TrimSpace(c.JWT.Secret) == "" {
		return fmt.Errorf("jwt.secret is required")
	}
	if c.JWT.Expire <= 0 {
		return fmt.Errorf("jwt.expire must be positive")
	}
	if c.JWT.SessionExpiration <= 0 {
		return fmt.Errorf("jwt.session_expiration must be positive")
	}

	if strings.TrimSpace(c.S3.Endpoint) == "" {
		return fmt.Errorf("s3.endpoint is required")
	}
	if strings.TrimSpace(c.S3.Region) == "" {
		return fmt.Errorf("s3.region is required")
	}
	if strings.TrimSpace(c.S3.Bucket) == "" {
		return fmt.Errorf("s3.bucket is required")
	}
	if strings.TrimSpace(c.S3.AccessKey) == "" {
		return fmt.Errorf("s3.access_key is required")
	}
	if strings.TrimSpace(c.S3.SecretKey) == "" {
		return fmt.Errorf("s3.secret_key is required")
	}

	if strings.TrimSpace(c.Nextcloud.BaseURL) == "" {
		return fmt.Errorf("nextcloud.base_url is required")
	}
	if strings.TrimSpace(c.Nextcloud.Username) == "" {
		return fmt.Errorf("nextcloud.username is required")
	}
	if strings.TrimSpace(c.Nextcloud.Password) == "" {
		return fmt.Errorf("nextcloud.password is required")
	}
	if c.Nextcloud.Timeout <= 0 {
		return fmt.Errorf("nextcloud.timeout must be positive")
	}

	if strings.TrimSpace(c.GitHub.WebhookSecret) == "" {
		return fmt.Errorf("github.webhook_secret is required")
	}
	if strings.TrimSpace(c.GitHub.BaseURL) == "" {
		return fmt.Errorf("github.base_url is required")
	}
	if strings.TrimSpace(c.GitHub.RepositoryOwner) == "" {
		return fmt.Errorf("github.repository_owner is required")
	}
	if strings.TrimSpace(c.GitHub.RepositoryName) == "" {
		return fmt.Errorf("github.repository_name is required")
	}
	if c.GitHub.ProjectID <= 0 {
		return fmt.Errorf("github.project_id must be positive")
	}
	if c.GitHub.ActorUserID <= 0 {
		return fmt.Errorf("github.actor_user_id must be positive")
	}
	if strings.TrimSpace(c.GitHub.TaskKeyPattern) == "" {
		return fmt.Errorf("github.task_key_pattern is required")
	}

	if strings.TrimSpace(c.RabbitMQ.URL) == "" {
		return fmt.Errorf("rabbitmq.url is required")
	}
	if strings.TrimSpace(c.RabbitMQ.Exchange) == "" {
		return fmt.Errorf("rabbitmq.exchange is required")
	}
	if strings.TrimSpace(c.RabbitMQ.MeetingRecordingsQueue) == "" {
		return fmt.Errorf("rabbitmq.meeting_recordings_queue is required")
	}
	if strings.TrimSpace(c.RabbitMQ.MLResultsQueue) == "" {
		return fmt.Errorf("rabbitmq.ml_results_queue is required")
	}
	if strings.TrimSpace(c.RabbitMQ.MLIntakeQueue) == "" {
		return fmt.Errorf("rabbitmq.ml_intake_queue is required")
	}
	if strings.TrimSpace(c.RabbitMQ.DeadLetterExchange) == "" {
		return fmt.Errorf("rabbitmq.dead_letter_exchange is required")
	}
	if c.RabbitMQ.PrefetchCount <= 0 {
		return fmt.Errorf("rabbitmq.prefetch_count must be positive")
	}
	if c.RabbitMQ.RetryDelay <= 0 {
		return fmt.Errorf("rabbitmq.retry_delay must be positive")
	}

	return nil
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("app.mode", _defaultAppMode)
	v.SetDefault("app.host", _defaultAppHost)
	v.SetDefault("app.port", _defaultAppPort)
	v.SetDefault("app.context_duration", _defaultContextDuration.String())
	v.SetDefault("app.allowed_origins", _defaultAllowedOrigins)

	v.SetDefault("pg.port", _defaultPGPort)
	v.SetDefault("pg.ssl_mode", "disable")
	v.SetDefault("pg.max_pool", _defaultMaxPoolSize)
	v.SetDefault("pg.connection_attempts", _defaultConnAttempts)
	v.SetDefault("pg.timeout", _defaultConnTimeout.String())

	v.SetDefault("redis.port", _defaultRedisPort)
	v.SetDefault("redis.db", 0)
	v.SetDefault("redis.session_prefix", "session")

	v.SetDefault("jwt.expire", _defaultJWTExpire.String())
	v.SetDefault("jwt.session_expiration", _defaultJWTSessionExpire.String())

	v.SetDefault("s3.region", "us-east-1")
	v.SetDefault("s3.use_ssl", false)

	v.SetDefault("nextcloud.base_url", "https://cloud.nastyn8.com")
	v.SetDefault("nextcloud.room_prefix", "seamless")
	v.SetDefault("nextcloud.timeout", (10 * time.Second).String())
	v.SetDefault("nextcloud.talk_base_url", "https://cloud.nastyn8.com")

	v.SetDefault("github.base_url", "https://api.github.com")
	v.SetDefault("github.task_key_pattern", "([A-Z][A-Z0-9]+-\\d+)")

	v.SetDefault("rabbitmq.exchange", "seamless")
	v.SetDefault("rabbitmq.meeting_recordings_queue", "meeting.recordings")
	v.SetDefault("rabbitmq.ml_results_queue", "meeting.ml.results")
	v.SetDefault("rabbitmq.ml_intake_queue", "meeting.ml.intake")
	v.SetDefault("rabbitmq.dead_letter_exchange", "seamless.dlx")
	v.SetDefault("rabbitmq.prefetch_count", 10)
	v.SetDefault("rabbitmq.retry_delay", (1 * time.Hour).String())

	v.SetDefault("oauth.yandex.auth_url", "https://oauth.yandex.ru/authorize")
	v.SetDefault("oauth.yandex.token_url", "https://oauth.yandex.ru/token")
	v.SetDefault("oauth.yandex.user_info_url", "https://login.yandex.ru/info")
	v.SetDefault("oauth.yandex.scopes", "login:email,login:info")
}

func bindEnv(v *viper.Viper) {
	_ = v.BindEnv("app.mode", "APP_MODE")
	_ = v.BindEnv("app.host", "APP_HOST")
	_ = v.BindEnv("app.port", "APP_PORT")
	_ = v.BindEnv("app.context_duration", "APP_CONTEXT_DURATION")
	_ = v.BindEnv("app.allowed_origins", "APP_ALLOWED_ORIGINS")

	_ = v.BindEnv("pg.name", "PG_NAME")
	_ = v.BindEnv("pg.user", "PG_USER")
	_ = v.BindEnv("pg.password", "PG_PASSWORD")
	_ = v.BindEnv("pg.host", "PG_HOST")
	_ = v.BindEnv("pg.port", "PG_PORT")
	_ = v.BindEnv("pg.ssl_mode", "PG_SSL_MODE")
	_ = v.BindEnv("pg.max_pool", "PG_MAX_POOL")
	_ = v.BindEnv("pg.timeout", "PG_TIMEOUT")
	_ = v.BindEnv("pg.connection_attempts", "PG_CONN_ATTEMPTS")

	_ = v.BindEnv("redis.host", "REDIS_HOST")
	_ = v.BindEnv("redis.password", "REDIS_PASSWORD")
	_ = v.BindEnv("redis.port", "REDIS_PORT")
	_ = v.BindEnv("redis.db", "REDIS_DB")
	_ = v.BindEnv("redis.session_prefix", "REDIS_SESSION_PREFIX")

	_ = v.BindEnv("jwt.expire", "JWT_EXPIRE")
	_ = v.BindEnv("jwt.secret", "JWT_SECRET")
	_ = v.BindEnv("jwt.session_expiration", "JWT_SESSION_EXPIRATION")

	_ = v.BindEnv("s3.endpoint", "S3_ENDPOINT")
	_ = v.BindEnv("s3.region", "S3_REGION")
	_ = v.BindEnv("s3.bucket", "S3_BUCKET")
	_ = v.BindEnv("s3.access_key", "S3_ACCESS_KEY")
	_ = v.BindEnv("s3.secret_key", "S3_SECRET_KEY")
	_ = v.BindEnv("s3.use_ssl", "S3_USE_SSL")

	_ = v.BindEnv("nextcloud.base_url", "NEXTCLOUD_BASE_URL")
	_ = v.BindEnv("nextcloud.username", "NEXTCLOUD_USERNAME")
	_ = v.BindEnv("nextcloud.password", "NEXTCLOUD_PASSWORD")
	_ = v.BindEnv("nextcloud.room_prefix", "NEXTCLOUD_ROOM_PREFIX")
	_ = v.BindEnv("nextcloud.timeout", "NEXTCLOUD_TIMEOUT")
	_ = v.BindEnv("nextcloud.talk_base_url", "NEXTCLOUD_TALK_BASE_URL")

	_ = v.BindEnv("github.webhook_secret", "GITHUB_WEBHOOK_SECRET")
	_ = v.BindEnv("github.base_url", "GITHUB_BASE_URL")
	_ = v.BindEnv("github.repository_owner", "GITHUB_REPOSITORY_OWNER")
	_ = v.BindEnv("github.repository_name", "GITHUB_REPOSITORY_NAME")
	_ = v.BindEnv("github.project_id", "GITHUB_PROJECT_ID")
	_ = v.BindEnv("github.actor_user_id", "GITHUB_ACTOR_USER_ID")
	_ = v.BindEnv("github.task_key_pattern", "GITHUB_TASK_KEY_PATTERN")

	_ = v.BindEnv("rabbitmq.url", "RABBITMQ_URL")
	_ = v.BindEnv("rabbitmq.exchange", "RABBITMQ_EXCHANGE")
	_ = v.BindEnv("rabbitmq.meeting_recordings_queue", "RABBITMQ_MEETING_RECORDINGS_QUEUE")
	_ = v.BindEnv("rabbitmq.ml_results_queue", "RABBITMQ_ML_RESULTS_QUEUE")
	_ = v.BindEnv("rabbitmq.ml_intake_queue", "RABBITMQ_ML_INTAKE_QUEUE")
	_ = v.BindEnv("rabbitmq.dead_letter_exchange", "RABBITMQ_DEAD_LETTER_EXCHANGE")
	_ = v.BindEnv("rabbitmq.prefetch_count", "RABBITMQ_PREFETCH_COUNT")
	_ = v.BindEnv("rabbitmq.retry_delay", "RABBITMQ_RETRY_DELAY")

	_ = v.BindEnv("oauth.yandex.client_id", "YANDEX_CLIENT_ID")
	_ = v.BindEnv("oauth.yandex.client_secret", "YANDEX_CLIENT_SECRET")
	_ = v.BindEnv("oauth.yandex.redirect_url", "YANDEX_REDIRECT_URL")
	_ = v.BindEnv("oauth.yandex.auth_url", "YANDEX_AUTH_URL")
	_ = v.BindEnv("oauth.yandex.token_url", "YANDEX_TOKEN_URL")
	_ = v.BindEnv("oauth.yandex.user_info_url", "YANDEX_USER_INFO_URL")
	_ = v.BindEnv("oauth.yandex.scopes", "YANDEX_SCOPES")
}

func withDecodeHooks() viper.DecoderConfigOption {
	return func(dc *mapstructure.DecoderConfig) {
		dc.DecodeHook = mapstructure.ComposeDecodeHookFunc(
			mapstructure.StringToTimeDurationHookFunc(),
			mapstructure.StringToSliceHookFunc(","),
		)
	}
}
