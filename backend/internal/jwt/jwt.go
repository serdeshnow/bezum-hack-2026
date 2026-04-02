package jwt

import (
	"errors"
	"fmt"
	"time"

	gjwt "github.com/golang-jwt/jwt/v5"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Manager struct {
	secret []byte
	expire time.Duration
	logger *logger.Logger
}

type Claims struct {
	UserID    int    `json:"user_id"`
	Role      string `json:"role"`
	SessionID string `json:"session_id"`
	gjwt.RegisteredClaims
}

func MustNew(cfg config.JWTConfig, log *logger.Logger) *Manager {
	if cfg.Secret == "" {
		err := errors.New("jwt secret is required")
		log.Error().Err(err).Msg("failed to initialize jwt manager")
		panic(err)
	}

	return &Manager{
		secret: []byte(cfg.Secret),
		expire: cfg.Expire,
		logger: log,
	}
}

func (m *Manager) IssueToken(userID int, role, sessionID string) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.expire)
	claims := Claims{
		UserID:    userID,
		Role:      role,
		SessionID: sessionID,
		RegisteredClaims: gjwt.RegisteredClaims{
			ExpiresAt: gjwt.NewNumericDate(expiresAt),
			IssuedAt:  gjwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	token := gjwt.NewWithClaims(gjwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(m.secret)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("sign jwt token: %w", err)
	}

	return signed, expiresAt, nil
}

func (m *Manager) ParseToken(tokenString string) (*Claims, error) {
	token, err := gjwt.ParseWithClaims(tokenString, &Claims{}, func(token *gjwt.Token) (any, error) {
		if _, ok := token.Method.(*gjwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return m.secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("parse jwt token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid jwt token")
	}

	return claims, nil
}
