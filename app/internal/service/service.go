package service

import (
	"context"

	"github.com/EgorikA4/golang-messenger-app-lab/internal/db"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Service ...
type Service struct {
	proxyproto.UnimplementedCentrifugoProxyServer
	conn    *pgxpool.Pool
	storage *db.Queries
}

// New ...
func New(uri string) (*Service, error) {
	connCfg, err := pgxpool.ParseConfig(uri)
	if err != nil {
		return nil, err
	}

	conn, err := pgxpool.NewWithConfig(context.Background(), connCfg)
	if err != nil {
		return nil, err
	}

	return &Service{
		conn:    conn,
		storage: db.New(conn),
	}, nil
}
