package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/config"
	"github.com/serdeshnow/bezum-hack-2026/backend/internal/infra/logger"
)

type Client struct {
	conn      *amqp.Connection
	channel   *amqp.Channel
	cfg       config.RabbitMQConfig
	logger    *logger.Logger
	closeOnce sync.Once
}

func MustNew(cfg config.RabbitMQConfig, log *logger.Logger) *Client {
	client, err := New(cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("failed to initialize rabbitmq client")
		panic(err)
	}
	return client
}

func New(cfg config.RabbitMQConfig, log *logger.Logger) (*Client, error) {
	conn, err := amqp.Dial(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("dial rabbitmq: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("create rabbitmq channel: %w", err)
	}

	if err := ch.Qos(cfg.PrefetchCount, 0, false); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("set rabbitmq qos: %w", err)
	}

	client := &Client{
		conn:    conn,
		channel: ch,
		cfg:     cfg,
		logger:  log,
	}

	if err := client.declareInfrastructure(); err != nil {
		client.Close()
		return nil, err
	}

	return client, nil
}

func (c *Client) declareInfrastructure() error {
	if err := c.channel.ExchangeDeclare(c.cfg.Exchange, "direct", true, false, false, false, nil); err != nil {
		return fmt.Errorf("declare rabbitmq exchange: %w", err)
	}
	if err := c.channel.ExchangeDeclare(c.cfg.DeadLetterExchange, "direct", true, false, false, false, nil); err != nil {
		return fmt.Errorf("declare rabbitmq dead-letter exchange: %w", err)
	}

	queues := []struct {
		name       string
		routingKey string
	}{
		{name: c.cfg.MeetingRecordingsQueue, routingKey: c.cfg.MeetingRecordingsQueue},
		{name: c.cfg.MLIntakeQueue, routingKey: c.cfg.MLIntakeQueue},
		{name: c.cfg.MLResultsQueue, routingKey: c.cfg.MLResultsQueue},
	}

	for _, queue := range queues {
		if _, err := c.channel.QueueDeclare(queue.name, true, false, false, false, amqp.Table{
			"x-dead-letter-exchange":    c.cfg.DeadLetterExchange,
			"x-dead-letter-routing-key": queue.name + ".dead",
		}); err != nil {
			return fmt.Errorf("declare rabbitmq queue %s: %w", queue.name, err)
		}
		if err := c.channel.QueueBind(queue.name, queue.routingKey, c.cfg.Exchange, false, nil); err != nil {
			return fmt.Errorf("bind rabbitmq queue %s: %w", queue.name, err)
		}
		if _, err := c.channel.QueueDeclare(queue.name+".dead", true, false, false, false, nil); err != nil {
			return fmt.Errorf("declare rabbitmq dead queue %s: %w", queue.name, err)
		}
		if err := c.channel.QueueBind(queue.name+".dead", queue.name+".dead", c.cfg.DeadLetterExchange, false, nil); err != nil {
			return fmt.Errorf("bind rabbitmq dead queue %s: %w", queue.name, err)
		}
	}

	return nil
}

func (c *Client) PublishJSON(ctx context.Context, routingKey string, payload any, headers amqp.Table) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal rabbitmq payload: %w", err)
	}

	return c.channel.PublishWithContext(ctx, c.cfg.Exchange, routingKey, false, false, amqp.Publishing{
		ContentType:  "application/json",
		DeliveryMode: amqp.Persistent,
		Timestamp:    time.Now(),
		Headers:      headers,
		Body:         body,
	})
}

func (c *Client) Consume(queue string, consumer string) (<-chan amqp.Delivery, error) {
	deliveries, err := c.channel.Consume(queue, consumer, false, false, false, false, nil)
	if err != nil {
		return nil, fmt.Errorf("consume rabbitmq queue %s: %w", queue, err)
	}
	return deliveries, nil
}

func (c *Client) QueueNames() (meetingRecordings string, mlIntake string, mlResults string) {
	return c.cfg.MeetingRecordingsQueue, c.cfg.MLIntakeQueue, c.cfg.MLResultsQueue
}

func (c *Client) RetryDelay() time.Duration {
	return c.cfg.RetryDelay
}

func (c *Client) Close() {
	c.closeOnce.Do(func() {
		if c.channel != nil {
			_ = c.channel.Close()
		}
		if c.conn != nil {
			_ = c.conn.Close()
		}
	})
}
