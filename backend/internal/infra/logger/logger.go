package logger

import (
	"io"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
)

type Config struct {
	Output io.Writer
}

type Logger struct {
	z zerolog.Logger
}

func New(cfg Config) *Logger {
	zerolog.TimeFieldFormat = time.RFC1123
	logLevel := zerolog.InfoLevel
	if cfg.Output == nil {
		cfg.Output = os.Stdout
	}

	if gin.IsDebugging() {
		logLevel = zerolog.DebugLevel
		cfg.Output = zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: "15:04:05",
			NoColor:    false,
		}
	}

	z := zerolog.New(cfg.Output).
		Level(logLevel).
		With().
		Timestamp().
		Logger()

	return &Logger{z: z}
}

func MustNew(cfg Config) *Logger {
	return New(cfg)
}

func (l *Logger) WithComponent(component string) *Logger {
	return &Logger{
		z: l.z.With().
			Str("component", component).
			Logger(),
	}
}

func (l *Logger) Debug() *zerolog.Event {
	return l.z.Debug().CallerSkipFrame(2)
}

func (l *Logger) Info() *zerolog.Event {
	return l.z.Info().CallerSkipFrame(2)
}

func (l *Logger) Warn() *zerolog.Event {
	return l.z.Warn().CallerSkipFrame(2)
}

func (l *Logger) Error() *zerolog.Event {
	return l.z.Error().CallerSkipFrame(2)
}
